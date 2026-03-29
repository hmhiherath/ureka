import time
import logging
import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from pydantic import ValidationError

# 1. Initialize the Flask App
app = Flask(__name__)

# 2. Set Configuration (Docker-friendly)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'SQLALCHEMY_DATABASE_URI', 
    'postgresql://user:password@localhost/triage_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 3. Import Local Modules
# Ensure these files exist in the same /backend folder
from database import db, Patient
from heap_manager import TriageHeap
from triage_logic import calculate_base_severity
from schema import PatientCreate, PatientResponse 

# 4. Initialize Extensions
db.init_app(app)
# Use 'threading' or 'eventlet' for async mode
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
triage_heap = TriageHeap()

# 5. Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Security token for the escalation worker
WORKER_SECRET = os.environ.get('WORKER_SECRET', "super_secret_triage_key_123")

# =====================================================================
# STARTUP & DATABASE HYDRATION (With Retry Logic for Docker)
# =====================================================================
with app.app_context():
    retries = 30
    connected = False
    while retries > 0 and not connected:
        try:
            db.create_all()
            logger.info("✅ Database connection established and tables verified.")
            connected = True
        except Exception as e:
            retries -= 1
            logger.warning(f"⚠️ Database not ready... retrying in 5s ({retries} attempts left)")
            time.sleep(5)
    
    if not connected:
        logger.error("❌ FATAL: Could not connect to database after 10 attempts.")
        # We don't exit here to allow Docker to restart the container automatically
    else:
        try:
            # Load patients with 'Waiting' status back into the Max-Heap
            waiting_patients = Patient.query.filter_by(status="Waiting").all()
            triage_heap.sync_from_db(waiting_patients)
            logger.info(f"🚀 System Hydrated: {len(waiting_patients)} patients loaded into Max-Heap.")
        except Exception as e:
            logger.error(f"❌ Hydration Error: {str(e)}")

# =====================================================================
# REST API ROUTES
# =====================================================================

@app.route('/api/trigger_escalation', methods=['POST'])
def trigger_escalation():
    """Triggered by escalation_worker.py to update priority based on wait time."""
    auth_header = request.headers.get('Authorization')
    if auth_header != f"Bearer {WORKER_SECRET}":
        return jsonify({"error": "Unauthorized"}), 401

    try:
        updated = triage_heap.escalate_priorities(threshold_seconds=1800) # 30 mins
        if updated:
            logger.info("📢 Escalation applied via external trigger.")
            ordered_ids = triage_heap.get_sorted_ids()
            for pid in ordered_ids:
                patient = Patient.query.get(pid)
                patient.escalated = True 
            db.session.commit()
            broadcast_queue()
            return jsonify({"message": "Escalation successful"}), 200
        return jsonify({"message": "No patients required escalation"}), 200
    except Exception as e:
        logger.error(f"❌ Escalation API Error: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/api/reports/shift', methods=['GET'])
def get_shift_report():
    """Returns all treated patients for the ShiftReport.jsx component."""
    try:
        treated = Patient.query.filter_by(status="Treated").order_by(Patient.arrival_time.desc()).all()
        payload = []
        for p in treated:
            payload.append({
                "id": p.id,
                "name": p.name,
                "symptoms": [s.strip() for s in p.symptoms.split(',')] if p.symptoms else [],
                "severity_score": p.severity_score,
                "arrival_time": p.arrival_time.isoformat(),
                "escalated": p.escalated
            })
        return jsonify({"patients": payload}), 200
    except Exception as e:
        logger.error(f"❌ Report API Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# =====================================================================
# WEBSOCKET EVENT HANDLERS
# =====================================================================

@socketio.on('connect')
def handle_connect():
    logger.info(f"🔌 Client connected: {request.sid}")
    send_queue_to_client(request.sid)

@socketio.on('new_patient')
def handle_new_patient(raw_data):
    try:
        # Validate data against Pydantic schema
        validated_data = PatientCreate(**raw_data)
        
        # Calculate Priority Score
        score = calculate_base_severity(
            age=validated_data.age,
            pain_level=validated_data.pain_level,
            vitals=validated_data.vitals.model_dump(), # Use model_dump for Pydantic v2
            symptoms=validated_data.symptoms,
            conditions=validated_data.conditions
        )
        
        # Save to PostgreSQL
        new_patient = Patient(
            name=validated_data.name,
            age=validated_data.age,
            gender=validated_data.gender,
            symptoms=", ".join(validated_data.symptoms),
            conditions=", ".join(validated_data.conditions) if validated_data.conditions else None,
            heart_rate=validated_data.vitals.hr,
            sbp=validated_data.vitals.sbp,
            dbp=validated_data.vitals.dbp,
            temp=validated_data.vitals.temp,
            pain_level=validated_data.pain_level,
            severity_score=score,
            status="Waiting"
        )
        
        db.session.add(new_patient)
        db.session.commit()
        
        # Insert into Max-Heap Algorithm
        triage_heap.insert(new_patient.id, score, new_patient.arrival_time)
        logger.info(f"🆕 Patient {new_patient.id} added. Score: {score}")
        
        broadcast_queue()

    except ValidationError as e:
        logger.error(f"❌ Schema Validation Error: {e.json()}")
        emit('error', {'message': 'Invalid data formats.'})
    except Exception as e:
        logger.error(f"❌ Error adding patient: {str(e)}")
        db.session.rollback()

@socketio.on('treat_next')
def handle_treat_next():
    """Pops the highest priority patient from the Max-Heap."""
    try:
        top_id = triage_heap.get_top_patient_id()
        if top_id:
            p = Patient.query.get(top_id)
            p.status = "Treated"
            db.session.commit()
            
            triage_heap.extract_next() # Remove from heap
            logger.info(f"👨‍⚕️ Patient {top_id} ({p.name}) sent to treatment.")
            
            emit('patient_called', {'id': p.id, 'name': p.name}, broadcast=True)
            broadcast_queue()
    except Exception as e:
        logger.error(f"❌ Error calling patient: {str(e)}")
        db.session.rollback()

# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

def broadcast_queue():
    """Sends the current state of the Max-Heap to all connected clients."""
    ordered_ids = triage_heap.get_sorted_ids()
    queue_data = build_queue_payload(ordered_ids)
    socketio.emit('update_queue', {'queue': queue_data, 'total_waiting': len(ordered_ids)})

def send_queue_to_client(sid):
    """Sends current state only to the specific client that just connected."""
    ordered_ids = triage_heap.get_sorted_ids()
    queue_data = build_queue_payload(ordered_ids)
    emit('update_queue', {'queue': queue_data, 'total_waiting': len(ordered_ids)}, room=sid)

def build_queue_payload(ordered_ids):
    """Maps database objects to JSON-serializable dictionaries."""
    now = time.time()
    payload = []
    for pid in ordered_ids:
        p = Patient.query.get(pid)
        if not p: continue
        
        wait_time = int((now - p.arrival_time.timestamp()) / 60)
        payload.append({
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "symptoms": [s.strip() for s in p.symptoms.split(',')] if p.symptoms else [],
            "conditions": [c.strip() for c in p.conditions.split(',')] if p.conditions else [],
            "vitals": {"hr": p.heart_rate, "sbp": p.sbp, "dbp": p.dbp, "temp": p.temp},
            "pain_level": p.pain_level,
            "arrival_time": p.arrival_time.isoformat(),
            "severity_score": p.severity_score,
            "status": p.status,
            "escalated": p.escalated,
            "wait_time_mins": wait_time
        })
    return payload

if __name__ == '__main__':
    # host='0.0.0.0' is required for Docker visibility
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)

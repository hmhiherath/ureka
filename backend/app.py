import time
import logging
import os
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from pydantic import ValidationError

# 1. App Setup & Docker-Ready Config
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'SQLALCHEMY_DATABASE_URI', 
    'postgresql://user:password@localhost/triage_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 2. Import Local Modules (After config is set)
from database import db, Patient
from heap_manager import TriageHeap
from triage_logic import calculate_base_severity
from schema import PatientCreate, PatientResponse 

# 3. Initialize Extensions
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
triage_heap = TriageHeap()

# 4. Logging Configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Security token for the external worker
WORKER_SECRET = os.environ.get('WORKER_SECRET', "super_secret_triage_key_123")

# --- Startup & State Hydration ---
with app.app_context():
    db.create_all()
    waiting_patients = Patient.query.filter_by(status="Waiting").all()
    triage_heap.sync_from_db(waiting_patients)
    logger.info(f"System Hydrated: {len(waiting_patients)} patients loaded.")

# --- API Routes ---

@app.route('/api/trigger_escalation', methods=['POST'])
def trigger_escalation():
    auth_header = request.headers.get('Authorization')
    if auth_header != f"Bearer {WORKER_SECRET}":
        return jsonify({"error": "Unauthorized"}), 401

    try:
        updated = triage_heap.escalate_priorities(threshold_seconds=1800)
        if updated:
            logger.info("External trigger: Escalation applied.")
            ordered_ids = triage_heap.get_sorted_ids()
            for pid in ordered_ids:
                patient = Patient.query.get(pid)
                patient.escalated = True 
            db.session.commit()
            broadcast_queue()
            return jsonify({"message": "Escalation successful"}), 200
        return jsonify({"message": "No patients required escalation"}), 200
    except Exception as e:
        logger.error(f"Escalation Error: {str(e)}")
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/api/reports/shift', methods=['GET'])
def get_shift_report():
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
        return {"patients": payload}, 200
    except Exception as e:
        return {"error": str(e)}, 500

# --- WebSocket Event Handlers ---

@socketio.on('connect')
def handle_connect():
    send_queue_to_client(request.sid)

@socketio.on('new_patient')
def handle_new_patient(raw_data):
    try:
        validated_data = PatientCreate(**raw_data)
        score = calculate_base_severity(
            age=validated_data.age,
            pain_level=validated_data.pain_level,
            vitals=validated_data.vitals.dict(), 
            symptoms=validated_data.symptoms,
            conditions=validated_data.conditions
        )
        new_patient = Patient(
            name=validated_data.name, age=validated_data.age, gender=validated_data.gender,
            symptoms=", ".join(validated_data.symptoms),
            conditions=", ".join(validated_data.conditions) if validated_data.conditions else None,
            heart_rate=validated_data.vitals.hr, sbp=validated_data.vitals.sbp,
            dbp=validated_data.vitals.dbp, temp=validated_data.vitals.temp,
            pain_level=validated_data.pain_level, severity_score=score
        )
        db.session.add(new_patient)
        db.session.commit()
        triage_heap.insert(new_patient.id, score, new_patient.arrival_time)
        broadcast_queue()
    except ValidationError as e:
        emit('error', {'message': 'Validation failed', 'details': e.errors()})
    except Exception as e:
        db.session.rollback()
        emit('error', {'message': 'Internal Error'})

@socketio.on('treat_next')
def handle_treat_next():
    try:
        top_id = triage_heap.get_top_patient_id()
        if top_id:
            p = Patient.query.get(top_id)
            p.status = "Treated"
            db.session.commit()
            triage_heap.extract_next()
            broadcast_queue()
    except Exception as e:
        db.session.rollback()

# --- Helper Functions ---

def broadcast_queue():
    ordered_ids = triage_heap.get_sorted_ids()
    queue_data = build_queue_payload(ordered_ids)
    emit('update_queue', {'queue': queue_data, 'total_waiting': len(ordered_ids)}, broadcast=True)

def send_queue_to_client(sid):
    ordered_ids = triage_heap.get_sorted_ids()
    queue_data = build_queue_payload(ordered_ids)
    emit('update_queue', {'queue': queue_data, 'total_waiting': len(ordered_ids)}, to=sid)

def build_queue_payload(ordered_ids):
    patients = [Patient.query.get(pid) for pid in ordered_ids]
    now = time.time()
    payload = []
    for p in patients:
        wait_time = int((now - p.arrival_time.timestamp()) / 60)
        payload.append({
            "id": p.id, "name": p.name, "age": p.age, "gender": p.gender,
            "symptoms": [s.strip() for s in p.symptoms.split(',')] if p.symptoms else [],
            "conditions": [c.strip() for c in p.conditions.split(',')] if p.conditions else [],
            "vitals": {"hr": p.heart_rate, "sbp": p.sbp, "dbp": p.dbp, "temp": p.temp},
            "pain_level": p.pain_level, "arrival_time": p.arrival_time.isoformat(),
            "severity_score": p.severity_score, "status": p.status,
            "escalated": p.escalated, "wait_time_mins": wait_time
        })
    return payload

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
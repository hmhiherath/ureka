import time
import logging
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from pydantic import ValidationError

# 1. Initialize the Flask App
app = Flask(__name__)

# 2. Import Local Modules
from heap_manager import TriageHeap
from triage_logic import calculate_base_severity
from schema import PatientCreate

# 3. Initialize Extensions & In-Memory State
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
triage_heap = TriageHeap()

# --- NEW: In-Memory Database ---
patients_db = {}
patient_id_counter = 1
# -------------------------------

# 4. Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Security token for the escalation worker
WORKER_SECRET = os.environ.get('WORKER_SECRET', "super_secret_triage_key_123")


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
                if pid in patients_db:
                    patients_db[pid]["escalated"] = True 
            broadcast_queue()
            return jsonify({"message": "Escalation successful"}), 200
        return jsonify({"message": "No patients required escalation"}), 200
    except Exception as e:
        logger.error(f"❌ Escalation API Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/api/reports/shift', methods=['GET'])
def get_shift_report():
    """Returns all treated patients for the ShiftReport.jsx component."""
    try:
        # Filter and sort our dictionary instead of querying a DB
        treated = [p for p in patients_db.values() if p["status"] == "Treated"]
        treated.sort(key=lambda x: x["arrival_time"], reverse=True)
        
        payload = []
        for p in treated:
            payload.append({
                "id": p["id"],
                "name": p["name"],
                "symptoms": [s.strip() for s in p["symptoms"].split(',')] if p["symptoms"] else [],
                "severity_score": p["severity_score"],
                "arrival_time": p["arrival_time"].isoformat(),
                "escalated": p["escalated"]
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
    global patient_id_counter
    try:
        # Validate data against Pydantic schema
        validated_data = PatientCreate(**raw_data)
        
        # Calculate Priority Score
        score = calculate_base_severity(
            age=validated_data.age,
            pain_level=validated_data.pain_level,
            vitals=validated_data.vitals.model_dump(),
            symptoms=validated_data.symptoms,
            conditions=validated_data.conditions
        )
        
        # Save to In-Memory Dictionary
        new_patient = {
            "id": patient_id_counter,
            "name": validated_data.name,
            "age": validated_data.age,
            "gender": validated_data.gender,
            "symptoms": ", ".join(validated_data.symptoms),
            "conditions": ", ".join(validated_data.conditions) if validated_data.conditions else None,
            "heart_rate": validated_data.vitals.hr,
            "sbp": validated_data.vitals.sbp,
            "dbp": validated_data.vitals.dbp,
            "temp": validated_data.vitals.temp,
            "pain_level": validated_data.pain_level,
            "severity_score": score,
            "arrival_time": datetime.utcnow(),
            "status": "Waiting",
            "escalated": False
        }
        
        patients_db[patient_id_counter] = new_patient
        
        # Insert into Max-Heap Algorithm
        triage_heap.insert(patient_id_counter, score, new_patient["arrival_time"])
        logger.info(f"🆕 Patient {patient_id_counter} added. Score: {score}")
        
        patient_id_counter += 1
        broadcast_queue()

    except ValidationError as e:
        logger.error(f"❌ Schema Validation Error: {e.json()}")
        emit('error', {'message': 'Invalid data formats.'})
    except Exception as e:
        logger.error(f"❌ Error adding patient: {str(e)}")

@socketio.on('treat_next')
def handle_treat_next():
    """Pops the highest priority patient from the Max-Heap."""
    try:
        top_id = triage_heap.get_top_patient_id()
        if top_id and top_id in patients_db:
            p = patients_db[top_id]
            p["status"] = "Treated"
            
            triage_heap.extract_next() # Remove from heap
            logger.info(f"👨‍⚕️ Patient {top_id} ({p['name']}) sent to treatment.")
            
            emit('patient_called', {'id': p["id"], 'name': p["name"]}, broadcast=True)
            broadcast_queue()
    except Exception as e:
        logger.error(f"❌ Error calling patient: {str(e)}")


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
    """Maps dictionary objects to JSON-serializable structures."""
    now = time.time()
    payload = []
    for pid in ordered_ids:
        p = patients_db.get(pid)
        if not p: continue
        
        wait_time = int((now - p["arrival_time"].timestamp()) / 60)
        payload.append({
            "id": p["id"],
            "name": p["name"],
            "age": p["age"],
            "gender": p["gender"],
            "symptoms": [s.strip() for s in p["symptoms"].split(',')] if p["symptoms"] else [],
            "conditions": [c.strip() for c in p["conditions"].split(',')] if p["conditions"] else [],
            "vitals": {"hr": p["heart_rate"], "sbp": p["sbp"], "dbp": p["dbp"], "temp": p["temp"]},
            "pain_level": p["pain_level"],
            "arrival_time": p["arrival_time"].isoformat(),
            "severity_score": p["severity_score"],
            "status": p["status"],
            "escalated": p["escalated"],
            "wait_time_mins": wait_time
        })
    return payload

if __name__ == '__main__':
    # host='0.0.0.0' is required for Docker visibility
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
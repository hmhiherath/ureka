from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize the SQLAlchemy instance
db = SQLAlchemy()

class Patient(db.Model):
    """
    PostgreSQL Model for storing Emergency Room Patients.
    This acts as the persistent storage, while the Python Max-Heap handles real-time sorting.
    """
    __tablename__ = 'patients'

    # --- Primary Key ---
    id = db.Column(db.Integer, primary_key=True)
    
    # --- Demographics ---
    name = db.Column(db.String(150), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    
    # --- Clinical Context (Stored as comma-separated strings for SQL) ---
    # We use Text instead of String(255) to ensure we don't truncate long lists of symptoms
    symptoms = db.Column(db.Text, nullable=False)
    conditions = db.Column(db.Text, nullable=True)
    
    # --- Vital Signs ---
    # Separated into precise columns to support the Mean Arterial Pressure (MAP) calculation
    heart_rate = db.Column(db.Integer, nullable=False)
    sbp = db.Column(db.Integer, nullable=False)  # Systolic Blood Pressure
    dbp = db.Column(db.Integer, nullable=False)  # Diastolic Blood Pressure
    temp = db.Column(db.Float, nullable=False)   # Temperature in Celsius
    
    # --- Triage Scoring & Status ---
    pain_level = db.Column(db.Integer, nullable=False)
    
    # Stored as a Float to capture the exact decimal precision of the ATSS algorithm
    severity_score = db.Column(db.Float, nullable=False)
    
    # Uses UTC time to prevent timezone bugs when calculating wait times
    arrival_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # State tracking for the application (e.g., "Waiting" vs "Treated")
    status = db.Column(db.String(20), default="Waiting", nullable=False)
    
    # Tracks if the background worker has automatically increased this patient's priority
    escalated = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        """Provides a readable string representation for debugging."""
        return f"<Patient {self.id} | Name: {self.name} | Status: {self.status} | Score: {self.severity_score}>"
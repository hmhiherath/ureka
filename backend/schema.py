from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --- Sub-Schema for Vitals ---
# Creating a nested model makes it perfectly match the `vitals: Dict[str, float]` 
# expected by your calculate_base_severity() function.
class VitalsSchema(BaseModel):
    hr: int = Field(..., gt=0, description="Heart rate in beats per minute")
    sbp: int = Field(..., gt=0, description="Systolic blood pressure (top number)")
    dbp: int = Field(..., gt=0, description="Diastolic blood pressure (bottom number)")
    temp: float = Field(..., gt=30.0, lt=45.0, description="Body temperature in Celsius")

# --- Schema for incoming data from the frontend (Nurse Tablet) ---
class PatientCreate(BaseModel):
    name: str = Field(..., description="Patient's full name")
    age: int = Field(..., gt=0, description="Patient's age in years")
    gender: str = Field(..., description="Patient's gender (e.g., Male, Female, Other)")
    
    # Updated to Lists to support the Synergy Matrix logic
    symptoms: List[str] = Field(..., description="List of symptoms (e.g., ['chest_pain', 'fever'])")
    conditions: Optional[List[str]] = Field(default_factory=list, description="Pre-existing conditions (e.g., ['asthma', 'diabetes'])")
    
    # Nested vitals model
    vitals: VitalsSchema = Field(..., description="Current vital signs")
    
    # Pain level restricted to exactly 1 through 10
    pain_level: int = Field(..., ge=1, le=10, description="Pain level on a scale of 1 to 10")
    
    # UTC time is best practice for databases to avoid timezone bugs
    arrival_time: datetime = Field(default_factory=datetime.utcnow, description="Time of arrival at the ER")

# --- Schema for the data the backend will store and return (Patient Monitor/DB) ---
class PatientResponse(PatientCreate):
    id: int = Field(..., description="Unique integer identifier for the PostgreSQL database")
    severity_score: float = Field(..., description="Calculated Advanced Triage Severity Score (ATSS)")
    status: str = Field(default="Waiting", description="Current status in the queue (e.g., Waiting, Treated)")
    escalated: bool = Field(default=False, description="Indicates if the priority was automatically escalated")
    wait_time_mins: Optional[int] = Field(None, description="Calculated live wait time for the frontend monitor")

    class Config:
        # This tells Pydantic to seamlessly read data from your SQLAlchemy DB Models
        orm_mode = True
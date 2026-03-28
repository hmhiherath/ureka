import math
from typing import List, Dict

# --- Clinical Configuration & Weights ---
SYMPTOM_WEIGHTS = {
    "chest_pain": 50, "shortness_of_breath": 45, "severe_bleeding": 60,
    "fever": 10, "rash": 5, "headache": 15
}

CONDITION_WEIGHTS = {
    "asthma": 20, "hypertension": 15, "diabetes": 15, "heart_disease": 30
}

SYNERGY_MATRIX = {
    ("shortness_of_breath", "asthma"): 2.5,
    ("chest_pain", "heart_disease"): 3.0,
    ("fever", "diabetes"): 1.5
}

def calculate_base_severity(
    age: int, 
    pain_level: int, 
    vitals: Dict[str, float], 
    symptoms: List[str], 
    conditions: List[str]
) -> float:
    """
    Calculates and returns ONLY the final ATSS float for Max-Heap sorting.
    """
    # Bound pain level
    pain_level = max(1, min(10, pain_level))

    # 1. Vitals Deviation Function Φ(V)
    map_bp = (vitals['sbp'] + 2 * vitals['dbp']) / 3
    
    d_hr = ((vitals['hr'] - 80) / 40) ** 3
    d_map = ((90 - map_bp) / 30) ** 3
    d_temp = ((vitals['temp'] - 37.0) ** 2) * 1.5
    
    w1, w2, w3 = 10, 15, 5 
    phi_v = (w1 * abs(d_hr)) + (w2 * abs(d_map)) + (w3 * d_temp)

    # 2. Clinical Context Function Ω(C, S)
    omega_c_s = sum(SYMPTOM_WEIGHTS.get(s, 0) for s in symptoms)
    
    for condition in conditions:
        cond_weight = CONDITION_WEIGHTS.get(condition, 0)
        synergy_multiplier = 1.0
        for symptom in symptoms:
            if (symptom, condition) in SYNERGY_MATRIX:
                synergy_multiplier = max(synergy_multiplier, SYNERGY_MATRIX[(symptom, condition)])
        omega_c_s += cond_weight * synergy_multiplier

    # 3. Demographic & Pain Multiplier M(A, P)
    age_factor = 1 + math.exp(0.05 * abs(age - 35))
    pain_factor = 1 + 0.1 * math.log(pain_level + 1)
    m_a_p = age_factor * pain_factor

    # Final Calculation
    final_base_score = (phi_v + omega_c_s) * m_a_p

    return round(float(final_base_score), 4)
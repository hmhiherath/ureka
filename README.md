# ureka# 🏥 Smart Emergency Room Triage System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Backend-Flask_&_WebSockets-000000?logo=flask)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)

A real-time, full-stack medical triage application designed to dynamically prioritize Emergency Room patients using an Advanced Triage Severity Score (ATSS) and a highly optimized Max-Heap data structure.

**Developed for Coursework:** KUHNDSE253F

---

## 📖 Project Overview

In high-traffic emergency departments, static "first-come, first-served" queues cost lives. This system introduces a dynamic, real-time priority queue. When a triage nurse inputs a patient's vitals, symptoms, and medical history, the system calculates an Advanced Triage Severity Score (ATSS) and instantly re-balances the hospital's priority queue using an $O(\log n)$ Max-Heap algorithm. 

The application features a dual-interface design: a secure administrative tablet for nurses and a high-contrast Kiosk Monitor for the public waiting room.

## ✨ Core Features

* **Advanced Algorithmic Sorting:** Utilizes a custom Python Max-Heap to ensure the highest-priority patient is always accessible in $O(1)$ time, with insertions and extractions strictly maintained at $O(\log n)$ time complexity.
* **ATSS Calculator:** A mathematical severity engine that factors in Mean Arterial Pressure (MAP) deviations, pain scales, and a "Synergy Matrix" for compounding symptoms (e.g., Asthma + Shortness of Breath).
* **Real-Time WebSocket Sync:** Changes made on the nurse's tablet are instantly broadcasted to the public monitor without requiring a page refresh.
* **Automated Priority Escalation:** A background worker continuously scans the heap, automatically escalating the priority of patients who exceed safe wait-time thresholds.
* **Persistent State Hydration:** Integrates an in-memory Heap with a PostgreSQL database. If the server crashes, the exact queue state is instantly rebuilt upon restart.
* **Historical Shift Reports:** A dedicated REST endpoint to generate and print end-of-shift summaries of all treated patients.

---

## 🛠️ System Architecture & Tech Stack

### Frontend (React.js)
* **Routing:** `react-router-dom` for Multi-Page App (MPA) simulation (Nurse Dashboard vs. Public Monitor).
* **Real-time:** `socket.io-client` utilizing a Singleton Hook pattern to prevent memory leaks.
* **Styling:** Custom CSS with CSS variables, Flexbox/Grid layouts, and `@media print` directives for shift reports.

### Backend (Python / Flask)
* **API & Sockets:** `Flask` and `Flask-SocketIO` running on Eventlet/Gevent for asynchronous concurrency.
* **Data Validation:** `Pydantic` acts as a strict typing gatekeeper, sanitizing incoming JSON payloads before they hit the algorithm.
* **Database Engine:** `PostgreSQL` managed via `Flask-SQLAlchemy` (ORM) for robust, ACID-compliant data storage.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v16+)
* Python (3.9+)
* PostgreSQL running locally or via Docker

### 1. Database Setup
Ensure PostgreSQL is running and create a blank database named `triage_db`:
```sql
CREATE DATABASE triage_db;
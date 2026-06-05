# MediConnect

MediConnect is a SaaS-based healthcare platform that enables seamless appointment scheduling, secure doctor-patient communication, and medical record sharing. The platform integrates **Clinical Copilot**, a multi-agent AI chart analysis service for clinical decision support.

## Features

- Appointment scheduling and visit management
- Secure doctor–patient messaging system
- Medical record upload and sharing (reports, prescriptions, images)
- **Clinical Copilot** — multi-agent AI analysis of clinical documents (patients & doctors)
- Role-based authentication (patients, doctors, admin)
- MongoDB indexing + Redis caching for reduced API latency
- Cloud deployment-ready with AWS + Docker

---

## Tech Stack

**Frontend**
- ReactJS
- CSS

**Backend**
- Node.js
- Express.js
- REST APIs

**Database & Caching**
- MongoDB
- Redis

**Clinical Copilot (AI Microservice)**
- Python
- FastAPI
- LiteLLM (Groq)

---

## Services

MediConnect runs as three services:

| Service | Port | Command |
|---------|------|---------|
| React client | 3000 | `cd client && npm start` |
| Node/Express API | 5001 | `cd server && npm start` |
| Clinical Copilot API | 8000 | `cd clinical-copilot && uvicorn api.main:app --port 8000` |

### Backend setup

```bash
cd server
npm install
npm start
```

### Frontend setup

```bash
cd client
npm install
npm start
```

### Clinical Copilot setup

```bash
cd clinical-copilot
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set GROQ_API_KEY and LLM_MODEL=groq/llama-3.3-70b-versatile
uvicorn api.main:app --reload --port 8000
```

The MediConnect server proxies Clinical Copilot at `http://localhost:8000` by default. Override with `COPILOT_API_URL` in the server `.env` if needed.

## Clinical Copilot

Both patients and doctors can access **Clinical Copilot** from the sidebar:

- Patients: `/patient/diagnosis`
- Doctors: `/doctor/copilot`

Flow for both roles:

1. Upload clinical documents (PDF, DOCX, TXT, MD)
2. Review normalized text from InputAgent
3. Run full multi-agent analysis
4. View doctor report, patient summary, risk flags, medications, and timeline

---

**Register Page:-**

<img width="1428" height="792" alt="image" src="https://github.com/user-attachments/assets/aa981fca-622b-4ae3-81b3-86c86b2dd686" />

**Doctor:-**

**Chats-**

<img width="1437" height="814" alt="image" src="https://github.com/user-attachments/assets/fcc3c4e9-6dbd-43a4-98c7-d90b1fa79ccb" />

**Add Availability/Appointment-**

<img width="1138" height="824" alt="image" src="https://github.com/user-attachments/assets/e38d5372-dac1-4c1c-ac7a-3ff267ac746b" />

---

**Patient:-**

**Profile -**

<img width="1437" height="814" alt="image" src="https://github.com/user-attachments/assets/380cf940-d3df-44ae-ac2e-2049efd8f6c9" />

**ML Diagnosis -**

<img width="793" height="807" alt="image" src="https://github.com/user-attachments/assets/c8fb2b9e-6d3d-413e-9db6-04f97078f3b8" />

**Find Doctor -**

<img width="1159" height="749" alt="image" src="https://github.com/user-attachments/assets/3a85f91d-9957-4ab6-bb2a-0b294694ec68" />

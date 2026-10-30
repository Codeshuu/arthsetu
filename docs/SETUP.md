# Arthsetu Setup Guide

## Prerequisites
- Node.js >= 18
- Python >= 3.10
- PostgreSQL >= 14
- Docker (optional)

## Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

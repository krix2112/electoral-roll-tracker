# Electoral Roll Tracker

**Hackathon Project: Snowfrost 2026**  
**Team: Teen Titans**  
**Theme: One Nation One Election**

## Problem Statement
Electoral roll manipulation hides in silent data changes, not in static voter lists. This system tracks and visualizes every change to electoral rolls, making fraud impossible to hide.

## Features
- 📤 Upload electoral roll CSV files
- 🔍 Compare two versions and detect changes
- 🚨 Automatic suspicious pattern detection
- 📊 Visual diff viewer (red/green highlighting)
- 📈 Statistics dashboard
- ⚡ Handles 100K+ records efficiently

## Tech Stack

**Backend:**
- Python 3.10+
- Flask (REST API)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Pandas (Data processing)

**Frontend:**
- React 18+
- Vite (Build tool)
- Tailwind CSS (Styling)
- shadcn/ui (Components)
- React Router (Routing)
- Recharts (Visualizations)

**Deployment:**
- Backend: Railway.app
- Frontend: Vercel
- Database: Railway PostgreSQL

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database credentials
python app.py
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will run on http://localhost:5173

## API Endpoints

### Upload Electoral Roll
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (CSV)
```

### Compare Electoral Rolls
```
POST /api/compare
Content-Type: application/json
Body: {
  "old_upload_id": "uuid1",
  "new_upload_id": "uuid2"
}
```

### Get All Uploads
```
GET /api/uploads
```

## CSV Format Requirements

Electoral roll CSV files must have these columns:
- `voter_id` (string, unique)
- `name` (string)
- `age` (integer)
- `address` (string)
- `registration_date` (YYYY-MM-DD format)

## Team Members

- **Krishna** - Team Leader, Full Stack Developer
- **Vansh** - Backend Developer
- **Hitendra** - Frontend Developer
- **Aarushi** - Frontend Developer

## License

MIT License - Built for Snowfrost Hackathon 2026

<!-- Force update 01/13/2026 18:42:29 -->

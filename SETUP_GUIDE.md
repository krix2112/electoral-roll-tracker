# 🚀 RollDiff Quick Setup Guide

## Prerequisites Check

Before running the system, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ Git installed

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install Flask Flask-CORS Flask-SQLAlchemy SQLAlchemy python-dotenv pandas
```

Or use requirements.txt:
```bash
pip install -r requirements.txt
```

### 4. Initialize Database
```bash
python
>>> from database import db, init_db
>>> from app import app
>>> init_db(app)
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### 5. Generate Test Data
```bash
python scripts/generate_test_data.py
```

### 6. Start Backend Server
```bash
python app.py
```

Backend should now be running on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend should now be running on `http://localhost:5173`

## Quick Test

### Test Backend API
Open browser to: `http://localhost:5000/api/top-anomaly`

You should see JSON response with demo anomaly data.

### Test Frontend
1. Open browser to: `http://localhost:5173/forensic`
2. Click "Investigate Top Anomaly"
3. You should see the forensic dashboard with multi-layer scores

## Troubleshooting

### Backend Issues

**Error: "No module named 'flask'"**
```bash
pip install Flask Flask-CORS Flask-SQLAlchemy
```

**Error: "No module named 'forensics'"**
- Make sure you're in the `backend` directory when running `python app.py`

**Error: Database errors**
```bash
# Delete existing database and recreate
rm instance/electoral_roll_db.sqlite
python
>>> from app import app
>>> from database import db
>>> with app.app_context():
...     db.create_all()
```

### Frontend Issues

**Error: "Cannot find module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "API connection failed"**
- Ensure backend is running on port 5000
- Check VITE_API_BASE_URL in frontend/.env (should be http://localhost:5000)

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=sqlite:///electoral_roll_db.sqlite
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Demo Workflow

### Option 1: Quick Demo (No Upload Required)
1. Start backend and frontend
2. Navigate to `/forensic`
3. Click "Investigate Top Anomaly"
4. System loads pre-configured demo data

### Option 2: Full Demo (With Data Upload)
1. Generate test data: `python backend/scripts/generate_test_data.py`
2. Navigate to `/upload`
3. Upload `demo_data/current_roll_with_anomalies.csv`
4. Upload `demo_data/previous_roll_baseline.csv`
5. Navigate to `/forensic`
6. Click "Investigate Top Anomaly"
7. System analyzes uploaded data

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] `/api/top-anomaly` returns JSON
- [ ] `/forensic` page loads
- [ ] "Investigate Top Anomaly" button works
- [ ] Score gauge displays (circular progress)
- [ ] Module breakdown cards are expandable
- [ ] Evidence cards display with severity badges

## Next Steps

Once everything is running:

1. **Explore the Dashboard** - Click through all the interactive elements
2. **Test with Real Data** - Upload your own CSV files
3. **Customize Weights** - Modify `forensics/fusion.py` to adjust module weights
4. **Add New Modules** - Create additional detection engines
5. **Export Reports** - Implement PDF/Excel export functionality

## Support

If you encounter issues:
1. Check console logs (browser DevTools)
2. Check terminal output (backend and frontend)
3. Verify all dependencies are installed
4. Ensure ports 5000 and 5173 are not in use

---

**Happy Hacking! 🚀**

Built for Snowfrost Hackathon 2026 by Team Teen Titans

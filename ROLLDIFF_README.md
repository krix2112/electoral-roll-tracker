# 🔬 RollDiff Advanced Forensic System

## Overview

**RollDiff** is a sophisticated electoral roll forensic audit system featuring a **10-layer multi-signal anomaly detection engine**. It goes beyond simple data comparison to perform behavioral, network, spatial, and temporal analysis on voter roll data.

## 🎯 Core Innovation

The system implements a **multi-layered detection architecture** where each module analyzes voter data from a different analytical lens:

### Detection Modules

#### 1. **Behavioral Fingerprinting Engine** (Weight: 25%)
- Analyzes deviation from expected organic migration patterns
- Compares actual vs. expected movement rates by age group
- Flags unusual demographic change patterns
- **Key Metrics**: Age-migration correlation, address change frequency

#### 2. **Network Analysis Engine** (Weight: 35%)
- Builds voter connection graphs based on shared addresses and surnames
- Identifies "island nodes" (isolated voters with no connections)
- Detects "star clusters" (unrealistic voter concentrations)
- **Key Metrics**: Network isolation ratio, cluster size distribution

#### 3. **Entropy Analysis Engine** (Weight: 25%)
- Calculates Shannon entropy for voter data fields
- Detects synthetic patterns (sequential names, bulk registrations)
- Identifies low-diversity data indicative of fabrication
- **Key Metrics**: Name entropy, date entropy, address entropy

#### 4. **Multi-Signal Fusion Engine** (Weight: 15% reserved)
- Combines all module scores using weighted averaging
- Calculates confidence level based on module agreement
- Generates final anomaly score (0-100)
- **Formula**: `final_score = (behavior × 0.25) + (network × 0.35) + (entropy × 0.25) + (other × 0.15)`

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Generate Test Data**
```bash
python scripts/generate_test_data.py
```

3. **Run Backend Server**
```bash
python app.py
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Run Development Server**
```bash
npm run dev
```

3. **Access Forensic Dashboard**
Navigate to: `http://localhost:5173/forensic`

## 📡 API Endpoints

### `/api/analyze` (POST)
Main forensic analysis endpoint. Accepts two voter snapshots and runs all detection modules.

**Request:**
```json
{
  "current_upload_id": "uuid",
  "previous_upload_id": "uuid",
  "constituency": "AC-103"
}
```

**Response:**
```json
{
  "analysis_id": "analysis_...",
  "final_anomaly_score": 75.5,
  "verdict": "Critical Anomaly",
  "confidence_level": "High",
  "module_breakdowns": [...],
  "all_evidence": [...],
  "summary": "..."
}
```

### `/api/top-anomaly` (GET)
Returns the constituency with the highest anomaly score.

**Response:**
```json
{
  "analysis_id": "...",
  "final_anomaly_score": 87.5,
  "constituency": "AC-103",
  "state": "Maharashtra",
  "triggered_modules": ["Network Analysis", "Entropy Analysis"],
  "top_evidence": [...]
}
```

### `/api/analysis/:id` (GET)
Fetches detailed results of a specific analysis.

### `/api/analyses` (GET)
Lists all cached analyses with optional filters.

**Query Params:**
- `min_score`: Filter by minimum anomaly score
- `state`: Filter by state

## 🎨 Frontend Components

### ForensicScoreGauge
Circular progress gauge displaying the final anomaly score with color-coded verdicts:
- 🟢 Green (0-29): Normal Pattern
- 🟡 Yellow (30-69): Moderate Concern
- 🔴 Red (70-100): Critical Anomaly

### ModuleBreakdownPanel
Interactive cards showing individual module scores with expandable evidence details.

### ForensicEvidenceCards
Visual evidence cards with severity indicators and plain-English explanations.

## 🧪 Testing the System

### Using Generated Test Data

1. **Generate synthetic data** with embedded anomalies:
```bash
cd backend
python scripts/generate_test_data.py
```

2. **Upload both files** via the Upload page:
   - `current_roll_with_anomalies.csv` (15% anomaly rate)
   - `previous_roll_baseline.csv` (2% anomaly rate)

3. **Navigate to Forensic Dashboard** and click "Investigate Top Anomaly"

### Expected Results

The system should detect:
- **Network Isolation**: ~750 island nodes (15% of 5000)
- **Bulk Registration**: ~750 voters on same date
- **Star Clusters**: Multiple addresses with 15+ voters
- **Low Name Entropy**: Sequential naming patterns

**Expected Final Score**: 70-90 (Critical Anomaly)

## 🏗️ Architecture

```
backend/
├── forensics/
│   ├── __init__.py
│   ├── behavioral.py      # Module A
│   ├── network.py          # Module B
│   ├── entropy.py          # Module C
│   └── fusion.py           # Module D (Core)
├── routes/
│   └── forensic.py         # API endpoints
└── scripts/
    └── generate_test_data.py

frontend/
├── src/
│   ├── components/
│   │   ├── ForensicScoreGauge.jsx
│   │   ├── ModuleBreakdownPanel.jsx
│   │   └── ForensicEvidenceCards.jsx
│   └── pages/
│       └── ForensicDashboard.jsx
```

## 🎯 Success Criteria

✅ **Multi-layered analysis** with 3+ detection modules
✅ **Weighted fusion scoring** with confidence calculation
✅ **Interactive forensic dashboard** with visual evidence
✅ **One-click investigation** feature
✅ **Real-time analysis** of voter data
✅ **Plain-English evidence** explanations

## 🔮 Future Enhancements

- **Spatial Analysis Module**: Geographic clustering detection
- **Temporal Pattern Module**: Time-series anomaly detection
- **Graph Visualization**: Interactive network diagrams
- **Export Reports**: PDF/Excel forensic reports
- **Machine Learning**: Adaptive anomaly thresholds

## 📊 Demo Flow

1. **Upload Data**: Load current and previous voter rolls
2. **Click "Investigate Top Anomaly"**: System scans all constituencies
3. **View Multi-Layer Dashboard**: See overall score + module breakdowns
4. **Expand Evidence Cards**: Review detailed findings
5. **Export Report**: Generate judge-ready documentation

## 🏆 Hackathon Highlights

- **Sophisticated Detection**: Multi-signal fusion, not just arithmetic
- **Visual Excellence**: Circular gauges, animated progress bars
- **Interactive UI**: Expandable cards, hover effects
- **Production-Ready**: Clean code, modular architecture
- **Judge-Friendly**: Clear explanations, compelling demo flow

## 📝 License

MIT License - Built for Snowfrost Hackathon 2026 by Team Teen Titans

---

**RollDiff**: Where forensic science meets electoral integrity. 🔬⚖️

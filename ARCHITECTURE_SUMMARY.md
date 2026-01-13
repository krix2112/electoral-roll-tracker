# Electoral Roll Tracker - Architecture Summary

## 🏗️ Two-Layer Data Architecture

The system has **two clearly separated data layers** that must NOT be mixed:

---

## 📊 Layer 1: Dashboard Aggregation Layer

### Purpose
- Provides **national-level aggregated statistics** for monitoring and oversight
- Uses a **single, comprehensive India-level voter dataset**
- Shows high-level metrics without exposing individual voter data

### Data Source
- **One national CSV file** containing all India voter data
- This is a **read-only reference dataset** for aggregation
- NOT individual uploaded roll files

### APIs Needed

#### 1. `GET /api/stats?state=<state_name>`
**Purpose:** Get aggregated statistics for dashboard

**Returns:**
```json
{
  "voters": {
    "value": "6.2M",           // Formatted count
    "raw": 6200000,            // Raw number
    "change": "-2.3%",         // Change from previous period
    "trend": "down"            // up/down/neutral
  },
  "anomalies": {
    "value": "1245",           // Count of anomalies detected
    "type": "critical"         // severity level
  },
  "audits": {
    "value": "42",             // Number of audits performed
    "type": "info"
  },
  "constituencies": {
    "total": 543,              // Total constituencies
    "with_anomalies": 23       // Constituencies flagged
  },
  "filter_applied": "Maharashtra"
}
```

**What it does:**
- Aggregates from the **national dataset** (NOT from uploaded rolls)
- Filters by state if provided
- Calculates totals, anomalies, constituency counts
- **NEVER returns individual voter records**

---

#### 2. `GET /api/constituencies?state=<state_name>`
**Purpose:** Get constituency-level aggregated data for map visualization

**Returns:**
```json
{
  "constituencies": [
    {
      "id": "ward-15",
      "name": "Municipal Ward 15",
      "total_voters": 45000,
      "anomaly_score": 72,        // 0-100 risk score
      "anomaly_count": 234,
      "state": "Maharashtra"
    }
  ]
}
```

**What it does:**
- Groups national dataset by constituency
- Calculates anomaly scores per constituency
- **NEVER returns individual voter records**

---

### Data That Belongs Here
✅ **Aggregated counts** (total voters, constituency counts)  
✅ **Anomaly statistics** (counts, scores, trends)  
✅ **Constituency metadata** (names, IDs, aggregate stats)  
✅ **State-level summaries**  
✅ **Time-series aggregated data** (for trends)

### Data That Must NOT Be Here
❌ Individual voter records (`VoterRecord` rows)  
❌ Individual voter IDs, names, addresses  
❌ Upload metadata (`ElectoralRoll` records)  
❌ Comparison results (added/deleted/modified records)

---

## 🔍 Layer 2: RollDiff Forensic Layer

### Purpose
- **Forensic analysis** of specific electoral roll changes
- Compares **two uploaded CSV roll versions**
- Identifies suspicious changes (additions, deletions, modifications)
- Used **only in DiffViewer page**

### Data Source
- **Two uploaded CSV files** (old roll vs new roll)
- These are **specific roll versions** uploaded by users
- Stored temporarily for comparison

### APIs Needed

#### 1. `POST /api/upload`
**Purpose:** Upload electoral roll CSV files for comparison

**Request:**
- `file`: CSV file(s) (multipart/form-data)
- `state`: State name (optional, for metadata)

**Returns:**
```json
{
  "upload_id": "uuid-string",
  "filename": "roll_v1.csv",
  "row_count": 2000,
  "state": "Maharashtra",
  "status": "success"
}
```

**What it does:**
- Accepts CSV file uploads
- Validates file format and data
- Stores **metadata only** (`ElectoralRoll` table)
- Stores **individual voter records** (`VoterRecord` table) for comparison
- Returns upload ID for later comparison

**Note:** This API serves the forensic layer, so it DOES store individual records.

---

#### 2. `GET /api/uploads`
**Purpose:** List uploaded rolls (for selecting which rolls to compare)

**Returns:**
```json
[
  {
    "upload_id": "uuid-1",
    "filename": "roll_v1.csv",
    "state": "Maharashtra",
    "row_count": 2000,
    "uploaded_at": "2026-01-13T10:00:00Z"
  }
]
```

**What it does:**
- Returns **metadata only** (no individual voter records)
- Used by frontend to let users select rolls for comparison

---

#### 3. `POST /api/compare`
**Purpose:** Compare two uploaded electoral rolls

**Request:**
```json
{
  "old_upload_id": "uuid-1",
  "new_upload_id": "uuid-2"
}
```

**Returns:**
```json
{
  "stats": {
    "total_added": 150,
    "total_deleted": 75,
    "total_modified": 25
  },
  "added": [
    {
      "voter_id": "V001",
      "name": "John Doe",
      "age": 35,
      "address": "123 Main St",
      "registration_date": "2024-01-15"
    }
  ],
  "deleted": [...],
  "modified": [
    {
      "voter_id": "V002",
      "old": { "name": "Jane Smith", "age": 28 },
      "new": { "name": "Jane Doe", "age": 29 }
    }
  ],
  "alerts": [
    {
      "type": "suspicious_pattern",
      "description": "Unusual spike in additions in Ward 15",
      "risk_level": "high"
    }
  ],
  "metadata": {
    "old_roll": {...},
    "new_roll": {...}
  }
}
```

**What it does:**
- Compares two uploaded rolls using `VoterRecord` data
- Returns **individual voter records** that were added/deleted/modified
- Detects suspicious patterns
- **This is the ONLY place individual voter records are exposed**

---

### Data That Belongs Here
✅ **Individual voter records** (`VoterRecord` table)  
✅ **Upload metadata** (`ElectoralRoll` table)  
✅ **Comparison results** (added/deleted/modified records)  
✅ **Suspicious pattern alerts**  
✅ **Row-level hashes** for change detection

### Data That Must NOT Be Here
❌ Aggregated statistics (use Dashboard layer instead)  
❌ National dataset queries (use Dashboard layer instead)  
❌ Constituency-level aggregations (use Dashboard layer instead)

---

## 🚫 What Must NOT Be Mixed

### ❌ DO NOT:
1. **Use `/api/compare` data in Dashboard**
   - Dashboard should use `/api/stats` (aggregated from national dataset)
   - Dashboard should NEVER query `VoterRecord` table directly

2. **Use Dashboard stats in DiffViewer**
   - DiffViewer should ONLY use `/api/compare` results
   - DiffViewer should NOT query national dataset

3. **Store national dataset in same tables as uploaded rolls**
   - National dataset should be separate (or clearly marked)
   - Uploaded rolls are temporary/comparison data

4. **Expose individual voter records in Dashboard APIs**
   - `/api/stats` should return counts only
   - `/api/constituencies` should return aggregate stats only

5. **Mix aggregation logic with comparison logic**
   - Stats calculation ≠ Roll comparison
   - Different data sources, different purposes

---

## 📋 Current Implementation Status

### ✅ Correctly Implemented
- `POST /api/upload` - Stores individual records (correct for forensic layer)
- `POST /api/compare` - Returns individual records (correct for forensic layer)
- `GET /api/uploads` - Returns metadata only (correct)

### ⚠️ Needs Clarification/Fixing
- `GET /api/stats` - Currently queries `ElectoralRoll` table (upload metadata)
  - **Should query national dataset instead**
  - Should aggregate from national CSV, not uploaded rolls
  - Should NOT count uploads as "voters"

### ❌ Missing APIs
- `GET /api/constituencies` - For Dashboard map visualization
  - Should aggregate from national dataset
  - Should return constituency-level stats only

---

## 🎯 Key Principles

1. **Dashboard = Aggregation Only**
   - Never exposes individual voter data
   - Uses national dataset as source
   - Returns counts, percentages, trends

2. **DiffViewer = Forensic Analysis Only**
   - Compares specific uploaded rolls
   - Returns individual changed records
   - Used for investigation, not monitoring

3. **Clear Separation**
   - Different data sources
   - Different APIs
   - Different use cases
   - Different frontend pages

---

## 📝 Summary Table

| Aspect | Dashboard Aggregation Layer | RollDiff Forensic Layer |
|--------|----------------------------|------------------------|
| **Data Source** | National India-level CSV | Two uploaded CSV files |
| **Purpose** | Monitoring, oversight | Forensic investigation |
| **Returns** | Aggregated stats only | Individual records |
| **APIs** | `/api/stats`, `/api/constituencies` | `/api/upload`, `/api/compare`, `/api/uploads` |
| **Frontend Page** | Dashboard | DiffViewer |
| **Database Tables** | National dataset (separate) | `ElectoralRoll`, `VoterRecord` |
| **Individual Records** | ❌ NEVER | ✅ YES (for comparison) |

---

**Last Updated:** 2026-01-13  
**Team:** Teen Titans | Snowfrost Hackathon 2026

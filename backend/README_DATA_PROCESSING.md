# Real Data Processing Guide

**Owner**: Vansh (Backend Developer)  
**Purpose**: Process real electoral roll data (PDF/CSV) for demo

---

## Quick Start

### Step 1: Install PDF Processing Libraries

```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
# or
source venv/bin/activate  # Linux/Mac

pip install pdfplumber PyPDF2 tabula-py
```

### Step 2: Process Your Data Files

#### Option A: Validate Existing CSV Files

```bash
# Validate a single file
python scripts/process_real_data.py Demo_Data/Andaman_2024_Base.csv

# Validate all files in a folder
python scripts/process_real_data.py Demo_Data/
```

#### Option B: Convert PDF to CSV

```bash
# Convert PDF to CSV
python utils/pdf_parser.py input.pdf output.csv pdfplumber
```

---

## Expected CSV Format

Your CSV files must have these exact columns:

```csv
voter_id,name,age,address,registration_date
AN0000001,A Pandian,35,"11/13, Main Road, Andaman & Nicobar Islands",2011-01-01
AN0000002,N Kannan,42,"23/17, Market Street, Andaman & Nicobar Islands",2015-08-09
```

**Column Requirements:**
- `voter_id`: String, unique identifier (e.g., "AN0000001")
- `name`: String, voter's full name
- `age`: Integer, between 0-150
- `address`: String, full address
- `registration_date`: String, format YYYY-MM-DD (e.g., "2011-01-01")

---

## Processing Real Electoral Data

### For the 3 Demo Files Mentioned:

1. **Andaman_2024_Base.csv** (1,000 voters)
   - Baseline electoral roll
   - Upload first

2. **Andaman_2025_Deletions.csv** (800 voters)
   - 200 voters deleted from base
   - Shows bulk deletion scenario

3. **Andaman_2025_Additions.csv** (1,150 voters)
   - 150 voters added on same day
   - Shows suspicious addition scenario

### Validation Commands:

```bash
# Validate all 3 files
python scripts/process_real_data.py Demo_Data/

# Expected output:
# ✅ Andaman_2024_Base.csv: 1000 rows
# ✅ Andaman_2025_Deletions.csv: 800 rows  
# ✅ Andaman_2025_Additions.csv: 1150 rows
```

---

## PDF to CSV Conversion

If you have PDF electoral rolls, convert them using:

```bash
python utils/pdf_parser.py electoral_roll.pdf output.csv pdfplumber
```

**Methods Available:**
- `pdfplumber` (recommended) - Best for tables
- `pypdf2` - Basic text extraction
- `tabula` - Table extraction (requires Java)

**Example:**
```bash
python utils/pdf_parser.py data/electoral_roll_2024.pdf data/electoral_roll_2024.csv pdfplumber
```

---

## Troubleshooting

### Issue: "Missing required columns"

**Solution**: Check your CSV has these exact column names:
- `voter_id`
- `name`
- `age`
- `address`
- `registration_date`

### Issue: "Invalid age values"

**Solution**: Age must be integer between 0-150. The script will auto-fix:
```bash
python scripts/process_real_data.py your_file.csv
# Creates: your_file_cleaned.csv
```

### Issue: "Encoding error"

**Solution**: The script tries multiple encodings automatically. If it fails:
1. Open CSV in Excel
2. Save as CSV UTF-8
3. Try again

### Issue: "PDF parsing not working"

**Solution**: 
1. Install required libraries: `pip install pdfplumber PyPDF2`
2. Try different method: `python utils/pdf_parser.py file.pdf output.csv pypdf2`
3. For complex PDFs, use tabula: `pip install tabula-py` (requires Java)

---

## Upload to Backend

Once your CSV files are validated:

1. **Start backend server:**
```bash
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```

2. **Upload via API:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@Demo_Data/Andaman_2024_Base.csv"
```

3. **Or use the frontend:**
- Open: https://electoral-roll-tracker-one.vercel.app/
- Navigate to Upload page
- Select and upload your CSV files

---

## Data Quality Checks

The backend automatically validates:
- ✅ Required columns present
- ✅ No null voter_id or name
- ✅ Age is valid integer (0-150)
- ✅ Registration date format (YYYY-MM-DD)
- ✅ No duplicate voter_ids within file
- ✅ File size < 50MB
- ✅ Encoding detection (utf-8, latin-1, etc.)

---

## Performance

- **Small files (< 1,000 rows)**: Processed in < 1 second
- **Medium files (1,000-10,000 rows)**: Processed in 1-3 seconds
- **Large files (10,000-100,000 rows)**: Processed in 5-15 seconds
- **Very large files (> 100,000 rows)**: Processed in batches

---

## Next Steps

1. ✅ Validate your CSV files
2. ✅ Upload to backend
3. ✅ Test comparison scenarios
4. ✅ Prepare demo

**Questions?** Check `backend/API_DOCUMENTATION.md` for API details.

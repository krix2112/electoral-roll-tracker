# Electoral Roll Tracker - Complete API Documentation

**Version**: 1.0.0  
**Team**: Teen Titans | Snowfrost Hackathon 2026  
**Owner**: Vansh (Backend Developer)

---

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Endpoints](#endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)
6. [Edge Cases](#edge-cases)
7. [Performance Considerations](#performance-considerations)

---

## Overview

The Electoral Roll Tracker API is a RESTful API built with Flask that allows users to:
- Upload electoral roll CSV files
- Retrieve list of uploaded rolls
- Compare two electoral rolls to detect changes
- Identify suspicious patterns in electoral data

**Base URL**: `http://localhost:5000` (development)  
**Production URL**: Configured via environment variables

---

## Base Configuration

### Environment Variables

```bash
# Database Configuration
DATABASE_URL=sqlite:///electoral_roll_db.sqlite  # or PostgreSQL URL

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
HOST=0.0.0.0

# Security
SECRET_KEY=your-secret-key-here

# Upload Configuration
MAX_UPLOAD_SIZE=52428800  # 50MB in bytes

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Description**: Verifies that the API is running and healthy.

**Request**: None

**Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "Electoral Roll Tracker API",
  "version": "1.0.0"
}
```

**Use Case**: Frontend can ping this endpoint to check backend availability.

---

### 2. Root Endpoint

**Endpoint**: `GET /`

**Description**: Returns API information and available endpoints.

**Request**: None

**Response** (200 OK):
```json
{
  "message": "Electoral Roll Tracker API",
  "team": "Teen Titans",
  "hackathon": "Snowfrost 2026",
  "endpoints": {
    "upload": "/api/upload",
    "compare": "/api/compare",
    "uploads": "/api/uploads",
    "health": "/health"
  }
}
```

---

### 3. Upload Electoral Roll

**Endpoint**: `POST /api/upload`

**Description**: Uploads a CSV file containing electoral roll data. The file is validated, parsed, and stored in the database.

**Content-Type**: `multipart/form-data`

**Request Body**:
- `file` (File, required): CSV file with electoral roll data

**CSV Format Requirements**:
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `voter_id` | string | Yes | Unique identifier for voter |
| `name` | string | Yes | Full name of voter |
| `age` | integer | Yes | Age (must be 0-150) |
| `address` | string | Yes | Full address |
| `registration_date` | string | Yes | Date in YYYY-MM-DD format |

**Success Response** (201 Created):
```json
{
  "upload_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "electoral_roll_january_2026.csv",
  "row_count": 2000,
  "message": "Upload successful",
  "encoding": "utf-8",
  "batches_processed": 2
}
```

**Error Responses**: See [Error Handling](#error-handling) section

**Example Request** (cURL):
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@electoral_roll.csv"
```

**Example Request** (JavaScript):
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.upload_id);
```

---

### 4. Get All Uploads

**Endpoint**: `GET /api/uploads`

**Description**: Retrieves a list of all uploaded electoral rolls with metadata.

**Request**: None

**Response** (200 OK):
```json
[
  {
    "upload_id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "electoral_roll_january_2026.csv",
    "row_count": 2000,
    "uploaded_at": "2026-01-15T10:30:00",
    "data_hash": "a1b2c3d4e5f6..."
  },
  {
    "upload_id": "660e8400-e29b-41d4-a716-446655440001",
    "filename": "electoral_roll_february_2026.csv",
    "row_count": 2050,
    "uploaded_at": "2026-02-15T11:00:00",
    "data_hash": "b2c3d4e5f6a7..."
  }
]
```

**Error Response** (500):
```json
{
  "error": "Failed to fetch uploads: <error message>"
}
```

---

### 5. Compare Electoral Rolls

**Endpoint**: `POST /api/compare`

**Description**: Compares two electoral rolls and returns differences, statistics, and suspicious pattern alerts.

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "old_upload_id": "550e8400-e29b-41d4-a716-446655440000",
  "new_upload_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Success Response** (200 OK):
```json
{
  "added": [
    {
      "voter_id": "V000001",
      "name": "John Doe",
      "age": 25,
      "address": "123 Main St, City - 110001",
      "registration_date": "2026-01-01"
    }
  ],
  "deleted": [
    {
      "voter_id": "V000002",
      "name": "Jane Smith",
      "age": 30,
      "address": "456 Oak Ave, City - 110002",
      "registration_date": "2025-12-15"
    }
  ],
  "modified": [
    {
      "voter_id": "V000003",
      "old": {
        "voter_id": "V000003",
        "name": "Bob Johnson",
        "age": 28,
        "address": "789 Pine Rd, City - 110003",
        "registration_date": "2025-11-20"
      },
      "new": {
        "voter_id": "V000003",
        "name": "Bob Johnson",
        "age": 29,
        "address": "789 Pine Rd, City - 110003",
        "registration_date": "2025-11-20"
      },
      "changes": {
        "age": {
          "old": 28,
          "new": 29
        }
      }
    }
  ],
  "stats": {
    "total_added": 150,
    "total_deleted": 75,
    "total_modified": 25,
    "old_count": 2000,
    "new_count": 2075,
    "unchanged": 1900
  },
  "alerts": [
    {
      "type": "BULK_DELETION",
      "severity": "HIGH",
      "message": "75 voters deleted in single operation",
      "count": 75
    },
    {
      "type": "SAME_DAY_REGISTRATION",
      "severity": "HIGH",
      "message": "50 voters registered on same day: 2026-01-01",
      "date": "2026-01-01",
      "count": 50
    }
  ],
  "metadata": {
    "old_roll": {
      "upload_id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "electoral_roll_january_2026.csv",
      "row_count": 2000,
      "uploaded_at": "2026-01-15T10:30:00"
    },
    "new_roll": {
      "upload_id": "660e8400-e29b-41d4-a716-446655440001",
      "filename": "electoral_roll_february_2026.csv",
      "row_count": 2075,
      "uploaded_at": "2026-02-15T11:00:00"
    }
  }
}
```

**Error Responses**: See [Error Handling](#error-handling) section

---

## Request/Response Examples

### Complete Upload Flow

```javascript
// 1. Upload file
const formData = new FormData();
formData.append('file', csvFile);

const uploadResponse = await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
});

const uploadData = await uploadResponse.json();
// Returns: { upload_id: "...", filename: "...", row_count: 2000 }

// 2. Get all uploads
const uploadsResponse = await fetch('http://localhost:5000/api/uploads');
const uploads = await uploadsResponse.json();
// Returns: Array of upload objects

// 3. Compare two uploads
const compareResponse = await fetch('http://localhost:5000/api/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    old_upload_id: uploads[0].upload_id,
    new_upload_id: uploads[1].upload_id
  })
});

const comparison = await compareResponse.json();
// Returns: { added: [...], deleted: [...], modified: [...], stats: {...}, alerts: [...] }
```

---

## Error Handling

### Standard Error Format

All error responses follow this format:
```json
{
  "error": "Error message description"
}
```

Some errors include additional details:
```json
{
  "error": "Data validation failed",
  "details": ["50 rows have invalid age values", "10 rows have empty voter_id"],
  "row_count": 2000
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET requests |
| 201 | Created | Successful file upload |
| 400 | Bad Request | Invalid input, missing fields, validation errors |
| 404 | Not Found | Upload ID not found |
| 413 | Payload Too Large | File exceeds 50MB limit |
| 500 | Internal Server Error | Server-side errors |

### Common Error Scenarios

#### 1. No File Provided
```json
{
  "error": "No file provided"
}
```
**Status**: 400

#### 2. Empty File
```json
{
  "error": "File is empty"
}
```
**Status**: 400

#### 3. Invalid File Type
```json
{
  "error": "Only CSV files are supported"
}
```
**Status**: 400

#### 4. Missing Required Columns
```json
{
  "error": "Missing required columns: age, address",
  "required_columns": ["voter_id", "name", "age", "address", "registration_date"],
  "found_columns": ["voter_id", "name"]
}
```
**Status**: 400

#### 5. Data Validation Errors
```json
{
  "error": "Data validation failed",
  "details": [
    "50 rows have invalid age values",
    "10 rows have empty or null voter_id"
  ],
  "row_count": 2000
}
```
**Status**: 400

#### 6. Duplicate Voter IDs
```json
{
  "error": "Duplicate voter_id found in file",
  "details": "25 rows have duplicate voter_id values",
  "duplicate_ids": ["V000001", "V000002", "V000003"]
}
```
**Status**: 400

#### 7. File Too Large
```json
{
  "error": "File too large. Maximum size is 50MB. Your file is 75.50MB"
}
```
**Status**: 413

#### 8. Upload Not Found
```json
{
  "error": "Electoral roll not found: 550e8400-e29b-41d4-a716-446655440000"
}
```
**Status**: 404

---

## Edge Cases

The API handles the following edge cases:

### File-Related Edge Cases

1. **Empty File**: Returns 400 error
2. **File Size**: Checks before processing, returns 413 if > 50MB
3. **Invalid Encoding**: Tries multiple encodings (utf-8, latin-1, iso-8859-1, cp1252)
4. **Malformed CSV**: Returns parsing error with details
5. **Empty DataFrame**: Returns error if CSV has no data rows
6. **Only Headers**: Detects CSV with only column headers

### Data Validation Edge Cases

1. **Missing Columns**: Validates all required columns exist
2. **Null Values**: Checks for null/empty voter_id, name, address
3. **Invalid Age**: Validates age is numeric and between 0-150
4. **Invalid Date Format**: Validates registration_date is YYYY-MM-DD
5. **Duplicate Voter IDs**: Detects duplicates within the same file
6. **Whitespace**: Automatically trims whitespace from string fields

### Processing Edge Cases

1. **Large Files**: Processes in batches of 1000 rows
2. **Database Errors**: Rolls back transaction on failure
3. **Individual Row Errors**: Returns specific row index on error
4. **Encoding Detection**: Automatically detects and uses correct encoding

---

## Performance Considerations

### Upload Performance

- **Batch Processing**: Files are processed in batches of 1000 rows
- **Bulk Inserts**: Uses SQLAlchemy `bulk_save_objects()` for efficient database writes
- **Memory Efficient**: Processes data in chunks to handle large files

### Comparison Performance

- **Hash-Based Comparison**: Uses MD5 hashes for fast row comparison
- **Set Operations**: Uses Python sets for O(1) lookup performance
- **Pandas Optimization**: Leverages pandas for efficient data manipulation

### Database Performance

- **Indexes**: Key fields (upload_id, voter_id, row_hash) are indexed
- **Composite Indexes**: Multiple indexes for common query patterns
- **Connection Pooling**: SQLAlchemy handles connection pooling automatically

### Scalability

- **Handles 100K+ Records**: Tested with files containing 100,000+ rows
- **Concurrent Requests**: Flask handles multiple concurrent uploads
- **Database Agnostic**: Works with SQLite (dev) and PostgreSQL (production)

---

## Rate Limiting

Currently: **None** (may be added in future versions)

---

## Authentication

Currently: **None** (may be added in future versions)

---

## CORS Configuration

- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` environment variable
- **Default**: `http://localhost:5173`
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Content-Type`, `Authorization`

---

## API Versioning

This is API version **1.0.0**. The contract is frozen and will not change.

For future versions, a new versioned endpoint structure may be introduced (e.g., `/api/v2/upload`).

---

## Notes

- Maximum file upload size: **50MB** (configurable via `MAX_UPLOAD_SIZE`)
- All timestamps are in **ISO 8601 format**
- All UUIDs are **version 4 UUIDs**
- All dates should be in **YYYY-MM-DD format**
- CSV files should use **UTF-8 encoding** (other encodings are auto-detected)

---

**END OF API DOCUMENTATION**

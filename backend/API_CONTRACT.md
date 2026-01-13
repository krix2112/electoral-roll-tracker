# Electoral Roll Tracker API - Frozen Contract v1.0.0

**Status**: FROZEN - This API contract is locked and will not change  
**Version**: 1.0.0  
**Date**: 2026  
**Team**: Teen Titans | Snowfrost Hackathon 2026

---

## Base URL
```
http://localhost:5000
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

**Response** (200):
```json
{
  "status": "healthy",
  "service": "Electoral Roll Tracker API",
  "version": "1.0.0"
}
```

---

### 2. Root Endpoint

**GET** `/`

**Response** (200):
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

**POST** `/api/upload`

**Content-Type**: `multipart/form-data`

**Request Body**:
- `file` (file, required): CSV file with electoral roll data

**CSV Format Requirements**:
- Required columns: `voter_id`, `name`, `age`, `address`, `registration_date`
- `voter_id`: string, unique identifier
- `name`: string
- `age`: integer
- `address`: string
- `registration_date`: string (YYYY-MM-DD format)

**Success Response** (201):
```json
{
  "upload_id": "uuid-string",
  "filename": "electoral_roll.csv",
  "row_count": 2000,
  "message": "Upload successful"
}
```

**Error Responses**:

400 - No file provided:
```json
{
  "error": "No file provided"
}
```

400 - No file selected:
```json
{
  "error": "No file selected"
}
```

400 - Invalid file type:
```json
{
  "error": "Only CSV files are supported"
}
```

400 - Missing columns:
```json
{
  "error": "Missing required columns: age, address"
}
```

413 - File too large:
```json
{
  "error": "File too large. Maximum size is 50MB"
}
```

500 - Upload failed:
```json
{
  "error": "Upload failed: <error message>"
}
```

---

### 4. Get All Uploads

**GET** `/api/uploads`

**Response** (200):
```json
[
  {
    "upload_id": "uuid-string",
    "filename": "electoral_roll.csv",
    "row_count": 2000,
    "uploaded_at": "2026-01-15T10:30:00",
    "data_hash": "md5-hash-string"
  },
  ...
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

**POST** `/api/compare`

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "old_upload_id": "uuid-string-1",
  "new_upload_id": "uuid-string-2"
}
```

**Success Response** (200):
```json
{
  "added": [
    {
      "voter_id": "V000001",
      "name": "John Doe",
      "age": 25,
      "address": "123 Main St",
      "registration_date": "2026-01-01"
    },
    ...
  ],
  "deleted": [
    {
      "voter_id": "V000002",
      "name": "Jane Smith",
      "age": 30,
      "address": "456 Oak Ave",
      "registration_date": "2025-12-15"
    },
    ...
  ],
  "modified": [
    {
      "voter_id": "V000003",
      "old": {
        "voter_id": "V000003",
        "name": "Bob Johnson",
        "age": 28,
        "address": "789 Pine Rd",
        "registration_date": "2025-11-20"
      },
      "new": {
        "voter_id": "V000003",
        "name": "Bob Johnson",
        "age": 29,
        "address": "789 Pine Rd",
        "registration_date": "2025-11-20"
      },
      "changes": {
        "age": {
          "old": 28,
          "new": 29
        }
      }
    },
    ...
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
      "upload_id": "uuid-string-1",
      "filename": "january_roll.csv",
      "row_count": 2000,
      "uploaded_at": "2026-01-15T10:30:00"
    },
    "new_roll": {
      "upload_id": "uuid-string-2",
      "filename": "february_roll.csv",
      "row_count": 2075,
      "uploaded_at": "2026-02-15T11:00:00"
    }
  }
}
```

**Error Responses**:

400 - Missing request body:
```json
{
  "error": "Request body is required"
}
```

400 - Missing parameters:
```json
{
  "error": "Both old_upload_id and new_upload_id are required"
}
```

400 - Same upload IDs:
```json
{
  "error": "Cannot compare an electoral roll with itself"
}
```

404 - Upload not found:
```json
{
  "error": "Electoral roll not found: <upload_id>"
}
```

500 - Comparison failed:
```json
{
  "error": "Comparison failed: <error message>"
}
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

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `413` - Payload Too Large
- `500` - Internal Server Error

---

## CORS Configuration

- Allowed Origins: Configurable via `ALLOWED_ORIGINS` environment variable
- Default: `http://localhost:5173`
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed Headers: `Content-Type`, `Authorization`

---

## Rate Limiting

Currently: None (may be added in future versions)

---

## Authentication

Currently: None (may be added in future versions)

---

## API Versioning

This is API version 1.0.0. The contract is frozen and will not change.

For future versions, a new versioned endpoint structure may be introduced (e.g., `/api/v2/upload`).

---

## Notes

- Maximum file upload size: 50MB (configurable via `MAX_UPLOAD_SIZE`)
- All timestamps are in ISO 8601 format
- All UUIDs are version 4 UUIDs
- All dates should be in YYYY-MM-DD format

---

**END OF FROZEN API CONTRACT**

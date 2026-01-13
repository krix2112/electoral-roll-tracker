# API Contract v1.0.0 - FROZEN

**Status**: FROZEN - This API contract is locked  
**Base URL**: `http://localhost:5000` (configurable via `VITE_API_URL`)

## Endpoints

### POST /api/upload
Upload electoral roll CSV file.

**Request**: `multipart/form-data` with `file` field

**Success (201)**:
```json
{
  "upload_id": "string",
  "filename": "string",
  "row_count": number,
  "message": "string"
}
```

**Errors**:
- 400: `{ "error": "No file provided" }`
- 400: `{ "error": "No file selected" }`
- 400: `{ "error": "Only CSV files are supported" }`
- 400: `{ "error": "Missing required columns: ..." }`
- 500: `{ "error": "Upload failed: ..." }`

---

### GET /api/uploads
Get list of all uploaded electoral rolls.

**Success (200)**: Array of upload objects
```json
[
  {
    "upload_id": "string",
    "filename": "string",
    "row_count": number,
    "uploaded_at": "ISO-8601-string",
    "data_hash": "string"
  }
]
```

---

### POST /api/compare
Compare two electoral rolls.

**Request Body**:
```json
{
  "old_upload_id": "string",
  "new_upload_id": "string"
}
```

**Success (200)**:
```json
{
  "added": [...],
  "deleted": [...],
  "modified": [...],
  "stats": {
    "total_added": number,
    "total_deleted": number,
    "total_modified": number,
    "old_count": number,
    "new_count": number,
    "unchanged": number
  },
  "alerts": [...],
  "metadata": {...}
}
```

**Errors**:
- 400: `{ "error": "Both old_upload_id and new_upload_id are required" }`
- 404: `{ "error": "Electoral roll not found: ..." }`
- 500: `{ "error": "Comparison failed: ..." }`

---

### GET /health
Health check endpoint.

**Success (200)**:
```json
{
  "status": "healthy",
  "service": "Electoral Roll Tracker API",
  "version": "1.0.0"
}
```

---

**See `backend/API_CONTRACT.md` for complete API documentation.**

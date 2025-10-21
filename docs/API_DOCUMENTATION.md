# MediCare Assist API Documentation

## Overview

MediCare Assist is a comprehensive caregiver-managed web application that ensures timely medication intake for elderly individuals through automated reminders and AI-powered assistance.

## Base URLs

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Chatbot Service**: `http://localhost:8001`
- **Pill Identification Service**: `http://localhost:8002`
- **Fall Detection Service**: `http://localhost:8003`

## Authentication

All API endpoints require authentication except for login and registration. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Backend API Endpoints

### Authentication

#### POST /api/auth/register
Register a new caregiver account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /api/auth/login
Login to the system.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Elderly Management

#### GET /api/elderly
Get all elderly patients for the authenticated caregiver.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `status` (optional): Filter by status (active/inactive)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

#### POST /api/elderly
Create a new elderly patient.

**Request Body:**
```json
{
  "firstName": "Mary",
  "lastName": "Johnson",
  "email": "mary@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1950-01-01",
  "emergencyContact": {
    "name": "John Johnson",
    "phone": "+1234567891",
    "relationship": "son"
  }
}
```

#### GET /api/elderly/:id
Get details of a specific elderly patient.

#### PUT /api/elderly/:id
Update elderly patient information.

#### DELETE /api/elderly/:id
Delete an elderly patient.

### Medication Management

#### GET /api/medications
Get all medications for the authenticated caregiver.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `status` (optional): Filter by status
- `elderlyId` (optional): Filter by elderly patient

#### POST /api/medications
Create a new medication.

**Request Body:**
```json
{
  "name": "Aspirin",
  "dosage": "81",
  "unit": "mg",
  "frequency": "once",
  "instructions": "Take with food",
  "elderlyId": "elderly-id"
}
```

#### POST /api/medications/log-taken
Log medication as taken.

**Request Body:**
```json
{
  "medicationId": "medication-id",
  "elderlyId": "elderly-id",
  "takenAt": "2024-01-01T08:00:00Z",
  "notes": "Taken with breakfast"
}
```

## AI Services

### Chatbot Service

#### POST /chat
Chat with the medication assistant.

**Request Body:**
```json
{
  "message": "What are the side effects of aspirin?",
  "context": {},
  "user_id": "user-id"
}
```

**Response:**
```json
{
  "response": "Aspirin can cause stomach upset, bleeding risk, and allergic reactions...",
  "confidence": 0.9,
  "suggestions": ["Ask about dosage", "Check interactions"],
  "drug_info": { ... }
}
```

#### GET /drug-info/{drug_name}
Get information about a specific drug.

#### POST /check-interactions
Check for drug interactions.

**Request Body:**
```json
{
  "drugs": ["aspirin", "warfarin"]
}
```

### Pill Identification Service

#### POST /identify
Identify a pill from an uploaded image.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "pill_id": "aspirin_81mg",
  "name": "Aspirin",
  "dosage": "81mg",
  "manufacturer": "Bayer",
  "color": "white",
  "shape": "round",
  "size": "small",
  "imprint": "81",
  "confidence": 0.95
}
```

#### POST /identify-url
Identify a pill from an image URL.

**Request Body:**
```json
{
  "image_url": "https://example.com/pill-image.jpg"
}
```

### Fall Detection Service

#### POST /process-audio
Process audio for fall detection.

**Request:** Multipart form data with audio file

**Response:**
```json
{
  "fall_detected": true,
  "confidence": 0.85,
  "audio_features": { ... },
  "keywords_detected": ["help", "emergency"],
  "timestamp": "2024-01-01T08:00:00Z",
  "recommendations": ["Check on the person immediately"]
}
```

#### WebSocket /ws/{elderly_id}
Real-time audio monitoring for fall detection.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General API endpoints: 100 requests per minute
- AI service endpoints: 50 requests per minute

## Webhooks

The system supports webhooks for real-time notifications:

### Fall Detection Alert
```json
{
  "event": "fall_detected",
  "elderly_id": "elderly-id",
  "timestamp": "2024-01-01T08:00:00Z",
  "confidence": 0.85,
  "location": "living_room"
}
```

### Medication Missed
```json
{
  "event": "medication_missed",
  "elderly_id": "elderly-id",
  "medication_id": "medication-id",
  "scheduled_time": "2024-01-01T08:00:00Z",
  "missed_duration": "2 hours"
}
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install medicare-assist-sdk
```

### Python
```bash
pip install medicare-assist-sdk
```

## Support

For API support and questions:
- Email: api-support@medicare-assist.com
- Documentation: https://docs.medicare-assist.com
- Status Page: https://status.medicare-assist.com

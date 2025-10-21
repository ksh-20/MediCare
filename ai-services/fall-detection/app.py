from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import asyncio
import json
from dotenv import load_dotenv

from audio_fall_detector import AudioFallDetector
from keyword_detector import KeywordDetector
from model_trainer import ModelTrainer

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MediCare Assist Fall Detection API",
    description="AI-powered fall detection using audio analysis and keyword detection",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
audio_detector = AudioFallDetector()
keyword_detector = KeywordDetector()
model_trainer = ModelTrainer()

# WebSocket connections
active_connections: Dict[str, WebSocket] = {}

# Pydantic models
class FallDetectionRequest(BaseModel):
    elderly_id: str
    audio_data: Optional[str] = None  # Base64 encoded audio
    location: Optional[str] = None
    timestamp: Optional[str] = None

class FallDetectionResponse(BaseModel):
    fall_detected: bool
    confidence: float
    audio_features: Optional[Dict[str, Any]] = None
    keywords_detected: Optional[List[str]] = None
    location: Optional[str] = None
    timestamp: str
    recommendations: Optional[List[str]] = None

class MonitoringRequest(BaseModel):
    elderly_id: str
    start_monitoring: bool
    sensitivity: str = "medium"  # low, medium, high

class KeywordDetectionRequest(BaseModel):
    audio_data: str  # Base64 encoded audio
    elderly_id: str

class TrainingRequest(BaseModel):
    audio_files: List[str]  # List of audio file paths
    labels: List[str]  # List of corresponding labels
    model_type: str = "fall_detection"  # fall_detection, keyword_detection

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fall-detection"}

# WebSocket endpoint for real-time monitoring
@app.websocket("/ws/{elderly_id}")
async def websocket_endpoint(websocket: WebSocket, elderly_id: str):
    await websocket.accept()
    active_connections[elderly_id] = websocket
    
    try:
        while True:
            # Receive audio data
            data = await websocket.receive_bytes()
            
            # Process audio for fall detection
            result = await audio_detector.process_audio(data)
            
            # Check for keywords
            keywords = await keyword_detector.detect_keywords(data)
            
            # Determine if fall occurred
            fall_detected = result.get('fall_detected', False) or len(keywords) > 0
            
            # Send response back to client
            response = {
                "fall_detected": fall_detected,
                "confidence": result.get('confidence', 0.0),
                "keywords_detected": keywords,
                "timestamp": result.get('timestamp'),
                "recommendations": _get_recommendations(fall_detected, keywords)
            }
            
            await websocket.send_text(json.dumps(response))
            
    except WebSocketDisconnect:
        if elderly_id in active_connections:
            del active_connections[elderly_id]

# Process audio for fall detection
@app.post("/process-audio", response_model=FallDetectionResponse)
async def process_audio(file: UploadFile = File(...), elderly_id: str = None):
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read audio data
        audio_data = await file.read()
        
        # Process audio for fall detection
        fall_result = await audio_detector.process_audio(audio_data)
        
        # Detect keywords
        keywords = await keyword_detector.detect_keywords(audio_data)
        
        # Determine if fall occurred
        fall_detected = fall_result.get('fall_detected', False) or len(keywords) > 0
        
        # Get recommendations
        recommendations = _get_recommendations(fall_detected, keywords)
        
        return FallDetectionResponse(
            fall_detected=fall_detected,
            confidence=fall_result.get('confidence', 0.0),
            audio_features=fall_result.get('features'),
            keywords_detected=keywords,
            location=fall_result.get('location'),
            timestamp=fall_result.get('timestamp'),
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")

# Start/stop monitoring
@app.post("/monitoring")
async def toggle_monitoring(request: MonitoringRequest):
    try:
        if request.start_monitoring:
            # Start monitoring for elderly
            await audio_detector.start_monitoring(request.elderly_id, request.sensitivity)
            return {"message": f"Monitoring started for elderly {request.elderly_id}"}
        else:
            # Stop monitoring
            await audio_detector.stop_monitoring(request.elderly_id)
            return {"message": f"Monitoring stopped for elderly {request.elderly_id}"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monitoring error: {str(e)}")

# Detect keywords in audio
@app.post("/detect-keywords")
async def detect_keywords(request: KeywordDetectionRequest):
    try:
        # Decode base64 audio data
        import base64
        audio_data = base64.b64decode(request.audio_data)
        
        # Detect keywords
        keywords = await keyword_detector.detect_keywords(audio_data)
        
        return {
            "keywords_detected": keywords,
            "elderly_id": request.elderly_id,
            "timestamp": str(asyncio.get_event_loop().time())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Keyword detection error: {str(e)}")

# Get fall history
@app.get("/fall-history/{elderly_id}")
async def get_fall_history(elderly_id: str, limit: int = 10):
    try:
        history = await audio_detector.get_fall_history(elderly_id, limit)
        return {"fall_history": history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching fall history: {str(e)}")

# Update fall incident
@app.put("/fall-incident/{incident_id}")
async def update_fall_incident(incident_id: str, data: Dict[str, Any]):
    try:
        result = await audio_detector.update_fall_incident(incident_id, data)
        return {"message": "Fall incident updated successfully", "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating fall incident: {str(e)}")

# Get distress keywords
@app.get("/distress-keywords")
async def get_distress_keywords():
    try:
        keywords = await keyword_detector.get_distress_keywords()
        return {"keywords": keywords}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching distress keywords: {str(e)}")

# Add distress keyword
@app.post("/distress-keywords")
async def add_distress_keyword(keyword: str):
    try:
        result = await keyword_detector.add_distress_keyword(keyword)
        return {"message": "Distress keyword added successfully", "keyword": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding distress keyword: {str(e)}")

# Train model
@app.post("/train-model")
async def train_model(request: TrainingRequest):
    try:
        result = await model_trainer.train_model(
            request.audio_files,
            request.labels,
            request.model_type
        )
        return {"message": "Model training completed", "results": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training error: {str(e)}")

# Get model performance
@app.get("/model-performance/{model_type}")
async def get_model_performance(model_type: str):
    try:
        performance = await model_trainer.get_model_performance(model_type)
        return {"performance": performance}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching model performance: {str(e)}")

# Get monitoring status
@app.get("/monitoring-status/{elderly_id}")
async def get_monitoring_status(elderly_id: str):
    try:
        status = await audio_detector.get_monitoring_status(elderly_id)
        return {"monitoring_status": status}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monitoring status: {str(e)}")

# Get system statistics
@app.get("/stats")
async def get_system_stats():
    try:
        stats = await audio_detector.get_system_stats()
        return {"stats": stats}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching system stats: {str(e)}")

def _get_recommendations(fall_detected: bool, keywords: List[str]) -> List[str]:
    """Get recommendations based on fall detection and keywords"""
    recommendations = []
    
    if fall_detected:
        recommendations.extend([
            "Check on the person immediately",
            "Call emergency services if needed",
            "Assess for injuries",
            "Document the incident"
        ])
    
    if keywords:
        recommendations.extend([
            "Respond to distress calls immediately",
            "Check for medical emergencies",
            "Provide comfort and reassurance",
            "Contact healthcare provider if needed"
        ])
    
    if not fall_detected and not keywords:
        recommendations.append("Continue monitoring")
    
    return recommendations

# Background task to process audio from WebSocket connections
async def process_websocket_audio():
    """Background task to process audio from WebSocket connections"""
    while True:
        try:
            # Process any pending audio data
            await asyncio.sleep(0.1)  # Small delay to prevent high CPU usage
        except Exception as e:
            print(f"Error in background audio processing: {e}")

# Start background task
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(process_websocket_audio())

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8003,
        reload=True
    )

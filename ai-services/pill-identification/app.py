from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

from pill_detector import PillDetector
from image_processor import ImageProcessor

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MediCare Assist Pill Identification API",
    description="AI-powered pill identification using computer vision",
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
pill_detector = PillDetector()
image_processor = ImageProcessor()

# Pydantic models
class PillIdentificationRequest(BaseModel):
    image_url: str

class PillIdentificationResponse(BaseModel):
    pill_id: str
    name: str
    dosage: str
    manufacturer: str
    color: str
    shape: str
    size: str
    imprint: str
    confidence: float
    description: Optional[str] = None
    side_effects: Optional[List[str]] = None
    interactions: Optional[List[str]] = None

class PillSearchRequest(BaseModel):
    description: str
    color: Optional[str] = None
    shape: Optional[str] = None
    imprint: Optional[str] = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pill-identification"}

# Identify pill from uploaded image
@app.post("/identify", response_model=PillIdentificationResponse)
async def identify_pill(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Process image
        processed_image = image_processor.preprocess_image(image_data)
        
        # Detect pill characteristics
        pill_characteristics = pill_detector.extract_characteristics(processed_image)
        
        # Identify pill
        identification_result = await pill_detector.identify_pill(pill_characteristics)
        
        if not identification_result:
            raise HTTPException(status_code=404, detail="Pill not identified")
        
        return PillIdentificationResponse(**identification_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pill identification error: {str(e)}")

# Identify pill from URL
@app.post("/identify-url", response_model=PillIdentificationResponse)
async def identify_pill_from_url(request: PillIdentificationRequest):
    try:
        # Download image from URL
        image_data = image_processor.download_image_from_url(request.image_url)
        
        # Process image
        processed_image = image_processor.preprocess_image(image_data)
        
        # Detect pill characteristics
        pill_characteristics = pill_detector.extract_characteristics(processed_image)
        
        # Identify pill
        identification_result = await pill_detector.identify_pill(pill_characteristics)
        
        if not identification_result:
            raise HTTPException(status_code=404, detail="Pill not identified")
        
        return PillIdentificationResponse(**identification_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pill identification error: {str(e)}")

# Get pill details by ID
@app.get("/pill-details/{pill_id}")
async def get_pill_details(pill_id: str):
    try:
        pill_details = await pill_detector.get_pill_details(pill_id)
        
        if not pill_details:
            raise HTTPException(status_code=404, detail="Pill not found")
        
        return pill_details
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pill details: {str(e)}")

# Search pills by description
@app.post("/search-by-description")
async def search_pills_by_description(request: PillSearchRequest):
    try:
        search_results = await pill_detector.search_pills_by_description(
            description=request.description,
            color=request.color,
            shape=request.shape,
            imprint=request.imprint
        )
        
        return {"pills": search_results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching pills: {str(e)}")

# Get pill interactions
@app.post("/interactions")
async def get_pill_interactions(pill_ids: List[str]):
    try:
        interactions = await pill_detector.get_pill_interactions(pill_ids)
        return {"interactions": interactions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking interactions: {str(e)}")

# Get pill side effects
@app.get("/side-effects/{pill_id}")
async def get_pill_side_effects(pill_id: str):
    try:
        side_effects = await pill_detector.get_pill_side_effects(pill_id)
        return {"side_effects": side_effects}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching side effects: {str(e)}")

# Get pill dosage information
@app.get("/dosage/{pill_id}")
async def get_pill_dosage(pill_id: str):
    try:
        dosage_info = await pill_detector.get_pill_dosage(pill_id)
        return {"dosage": dosage_info}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dosage info: {str(e)}")

# Get pill contraindications
@app.get("/contraindications/{pill_id}")
async def get_pill_contraindications(pill_id: str):
    try:
        contraindications = await pill_detector.get_pill_contraindications(pill_id)
        return {"contraindications": contraindications}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contraindications: {str(e)}")

# Get pill storage instructions
@app.get("/storage/{pill_id}")
async def get_pill_storage_instructions(pill_id: str):
    try:
        storage_info = await pill_detector.get_pill_storage_instructions(pill_id)
        return {"storage": storage_info}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching storage info: {str(e)}")

# Get pill administration instructions
@app.get("/administration/{pill_id}")
async def get_pill_administration_instructions(pill_id: str):
    try:
        admin_info = await pill_detector.get_pill_administration_instructions(pill_id)
        return {"administration": admin_info}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching administration info: {str(e)}")

# Get similar pills
@app.get("/similar/{pill_id}")
async def get_similar_pills(pill_id: str, limit: int = 5):
    try:
        similar_pills = await pill_detector.get_similar_pills(pill_id, limit)
        return {"similar_pills": similar_pills}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching similar pills: {str(e)}")

# Get pill database statistics
@app.get("/stats")
async def get_database_stats():
    try:
        stats = await pill_detector.get_database_stats()
        return {"stats": stats}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching database stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    )

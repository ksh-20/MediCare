from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

from chatbot_model import MedicationChatbot
from drug_database import DrugDatabase
from nlp_processor import NLPProcessor

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MediCare Assist Chatbot API",
    description="AI-powered medication assistance chatbot",
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
chatbot = MedicationChatbot()
drug_db = DrugDatabase()
nlp_processor = NLPProcessor()

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = {}
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    confidence: float
    suggestions: Optional[List[str]] = []
    drug_info: Optional[Dict[str, Any]] = None

class DrugInfoRequest(BaseModel):
    drug_name: str

class DrugInteractionRequest(BaseModel):
    drugs: List[str]

class DosageInfoRequest(BaseModel):
    drug_name: str
    condition: Optional[str] = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot"}

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Process the message with NLP
        processed_message = nlp_processor.process_message(request.message)
        
        # Get response from chatbot
        response = await chatbot.get_response(
            message=processed_message,
            context=request.context,
            user_id=request.user_id
        )
        
        return ChatResponse(
            response=response["message"],
            confidence=response["confidence"],
            suggestions=response.get("suggestions", []),
            drug_info=response.get("drug_info")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")

# Get drug information
@app.get("/drug-info/{drug_name}")
async def get_drug_info(drug_name: str):
    try:
        drug_info = await drug_db.get_drug_info(drug_name)
        if not drug_info:
            raise HTTPException(status_code=404, detail="Drug not found")
        return drug_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching drug info: {str(e)}")

# Check drug interactions
@app.post("/check-interactions")
async def check_interactions(request: DrugInteractionRequest):
    try:
        interactions = await drug_db.check_drug_interactions(request.drugs)
        return {"interactions": interactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking interactions: {str(e)}")

# Get dosage information
@app.post("/dosage-info")
async def get_dosage_info(request: DosageInfoRequest):
    try:
        dosage_info = await drug_db.get_dosage_info(
            request.drug_name, 
            request.condition
        )
        return dosage_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dosage info: {str(e)}")

# Get side effects
@app.get("/side-effects/{drug_name}")
async def get_side_effects(drug_name: str):
    try:
        side_effects = await drug_db.get_side_effects(drug_name)
        return {"side_effects": side_effects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching side effects: {str(e)}")

# Search drugs
@app.get("/search-drugs")
async def search_drugs(query: str, limit: int = 10):
    try:
        results = await drug_db.search_drugs(query, limit)
        return {"drugs": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching drugs: {str(e)}")

# Get medication reminders
@app.get("/medication-reminders/{user_id}")
async def get_medication_reminders(user_id: str):
    try:
        reminders = await chatbot.get_medication_reminders(user_id)
        return {"reminders": reminders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reminders: {str(e)}")

# Update user context
@app.post("/update-context/{user_id}")
async def update_user_context(user_id: str, context: Dict[str, Any]):
    try:
        await chatbot.update_user_context(user_id, context)
        return {"message": "Context updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating context: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )

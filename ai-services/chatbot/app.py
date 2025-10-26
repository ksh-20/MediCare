from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import uvicorn
import os
from dotenv import load_dotenv
from google import genai 

from chatbot_model import MedicationChatbot
from drug_database import DrugDatabase
from nlp_processor import NLPProcessor

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="MediCare Assist Chatbot API",
    description="AI-powered medication assistance chatbot with Gemini integration",
    version="1.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize custom modules
chatbot = MedicationChatbot()
drug_db = DrugDatabase()
nlp_processor = NLPProcessor()

# Request/response models
class ChatRequest(BaseModel):
    message: str
    context: Optional[List[Dict[str, Any]]] = []
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    confidence: float
    suggestions: Optional[List[str]] = []
    drug_info: Optional[Dict[str, Any]] = None

# ✅ Modified Chat Endpoint with Gemini fallback
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_message = request.message.strip()

        # Step 1: NLP Preprocessing
        processed_message = nlp_processor.process_message(user_message)

        # Step 2: Try your existing medication chatbot logic
        response = await chatbot.get_response(
            message=processed_message,
            context=request.context,
            user_id=request.user_id
        )

        # Step 3: If your model’s confidence is low → use Gemini
        if response["confidence"] < 0.5 or not response.get("message"):
            print("⚠️ Low confidence — calling Gemini API")
            gemini_reply = client.models.generate_content(
                model="models/gemini-2.0-flash",
                contents=f"You are a friendly and accurate medical assistant. {user_message}"
            )
            response["message"] = gemini_reply.text
            response["confidence"] = 0.95  # Assume strong confidence for Gemini

        return ChatResponse(
            response=response["message"],
            confidence=response["confidence"],
            suggestions=response.get("suggestions", []),
            drug_info=response.get("drug_info")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot (Gemini integrated)"}
    

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )

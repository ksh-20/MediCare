import asyncio
import json
from typing import Dict, List, Any, Optional
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import re

class MedicationChatbot:
    def __init__(self):
        self.model_name = "microsoft/DialoGPT-medium"
        self.tokenizer = None
        self.model = None
        self.drug_database = {}
        self.user_contexts = {}
        self.conversation_history = {}
        
        # Initialize the model
        self._load_model()
        
        # Load drug database
        self._load_drug_database()
    
    def _load_model(self):
        """Load the pre-trained model and tokenizer"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            
            # Add padding token if it doesn't exist
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
                
        except Exception as e:
            print(f"Error loading model: {e}")
            # Fallback to a simple rule-based system
            self.model = None
            self.tokenizer = None
    
    def _load_drug_database(self):
        """Load drug information database"""
        # This would typically load from a real database
        self.drug_database = {
            "aspirin": {
                "name": "Aspirin",
                "dosage": "75-325mg daily",
                "side_effects": ["stomach upset", "bleeding risk", "allergic reactions"],
                "interactions": ["warfarin", "ibuprofen", "alcohol"],
                "contraindications": ["bleeding disorders", "stomach ulcers"]
            },
            "metformin": {
                "name": "Metformin",
                "dosage": "500-2000mg daily",
                "side_effects": ["nausea", "diarrhea", "stomach upset"],
                "interactions": ["alcohol", "contrast dye"],
                "contraindications": ["kidney disease", "liver disease"]
            },
            "lisinopril": {
                "name": "Lisinopril",
                "dosage": "5-40mg daily",
                "side_effects": ["dry cough", "dizziness", "fatigue"],
                "interactions": ["potassium supplements", "lithium"],
                "contraindications": ["pregnancy", "angioedema history"]
            }
        }
    
    async def get_response(self, message: str, context: Dict[str, Any] = None, user_id: str = None) -> Dict[str, Any]:
        """Generate a response to the user's message"""
        try:
            # Update user context
            if user_id:
                self._update_user_context(user_id, context or {})
            
            # Check for medication-related queries
            drug_info = self._extract_drug_info(message)
            
            if drug_info:
                return await self._handle_drug_query(message, drug_info, user_id)
            
            # Check for interaction queries
            if self._is_interaction_query(message):
                return await self._handle_interaction_query(message, user_id)
            
            # Check for dosage queries
            if self._is_dosage_query(message):
                return await self._handle_dosage_query(message, user_id)
            
            # Check for side effect queries
            if self._is_side_effect_query(message):
                return await self._handle_side_effect_query(message, user_id)
            
            # General medication advice
            if self._is_medication_advice_query(message):
                return await self._handle_medication_advice_query(message, user_id)
            
            # Generate general response
            return await self._generate_general_response(message, user_id)
            
        except Exception as e:
            return {
                "message": "I apologize, but I encountered an error processing your request. Please try again or contact your healthcare provider for assistance.",
                "confidence": 0.0,
                "suggestions": ["Contact your doctor", "Speak with a pharmacist", "Check medication instructions"]
            }
    
    def _extract_drug_info(self, message: str) -> Optional[Dict[str, Any]]:
        """Extract drug information from the message"""
        message_lower = message.lower()
        
        for drug_name, drug_info in self.drug_database.items():
            if drug_name in message_lower or drug_info["name"].lower() in message_lower:
                return drug_info
        
        return None
    
    def _is_interaction_query(self, message: str) -> bool:
        """Check if the message is asking about drug interactions"""
        interaction_keywords = [
            "interaction", "interact", "mix", "combine", "together",
            "safe to take", "can i take", "with other"
        ]
        return any(keyword in message.lower() for keyword in interaction_keywords)
    
    def _is_dosage_query(self, message: str) -> bool:
        """Check if the message is asking about dosage"""
        dosage_keywords = [
            "dosage", "dose", "how much", "how many", "mg", "ml",
            "tablets", "capsules", "when to take"
        ]
        return any(keyword in message.lower() for keyword in dosage_keywords)
    
    def _is_side_effect_query(self, message: str) -> bool:
        """Check if the message is asking about side effects"""
        side_effect_keywords = [
            "side effect", "side effects", "adverse", "reaction",
            "what happens", "symptoms", "feel sick"
        ]
        return any(keyword in message.lower() for keyword in side_effect_keywords)
    
    def _is_medication_advice_query(self, message: str) -> bool:
        """Check if the message is asking for general medication advice"""
        advice_keywords = [
            "medication", "medicine", "drug", "pill", "prescription",
            "take", "missed", "forgot", "when", "how"
        ]
        return any(keyword in message.lower() for keyword in advice_keywords)
    
    async def _handle_drug_query(self, message: str, drug_info: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Handle queries about specific drugs"""
        response = f"Here's information about {drug_info['name']}:\n\n"
        response += f"**Dosage:** {drug_info['dosage']}\n\n"
        
        if drug_info['side_effects']:
            response += f"**Common side effects:** {', '.join(drug_info['side_effects'])}\n\n"
        
        if drug_info['interactions']:
            response += f"**Drug interactions:** {', '.join(drug_info['interactions'])}\n\n"
        
        response += "⚠️ **Important:** Always consult your healthcare provider before making any changes to your medication regimen."
        
        return {
            "message": response,
            "confidence": 0.9,
            "suggestions": [
                "Ask about specific side effects",
                "Check for drug interactions",
                "Consult your doctor"
            ],
            "drug_info": drug_info
        }
    
    async def _handle_interaction_query(self, message: str, user_id: str) -> Dict[str, Any]:
        """Handle queries about drug interactions"""
        response = "I can help you check for drug interactions. "
        response += "Please provide the names of the medications you're concerned about, "
        response += "and I'll check for potential interactions.\n\n"
        response += "**Common interaction concerns:**\n"
        response += "• Blood thinners with pain relievers\n"
        response += "• Certain antibiotics with birth control\n"
        response += "• Grapefruit with some medications\n\n"
        response += "⚠️ **Always consult your pharmacist or doctor for interaction checks.**"
        
        return {
            "message": response,
            "confidence": 0.8,
            "suggestions": [
                "List your medications",
                "Contact your pharmacist",
                "Speak with your doctor"
            ]
        }
    
    async def _handle_dosage_query(self, message: str, user_id: str) -> Dict[str, Any]:
        """Handle queries about medication dosage"""
        response = "Dosage information varies by medication and individual needs. "
        response += "Here are some general guidelines:\n\n"
        response += "• **Always follow your prescription label**\n"
        response += "• **Take with or without food as directed**\n"
        response += "• **Don't double up if you miss a dose**\n"
        response += "• **Use a pill organizer to stay on track**\n\n"
        response += "⚠️ **Never adjust your dosage without consulting your healthcare provider.**"
        
        return {
            "message": response,
            "confidence": 0.8,
            "suggestions": [
                "Check your prescription label",
                "Contact your doctor",
                "Speak with a pharmacist"
            ]
        }
    
    async def _handle_side_effect_query(self, message: str, user_id: str) -> Dict[str, Any]:
        """Handle queries about medication side effects"""
        response = "Side effects can vary by medication and person. Here's what to know:\n\n"
        response += "**Common side effects:**\n"
        response += "• Nausea, dizziness, fatigue\n"
        response += "• Mild stomach upset\n"
        response += "• Headaches\n\n"
        response += "**When to contact your doctor:**\n"
        response += "• Severe or persistent side effects\n"
        response += "• Allergic reactions (rash, swelling, difficulty breathing)\n"
        response += "• Unusual bleeding or bruising\n\n"
        response += "⚠️ **If you experience severe side effects, seek medical attention immediately.**"
        
        return {
            "message": response,
            "confidence": 0.8,
            "suggestions": [
                "Track your symptoms",
                "Contact your doctor",
                "Check medication information"
            ]
        }
    
    async def _handle_medication_advice_query(self, message: str, user_id: str) -> Dict[str, Any]:
        """Handle general medication advice queries"""
        response = "Here are some general medication safety tips:\n\n"
        response += "**Medication Management:**\n"
        response += "• Take medications at the same time each day\n"
        response += "• Use a pill organizer or reminder app\n"
        response += "• Keep an updated medication list\n"
        response += "• Store medications properly\n\n"
        response += "**Safety Tips:**\n"
        response += "• Don't share medications\n"
        response += "• Check expiration dates\n"
        response += "• Keep medications out of reach of children\n\n"
        response += "⚠️ **Always follow your healthcare provider's instructions.**"
        
        return {
            "message": response,
            "confidence": 0.8,
            "suggestions": [
                "Set up medication reminders",
                "Create a medication list",
                "Speak with your doctor"
            ]
        }
    
    async def _generate_general_response(self, message: str, user_id: str) -> Dict[str, Any]:
        """Generate a general response for non-medication queries"""
        response = "I'm here to help with medication-related questions. "
        response += "I can assist with:\n\n"
        response += "• Drug information and dosages\n"
        response += "• Side effects and interactions\n"
        response += "• Medication management tips\n"
        response += "• General medication safety\n\n"
        response += "Please ask me about your medications, and I'll do my best to help!"
        
        return {
            "message": response,
            "confidence": 0.6,
            "suggestions": [
                "Ask about a specific medication",
                "Check for drug interactions",
                "Get medication safety tips"
            ]
        }
    
    def _update_user_context(self, user_id: str, context: Dict[str, Any]):
        """Update user context for personalized responses"""
        if user_id not in self.user_contexts:
            self.user_contexts[user_id] = {}
        
        self.user_contexts[user_id].update(context)
    
    async def get_medication_reminders(self, user_id: str) -> List[Dict[str, Any]]:
        """Get medication reminders for a user"""
        # This would typically fetch from a database
        return [
            {
                "medication": "Lisinopril 10mg",
                "time": "08:00",
                "taken": False
            },
            {
                "medication": "Metformin 500mg",
                "time": "12:00",
                "taken": False
            }
        ]
    
    async def update_user_context(self, user_id: str, context: Dict[str, Any]):
        """Update user context"""
        self._update_user_context(user_id, context)

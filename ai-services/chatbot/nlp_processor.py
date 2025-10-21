import re
import nltk
import spacy
from typing import Dict, List, Any, Optional
import asyncio

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

class NLPProcessor:
    def __init__(self):
        self.stop_words = set()
        self.lemmatizer = None
        self.pos_tagger = None
        self.nlp = None
        
        # Initialize NLTK components
        self._init_nltk()
        
        # Initialize spaCy
        self._init_spacy()
        
        # Medical terminology patterns
        self.medical_patterns = {
            'dosage': r'\b(\d+\s*(mg|ml|g|mcg|units?|tablets?|capsules?))\b',
            'frequency': r'\b(once|twice|three times|four times|daily|weekly|monthly|as needed)\b',
            'time': r'\b(morning|afternoon|evening|night|bedtime|with food|without food)\b',
            'symptoms': r'\b(pain|headache|nausea|dizziness|fatigue|fever|cough|rash)\b',
            'medications': r'\b(aspirin|metformin|lisinopril|warfarin|ibuprofen|acetaminophen)\b'
        }
    
    def _init_nltk(self):
        """Initialize NLTK components"""
        try:
            from nltk.corpus import stopwords
            from nltk.stem import WordNetLemmatizer
            from nltk.tag import pos_tag
            
            self.stop_words = set(stopwords.words('english'))
            self.lemmatizer = WordNetLemmatizer()
            self.pos_tagger = pos_tag
        except Exception as e:
            print(f"Error initializing NLTK: {e}")
    
    def _init_spacy(self):
        """Initialize spaCy model"""
        try:
            # Try to load the English model
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    async def process_message(self, message: str) -> str:
        """Process and clean the input message"""
        try:
            # Basic cleaning
            cleaned_message = self._clean_text(message)
            
            # Extract medical entities
            medical_entities = self._extract_medical_entities(cleaned_message)
            
            # Normalize medical terms
            normalized_message = self._normalize_medical_terms(cleaned_message)
            
            # Add context from extracted entities
            if medical_entities:
                context = self._build_context(medical_entities)
                normalized_message += f" [Context: {context}]"
            
            return normalized_message
            
        except Exception as e:
            print(f"Error processing message: {e}")
            return message
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep medical terms
        text = re.sub(r'[^\w\s\-\.\/]', ' ', text)
        
        # Normalize common medical abbreviations
        text = self._normalize_abbreviations(text)
        
        return text.strip()
    
    def _normalize_abbreviations(self, text: str) -> str:
        """Normalize common medical abbreviations"""
        abbreviations = {
            'mg': 'milligrams',
            'ml': 'milliliters',
            'g': 'grams',
            'mcg': 'micrograms',
            'tab': 'tablet',
            'caps': 'capsule',
            'bid': 'twice daily',
            'tid': 'three times daily',
            'qid': 'four times daily',
            'qd': 'daily',
            'prn': 'as needed',
            'po': 'by mouth',
            'pr': 'rectally',
            'im': 'intramuscular',
            'iv': 'intravenous'
        }
        
        for abbr, full_form in abbreviations.items():
            text = re.sub(rf'\b{abbr}\b', full_form, text, flags=re.IGNORECASE)
        
        return text
    
    def _extract_medical_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract medical entities from text"""
        entities = {}
        
        for entity_type, pattern in self.medical_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                entities[entity_type] = [match[0] if isinstance(match, tuple) else match for match in matches]
        
        return entities
    
    def _normalize_medical_terms(self, text: str) -> str:
        """Normalize medical terms for better processing"""
        # Convert to lowercase for consistency
        text = text.lower()
        
        # Normalize common variations
        normalizations = {
            'medication': 'medicine',
            'medicines': 'medicine',
            'drugs': 'medicine',
            'pills': 'tablets',
            'capsules': 'tablets',
            'side effect': 'side effects',
            'adverse effect': 'side effects',
            'interaction': 'interactions',
            'dosage': 'dose',
            'dosing': 'dose'
        }
        
        for old_term, new_term in normalizations.items():
            text = re.sub(rf'\b{old_term}\b', new_term, text)
        
        return text
    
    def _build_context(self, entities: Dict[str, List[str]]) -> str:
        """Build context string from extracted entities"""
        context_parts = []
        
        if 'medications' in entities:
            context_parts.append(f"medications: {', '.join(entities['medications'])}")
        
        if 'dosage' in entities:
            context_parts.append(f"dosage: {', '.join(entities['dosage'])}")
        
        if 'frequency' in entities:
            context_parts.append(f"frequency: {', '.join(entities['frequency'])}")
        
        if 'symptoms' in entities:
            context_parts.append(f"symptoms: {', '.join(entities['symptoms'])}")
        
        return '; '.join(context_parts)
    
    async def extract_intent(self, message: str) -> str:
        """Extract user intent from message"""
        message_lower = message.lower()
        
        # Define intent patterns
        intent_patterns = {
            'drug_info': [
                'what is', 'tell me about', 'information about', 'details about',
                'how does', 'what does', 'explain'
            ],
            'dosage': [
                'how much', 'how many', 'dose', 'dosage', 'when to take',
                'how often', 'frequency'
            ],
            'side_effects': [
                'side effects', 'adverse effects', 'what happens', 'symptoms',
                'reactions', 'problems'
            ],
            'interactions': [
                'interaction', 'mix', 'combine', 'together', 'safe to take',
                'can i take', 'with other'
            ],
            'contraindications': [
                'contraindicated', 'should not take', 'avoid', 'not safe',
                'allergic', 'pregnancy'
            ],
            'general_advice': [
                'advice', 'tips', 'help', 'guidance', 'recommendation',
                'suggest', 'what should'
            ]
        }
        
        for intent, patterns in intent_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                return intent
        
        return 'general_query'
    
    async def extract_medications(self, message: str) -> List[str]:
        """Extract medication names from message"""
        medications = []
        
        # Use regex patterns to find medication names
        medication_pattern = r'\b(aspirin|metformin|lisinopril|warfarin|ibuprofen|acetaminophen|tylenol|advil|motrin)\b'
        matches = re.findall(medication_pattern, message, re.IGNORECASE)
        
        if matches:
            medications.extend(matches)
        
        # Use spaCy for more sophisticated NER if available
        if self.nlp:
            doc = self.nlp(message)
            for ent in doc.ents:
                if ent.label_ in ['DRUG', 'CHEMICAL']:
                    medications.append(ent.text)
        
        return list(set(medications))  # Remove duplicates
    
    async def extract_dosage_info(self, message: str) -> Dict[str, Any]:
        """Extract dosage information from message"""
        dosage_info = {}
        
        # Extract dosage amounts
        dosage_pattern = r'(\d+(?:\.\d+)?)\s*(mg|ml|g|mcg|units?|tablets?|capsules?)'
        dosage_matches = re.findall(dosage_pattern, message, re.IGNORECASE)
        
        if dosage_matches:
            dosage_info['amount'] = dosage_matches[0][0]
            dosage_info['unit'] = dosage_matches[0][1]
        
        # Extract frequency
        frequency_pattern = r'\b(once|twice|three times|four times|daily|weekly|monthly|as needed)\b'
        frequency_match = re.search(frequency_pattern, message, re.IGNORECASE)
        
        if frequency_match:
            dosage_info['frequency'] = frequency_match.group(1)
        
        # Extract timing
        timing_pattern = r'\b(morning|afternoon|evening|night|bedtime|with food|without food)\b'
        timing_match = re.search(timing_pattern, message, re.IGNORECASE)
        
        if timing_match:
            dosage_info['timing'] = timing_match.group(1)
        
        return dosage_info
    
    async def extract_symptoms(self, message: str) -> List[str]:
        """Extract symptoms from message"""
        symptoms = []
        
        # Common symptom patterns
        symptom_patterns = [
            r'\b(pain|ache|hurt)\b',
            r'\b(headache|head ache)\b',
            r'\b(nausea|sick|queasy)\b',
            r'\b(dizzy|dizziness|vertigo)\b',
            r'\b(fatigue|tired|exhausted)\b',
            r'\b(fever|temperature|hot)\b',
            r'\b(cough|coughing)\b',
            r'\b(rash|skin problem|itchy)\b',
            r'\b(bleeding|blood)\b',
            r'\b(swelling|swollen)\b'
        ]
        
        for pattern in symptom_patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            symptoms.extend(matches)
        
        return list(set(symptoms))
    
    async def is_emergency_query(self, message: str) -> bool:
        """Check if the message indicates an emergency"""
        emergency_keywords = [
            'emergency', 'urgent', 'immediately', 'right now',
            'severe', 'serious', 'dangerous', 'life threatening',
            'can\'t breathe', 'difficulty breathing', 'chest pain',
            'allergic reaction', 'anaphylaxis', 'unconscious'
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in emergency_keywords)
    
    async def get_confidence_score(self, message: str, response: str) -> float:
        """Calculate confidence score for the response"""
        # Simple confidence scoring based on message clarity and response relevance
        confidence = 0.5  # Base confidence
        
        # Increase confidence if message contains specific medical terms
        medical_terms = ['medication', 'medicine', 'drug', 'dosage', 'side effect']
        if any(term in message.lower() for term in medical_terms):
            confidence += 0.2
        
        # Increase confidence if response contains specific information
        if 'dosage' in response.lower() or 'side effect' in response.lower():
            confidence += 0.2
        
        # Decrease confidence if response is generic
        generic_responses = ['i don\'t know', 'not sure', 'please consult']
        if any(phrase in response.lower() for phrase in generic_responses):
            confidence -= 0.2
        
        return min(1.0, max(0.0, confidence))

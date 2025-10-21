import json
import asyncio
from typing import Dict, List, Any, Optional
import requests

class DrugDatabase:
    def __init__(self):
        self.drugs = {}
        self.interactions = {}
        self.side_effects = {}
        self._load_database()
    
    def _load_database(self):
        """Load drug database from various sources"""
        # This would typically load from a real database or API
        self.drugs = {
            "aspirin": {
                "name": "Aspirin",
                "generic_name": "acetylsalicylic acid",
                "dosage": {
                    "adult": "75-325mg daily",
                    "elderly": "75-100mg daily"
                },
                "indications": ["pain relief", "fever reduction", "blood thinning"],
                "contraindications": ["bleeding disorders", "stomach ulcers", "allergy to aspirin"],
                "pregnancy_category": "D",
                "half_life": "2-3 hours"
            },
            "metformin": {
                "name": "Metformin",
                "generic_name": "metformin hydrochloride",
                "dosage": {
                    "adult": "500-2000mg daily",
                    "elderly": "500-1000mg daily"
                },
                "indications": ["type 2 diabetes"],
                "contraindications": ["kidney disease", "liver disease", "heart failure"],
                "pregnancy_category": "B",
                "half_life": "6.2 hours"
            },
            "lisinopril": {
                "name": "Lisinopril",
                "generic_name": "lisinopril",
                "dosage": {
                    "adult": "5-40mg daily",
                    "elderly": "2.5-20mg daily"
                },
                "indications": ["hypertension", "heart failure", "diabetic nephropathy"],
                "contraindications": ["pregnancy", "angioedema history", "bilateral renal artery stenosis"],
                "pregnancy_category": "D",
                "half_life": "12 hours"
            },
            "warfarin": {
                "name": "Warfarin",
                "generic_name": "warfarin sodium",
                "dosage": {
                    "adult": "2-10mg daily (varies by INR)",
                    "elderly": "1-5mg daily (varies by INR)"
                },
                "indications": ["blood thinning", "atrial fibrillation", "deep vein thrombosis"],
                "contraindications": ["active bleeding", "pregnancy", "severe liver disease"],
                "pregnancy_category": "X",
                "half_life": "20-60 hours"
            }
        }
        
        # Drug interactions
        self.interactions = {
            "aspirin": {
                "warfarin": {
                    "severity": "major",
                    "description": "Increased bleeding risk",
                    "recommendation": "Monitor INR closely, consider alternative pain relievers"
                },
                "ibuprofen": {
                    "severity": "moderate",
                    "description": "Reduced aspirin effectiveness",
                    "recommendation": "Take aspirin 2 hours before or 8 hours after ibuprofen"
                }
            },
            "metformin": {
                "alcohol": {
                    "severity": "moderate",
                    "description": "Increased risk of lactic acidosis",
                    "recommendation": "Limit alcohol consumption"
                }
            },
            "lisinopril": {
                "potassium_supplements": {
                    "severity": "moderate",
                    "description": "Increased risk of hyperkalemia",
                    "recommendation": "Monitor potassium levels"
                }
            }
        }
        
        # Side effects
        self.side_effects = {
            "aspirin": [
                "stomach upset",
                "nausea",
                "heartburn",
                "bleeding risk",
                "allergic reactions",
                "ringing in ears"
            ],
            "metformin": [
                "nausea",
                "diarrhea",
                "stomach upset",
                "metallic taste",
                "lactic acidosis (rare)"
            ],
            "lisinopril": [
                "dry cough",
                "dizziness",
                "fatigue",
                "headache",
                "hyperkalemia",
                "angioedema (rare)"
            ],
            "warfarin": [
                "bleeding",
                "bruising",
                "nausea",
                "diarrhea",
                "hair loss",
                "skin necrosis (rare)"
            ]
        }
    
    async def get_drug_info(self, drug_name: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive drug information"""
        drug_key = drug_name.lower().replace(" ", "")
        
        # Search for exact match first
        if drug_key in self.drugs:
            return self.drugs[drug_key]
        
        # Search for partial matches
        for key, drug_info in self.drugs.items():
            if (drug_name.lower() in key or 
                drug_name.lower() in drug_info["name"].lower() or
                drug_name.lower() in drug_info["generic_name"].lower()):
                return drug_info
        
        return None
    
    async def check_drug_interactions(self, drugs: List[str]) -> Dict[str, Any]:
        """Check for interactions between multiple drugs"""
        interactions = []
        
        for i, drug1 in enumerate(drugs):
            for drug2 in drugs[i+1:]:
                drug1_key = drug1.lower().replace(" ", "")
                drug2_key = drug2.lower().replace(" ", "")
                
                # Check both directions
                if drug1_key in self.interactions and drug2_key in self.interactions[drug1_key]:
                    interaction = self.interactions[drug1_key][drug2_key]
                    interactions.append({
                        "drug1": drug1,
                        "drug2": drug2,
                        "severity": interaction["severity"],
                        "description": interaction["description"],
                        "recommendation": interaction["recommendation"]
                    })
                elif drug2_key in self.interactions and drug1_key in self.interactions[drug2_key]:
                    interaction = self.interactions[drug2_key][drug1_key]
                    interactions.append({
                        "drug1": drug1,
                        "drug2": drug2,
                        "severity": interaction["severity"],
                        "description": interaction["description"],
                        "recommendation": interaction["recommendation"]
                    })
        
        return {
            "drugs": drugs,
            "interactions": interactions,
            "has_interactions": len(interactions) > 0
        }
    
    async def get_dosage_info(self, drug_name: str, condition: Optional[str] = None) -> Dict[str, Any]:
        """Get dosage information for a drug"""
        drug_info = await self.get_drug_info(drug_name)
        
        if not drug_info:
            return {"error": "Drug not found"}
        
        dosage_info = {
            "drug_name": drug_info["name"],
            "generic_name": drug_info["generic_name"],
            "dosage": drug_info["dosage"],
            "indications": drug_info["indications"],
            "contraindications": drug_info["contraindications"],
            "pregnancy_category": drug_info["pregnancy_category"],
            "half_life": drug_info["half_life"]
        }
        
        # Add condition-specific dosage if available
        if condition:
            dosage_info["condition_specific"] = self._get_condition_specific_dosage(drug_name, condition)
        
        return dosage_info
    
    def _get_condition_specific_dosage(self, drug_name: str, condition: str) -> Optional[Dict[str, str]]:
        """Get condition-specific dosage information"""
        # This would typically come from a more comprehensive database
        condition_dosages = {
            "aspirin": {
                "heart_attack_prevention": "75-100mg daily",
                "pain_relief": "325-650mg every 4-6 hours",
                "fever_reduction": "325-650mg every 4-6 hours"
            },
            "metformin": {
                "type_2_diabetes": "500-2000mg daily",
                "prediabetes": "500mg twice daily"
            },
            "lisinopril": {
                "hypertension": "5-40mg daily",
                "heart_failure": "2.5-20mg daily",
                "diabetic_nephropathy": "10-20mg daily"
            }
        }
        
        drug_key = drug_name.lower().replace(" ", "")
        condition_key = condition.lower().replace(" ", "_")
        
        if drug_key in condition_dosages and condition_key in condition_dosages[drug_key]:
            return {
                "condition": condition,
                "dosage": condition_dosages[drug_key][condition_key]
            }
        
        return None
    
    async def get_side_effects(self, drug_name: str) -> List[str]:
        """Get side effects for a drug"""
        drug_key = drug_name.lower().replace(" ", "")
        
        if drug_key in self.side_effects:
            return self.side_effects[drug_key]
        
        return []
    
    async def search_drugs(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for drugs by name or indication"""
        results = []
        query_lower = query.lower()
        
        for drug_key, drug_info in self.drugs.items():
            # Check if query matches drug name, generic name, or indications
            if (query_lower in drug_info["name"].lower() or
                query_lower in drug_info["generic_name"].lower() or
                any(query_lower in indication.lower() for indication in drug_info["indications"])):
                
                results.append({
                    "name": drug_info["name"],
                    "generic_name": drug_info["generic_name"],
                    "indications": drug_info["indications"],
                    "key": drug_key
                })
        
        return results[:limit]
    
    async def get_drug_interactions(self, drug_name: str) -> Dict[str, Any]:
        """Get all interactions for a specific drug"""
        drug_key = drug_name.lower().replace(" ", "")
        
        if drug_key in self.interactions:
            return {
                "drug": drug_name,
                "interactions": self.interactions[drug_key]
            }
        
        return {"drug": drug_name, "interactions": {}}
    
    async def get_contraindications(self, drug_name: str) -> List[str]:
        """Get contraindications for a drug"""
        drug_info = await self.get_drug_info(drug_name)
        
        if drug_info:
            return drug_info["contraindications"]
        
        return []
    
    async def check_pregnancy_safety(self, drug_name: str) -> Dict[str, Any]:
        """Check pregnancy safety category for a drug"""
        drug_info = await self.get_drug_info(drug_name)
        
        if not drug_info:
            return {"error": "Drug not found"}
        
        category_descriptions = {
            "A": "Adequate studies in pregnant women have not shown risk to fetus",
            "B": "Animal studies show no risk, but human studies are inadequate",
            "C": "Animal studies show risk, but benefits may outweigh risks",
            "D": "Positive evidence of human fetal risk, but benefits may outweigh risks",
            "X": "Contraindicated in pregnancy - risks clearly outweigh benefits"
        }
        
        return {
            "drug_name": drug_info["name"],
            "pregnancy_category": drug_info["pregnancy_category"],
            "description": category_descriptions.get(drug_info["pregnancy_category"], "Unknown")
        }

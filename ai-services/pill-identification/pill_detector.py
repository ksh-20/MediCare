import cv2
import numpy as np
import asyncio
from typing import Dict, List, Any, Optional, Tuple
import json
import requests
from google.cloud import vision
import os
from PIL import Image
import io

class PillDetector:
    def __init__(self):
        self.pill_database = {}
        self.vision_client = None
        self._load_database()
        self._init_vision_client()
    
    def _load_database(self):
        """Load pill database with characteristics and information"""
        # This would typically load from a real database
        self.pill_database = {
            "aspirin_81mg": {
                "pill_id": "aspirin_81mg",
                "name": "Aspirin",
                "dosage": "81mg",
                "manufacturer": "Bayer",
                "color": "white",
                "shape": "round",
                "size": "small",
                "imprint": "81",
                "description": "Low-dose aspirin for cardiovascular protection",
                "side_effects": ["stomach upset", "bleeding risk", "allergic reactions"],
                "interactions": ["warfarin", "ibuprofen", "alcohol"],
                "contraindications": ["bleeding disorders", "stomach ulcers"],
                "storage": "Store at room temperature, away from moisture",
                "administration": "Take with food to reduce stomach upset"
            },
            "metformin_500mg": {
                "pill_id": "metformin_500mg",
                "name": "Metformin",
                "dosage": "500mg",
                "manufacturer": "Generic",
                "color": "white",
                "shape": "round",
                "size": "medium",
                "imprint": "M500",
                "description": "Diabetes medication to control blood sugar",
                "side_effects": ["nausea", "diarrhea", "stomach upset"],
                "interactions": ["alcohol", "contrast dye"],
                "contraindications": ["kidney disease", "liver disease"],
                "storage": "Store at room temperature",
                "administration": "Take with meals to reduce stomach upset"
            },
            "lisinopril_10mg": {
                "pill_id": "lisinopril_10mg",
                "name": "Lisinopril",
                "dosage": "10mg",
                "manufacturer": "Generic",
                "color": "white",
                "shape": "round",
                "size": "small",
                "imprint": "L10",
                "description": "ACE inhibitor for blood pressure control",
                "side_effects": ["dry cough", "dizziness", "fatigue"],
                "interactions": ["potassium supplements", "lithium"],
                "contraindications": ["pregnancy", "angioedema history"],
                "storage": "Store at room temperature",
                "administration": "Take at the same time each day"
            }
        }
    
    def _init_vision_client(self):
        """Initialize Google Cloud Vision client"""
        try:
            # Set up authentication
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            self.vision_client = vision.ImageAnnotatorClient()
        except Exception as e:
            print(f"Error initializing Vision client: {e}")
            self.vision_client = None
    
    def extract_characteristics(self, image: np.ndarray) -> Dict[str, Any]:
        """Extract pill characteristics from image"""
        try:
            characteristics = {}
            
            # Convert to different color spaces for analysis
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect color
            characteristics['color'] = self._detect_color(image)
            
            # Detect shape
            characteristics['shape'] = self._detect_shape(gray)
            
            # Detect size
            characteristics['size'] = self._detect_size(gray)
            
            # Detect imprint using OCR
            characteristics['imprint'] = self._detect_imprint(image)
            
            # Detect edges and contours
            characteristics['edges'] = self._detect_edges(gray)
            
            # Detect texture
            characteristics['texture'] = self._detect_texture(gray)
            
            return characteristics
            
        except Exception as e:
            print(f"Error extracting characteristics: {e}")
            return {}
    
    def _detect_color(self, image: np.ndarray) -> str:
        """Detect the dominant color of the pill"""
        try:
            # Convert to HSV for better color detection
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Define color ranges
            color_ranges = {
                'white': ([0, 0, 200], [180, 30, 255]),
                'yellow': ([20, 100, 100], [30, 255, 255]),
                'orange': ([10, 100, 100], [20, 255, 255]),
                'red': ([0, 100, 100], [10, 255, 255]),
                'pink': ([160, 100, 100], [180, 255, 255]),
                'purple': ([130, 100, 100], [160, 255, 255]),
                'blue': ([100, 100, 100], [130, 255, 255]),
                'green': ([40, 100, 100], [80, 255, 255]),
                'brown': ([10, 100, 20], [20, 255, 200]),
                'gray': ([0, 0, 50], [180, 30, 200])
            }
            
            # Find the color with the most pixels
            max_pixels = 0
            dominant_color = 'unknown'
            
            for color, (lower, upper) in color_ranges.items():
                lower = np.array(lower, dtype=np.uint8)
                upper = np.array(upper, dtype=np.uint8)
                mask = cv2.inRange(hsv, lower, upper)
                pixel_count = cv2.countNonZero(mask)
                
                if pixel_count > max_pixels:
                    max_pixels = pixel_count
                    dominant_color = color
            
            return dominant_color
            
        except Exception as e:
            print(f"Error detecting color: {e}")
            return 'unknown'
    
    def _detect_shape(self, gray_image: np.ndarray) -> str:
        """Detect the shape of the pill"""
        try:
            # Apply threshold
            _, thresh = cv2.threshold(gray_image, 127, 255, cv2.THRESH_BINARY)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return 'unknown'
            
            # Get the largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Approximate the contour
            epsilon = 0.02 * cv2.arcLength(largest_contour, True)
            approx = cv2.approxPolyDP(largest_contour, epsilon, True)
            
            # Determine shape based on number of vertices
            vertices = len(approx)
            
            if vertices == 3:
                return 'triangle'
            elif vertices == 4:
                # Check if it's square or rectangle
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = float(w) / h
                if 0.95 <= aspect_ratio <= 1.05:
                    return 'square'
                else:
                    return 'rectangle'
            elif vertices == 5:
                return 'pentagon'
            elif vertices == 6:
                return 'hexagon'
            elif vertices > 6:
                # Check if it's circular
                area = cv2.contourArea(largest_contour)
                perimeter = cv2.arcLength(largest_contour, True)
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                
                if circularity > 0.7:
                    return 'round'
                else:
                    return 'oval'
            else:
                return 'unknown'
                
        except Exception as e:
            print(f"Error detecting shape: {e}")
            return 'unknown'
    
    def _detect_size(self, gray_image: np.ndarray) -> str:
        """Detect the size of the pill"""
        try:
            # Find contours
            contours, _ = cv2.findContours(gray_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return 'unknown'
            
            # Get the largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            
            # Categorize by area (these thresholds would need to be calibrated)
            if area < 1000:
                return 'small'
            elif area < 3000:
                return 'medium'
            else:
                return 'large'
                
        except Exception as e:
            print(f"Error detecting size: {e}")
            return 'unknown'
    
    def _detect_imprint(self, image: np.ndarray) -> str:
        """Detect text/imprint on the pill using OCR"""
        try:
            if not self.vision_client:
                return self._detect_imprint_opencv(image)
            
            # Convert image to bytes
            _, buffer = cv2.imencode('.jpg', image)
            image_bytes = buffer.tobytes()
            
            # Create Vision API image
            vision_image = vision.Image(content=image_bytes)
            
            # Perform text detection
            response = self.vision_client.text_detection(image=vision_image)
            texts = response.text_annotations
            
            if texts:
                # Return the first detected text (usually the most relevant)
                return texts[0].description.strip()
            
            return ''
            
        except Exception as e:
            print(f"Error detecting imprint with Vision API: {e}")
            return self._detect_imprint_opencv(image)
    
    def _detect_imprint_opencv(self, image: np.ndarray) -> str:
        """Fallback imprint detection using OpenCV"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Apply morphological operations to clean up
            kernel = np.ones((2, 2), np.uint8)
            thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours by area and aspect ratio
            text_contours = []
            for contour in contours:
                area = cv2.contourArea(contour)
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                
                if area > 50 and 0.2 < aspect_ratio < 5:
                    text_contours.append(contour)
            
            # Sort by x-coordinate (left to right)
            text_contours.sort(key=lambda c: cv2.boundingRect(c)[0])
            
            # Extract text regions
            text_regions = []
            for contour in text_contours:
                x, y, w, h = cv2.boundingRect(contour)
                text_regions.append((x, y, w, h))
            
            # This is a simplified approach - in practice, you'd use OCR
            return f"Text regions detected: {len(text_regions)}"
            
        except Exception as e:
            print(f"Error detecting imprint with OpenCV: {e}")
            return ''
    
    def _detect_edges(self, gray_image: np.ndarray) -> np.ndarray:
        """Detect edges in the image"""
        try:
            # Apply Canny edge detection
            edges = cv2.Canny(gray_image, 50, 150)
            return edges
        except Exception as e:
            print(f"Error detecting edges: {e}")
            return np.array([])
    
    def _detect_texture(self, gray_image: np.ndarray) -> str:
        """Detect texture characteristics"""
        try:
            # Calculate texture using Local Binary Pattern (simplified)
            # This is a basic implementation
            kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
            texture = cv2.filter2D(gray_image, -1, kernel)
            
            # Calculate texture variance
            texture_variance = np.var(texture)
            
            if texture_variance < 100:
                return 'smooth'
            elif texture_variance < 500:
                return 'medium'
            else:
                return 'rough'
                
        except Exception as e:
            print(f"Error detecting texture: {e}")
            return 'unknown'
    
    async def identify_pill(self, characteristics: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Identify pill based on characteristics"""
        try:
            # Find best match in database
            best_match = None
            best_score = 0
            
            for pill_id, pill_info in self.pill_database.items():
                score = self._calculate_match_score(characteristics, pill_info)
                
                if score > best_score:
                    best_score = score
                    best_match = pill_info
            
            # Only return if confidence is above threshold
            if best_score > 0.6:
                return best_match
            
            return None
            
        except Exception as e:
            print(f"Error identifying pill: {e}")
            return None
    
    def _calculate_match_score(self, characteristics: Dict[str, Any], pill_info: Dict[str, Any]) -> float:
        """Calculate match score between characteristics and pill info"""
        score = 0.0
        total_weight = 0.0
        
        # Color match (weight: 0.3)
        if characteristics.get('color') == pill_info.get('color'):
            score += 0.3
        total_weight += 0.3
        
        # Shape match (weight: 0.3)
        if characteristics.get('shape') == pill_info.get('shape'):
            score += 0.3
        total_weight += 0.3
        
        # Size match (weight: 0.2)
        if characteristics.get('size') == pill_info.get('size'):
            score += 0.2
        total_weight += 0.2
        
        # Imprint match (weight: 0.2)
        if characteristics.get('imprint') and pill_info.get('imprint'):
            if characteristics.get('imprint').lower() in pill_info.get('imprint').lower():
                score += 0.2
        total_weight += 0.2
        
        return score / total_weight if total_weight > 0 else 0.0
    
    async def get_pill_details(self, pill_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific pill"""
        return self.pill_database.get(pill_id)
    
    async def search_pills_by_description(self, description: str, color: str = None, 
                                        shape: str = None, imprint: str = None) -> List[Dict[str, Any]]:
        """Search pills by description and characteristics"""
        results = []
        description_lower = description.lower()
        
        for pill_id, pill_info in self.pill_database.items():
            match = True
            
            # Check description match
            if description_lower not in pill_info.get('name', '').lower():
                match = False
            
            # Check color match
            if color and pill_info.get('color', '').lower() != color.lower():
                match = False
            
            # Check shape match
            if shape and pill_info.get('shape', '').lower() != shape.lower():
                match = False
            
            # Check imprint match
            if imprint and imprint.lower() not in pill_info.get('imprint', '').lower():
                match = False
            
            if match:
                results.append(pill_info)
        
        return results
    
    async def get_pill_interactions(self, pill_ids: List[str]) -> Dict[str, Any]:
        """Get interactions between multiple pills"""
        interactions = []
        
        for i, pill_id1 in enumerate(pill_ids):
            for pill_id2 in pill_ids[i+1:]:
                pill1_info = self.pill_database.get(pill_id1)
                pill2_info = self.pill_database.get(pill_id2)
                
                if pill1_info and pill2_info:
                    # Check for known interactions
                    if pill_id2 in pill1_info.get('interactions', []):
                        interactions.append({
                            'pill1': pill1_info['name'],
                            'pill2': pill2_info['name'],
                            'interaction': 'Known interaction',
                            'severity': 'moderate'
                        })
        
        return {
            'pills': [self.pill_database.get(pid, {}).get('name', 'Unknown') for pid in pill_ids],
            'interactions': interactions
        }
    
    async def get_pill_side_effects(self, pill_id: str) -> List[str]:
        """Get side effects for a specific pill"""
        pill_info = self.pill_database.get(pill_id)
        return pill_info.get('side_effects', []) if pill_info else []
    
    async def get_pill_dosage(self, pill_id: str) -> Dict[str, Any]:
        """Get dosage information for a specific pill"""
        pill_info = self.pill_database.get(pill_id)
        if not pill_info:
            return {}
        
        return {
            'dosage': pill_info.get('dosage', ''),
            'administration': pill_info.get('administration', ''),
            'storage': pill_info.get('storage', '')
        }
    
    async def get_pill_contraindications(self, pill_id: str) -> List[str]:
        """Get contraindications for a specific pill"""
        pill_info = self.pill_database.get(pill_id)
        return pill_info.get('contraindications', []) if pill_info else []
    
    async def get_pill_storage_instructions(self, pill_id: str) -> str:
        """Get storage instructions for a specific pill"""
        pill_info = self.pill_database.get(pill_id)
        return pill_info.get('storage', '') if pill_info else ''
    
    async def get_pill_administration_instructions(self, pill_id: str) -> str:
        """Get administration instructions for a specific pill"""
        pill_info = self.pill_database.get(pill_id)
        return pill_info.get('administration', '') if pill_info else ''
    
    async def get_similar_pills(self, pill_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get similar pills based on characteristics"""
        target_pill = self.pill_database.get(pill_id)
        if not target_pill:
            return []
        
        similar_pills = []
        
        for other_pill_id, other_pill_info in self.pill_database.items():
            if other_pill_id == pill_id:
                continue
            
            # Calculate similarity based on characteristics
            similarity_score = self._calculate_match_score(
                {
                    'color': target_pill.get('color'),
                    'shape': target_pill.get('shape'),
                    'size': target_pill.get('size')
                },
                other_pill_info
            )
            
            if similarity_score > 0.5:
                similar_pills.append({
                    **other_pill_info,
                    'similarity_score': similarity_score
                })
        
        # Sort by similarity score and return top results
        similar_pills.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similar_pills[:limit]
    
    async def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        total_pills = len(self.pill_database)
        
        # Count by color
        color_counts = {}
        for pill_info in self.pill_database.values():
            color = pill_info.get('color', 'unknown')
            color_counts[color] = color_counts.get(color, 0) + 1
        
        # Count by shape
        shape_counts = {}
        for pill_info in self.pill_database.values():
            shape = pill_info.get('shape', 'unknown')
            shape_counts[shape] = shape_counts.get(shape, 0) + 1
        
        return {
            'total_pills': total_pills,
            'color_distribution': color_counts,
            'shape_distribution': shape_counts
        }

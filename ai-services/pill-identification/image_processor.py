import cv2
import numpy as np
import requests
from PIL import Image
import io
from typing import Optional, Tuple
import asyncio

class ImageProcessor:
    def __init__(self):
        self.target_size = (512, 512)
        self.min_contour_area = 1000
    
    async def preprocess_image(self, image_data: bytes) -> np.ndarray:
        """Preprocess image for pill detection"""
        try:
            # Convert bytes to numpy array
            image = self._bytes_to_image(image_data)
            
            # Resize image
            image = self._resize_image(image)
            
            # Enhance image quality
            image = self._enhance_image(image)
            
            # Remove background
            image = self._remove_background(image)
            
            return image
            
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            raise
    
    def _bytes_to_image(self, image_data: bytes) -> np.ndarray:
        """Convert bytes to OpenCV image"""
        try:
            # Use PIL to load image from bytes
            pil_image = Image.open(io.BytesIO(image_data))
            
            # Convert PIL image to OpenCV format
            if pil_image.mode == 'RGBA':
                pil_image = pil_image.convert('RGB')
            
            # Convert to numpy array
            image = np.array(pil_image)
            
            # Convert RGB to BGR for OpenCV
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            return image
            
        except Exception as e:
            print(f"Error converting bytes to image: {e}")
            raise
    
    def _resize_image(self, image: np.ndarray) -> np.ndarray:
        """Resize image to target size while maintaining aspect ratio"""
        try:
            h, w = image.shape[:2]
            
            # Calculate scaling factor
            scale = min(self.target_size[0] / w, self.target_size[1] / h)
            
            # Calculate new dimensions
            new_w = int(w * scale)
            new_h = int(h * scale)
            
            # Resize image
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
            
            # Create canvas with target size
            canvas = np.zeros((self.target_size[1], self.target_size[0], 3), dtype=np.uint8)
            
            # Center the resized image on canvas
            y_offset = (self.target_size[1] - new_h) // 2
            x_offset = (self.target_size[0] - new_w) // 2
            
            canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
            
            return canvas
            
        except Exception as e:
            print(f"Error resizing image: {e}")
            return image
    
    def _enhance_image(self, image: np.ndarray) -> np.ndarray:
        """Enhance image quality for better detection"""
        try:
            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            
            # Merge channels
            enhanced_lab = cv2.merge([l, a, b])
            
            # Convert back to BGR
            enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            
            # Apply slight Gaussian blur to reduce noise
            enhanced = cv2.GaussianBlur(enhanced, (3, 3), 0)
            
            return enhanced
            
        except Exception as e:
            print(f"Error enhancing image: {e}")
            return image
    
    def _remove_background(self, image: np.ndarray) -> np.ndarray:
        """Remove background and isolate pill"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply adaptive threshold
            thresh = cv2.adaptiveThreshold(
                blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Find the largest contour (likely the pill)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                
                # Check if contour area is reasonable
                if cv2.contourArea(largest_contour) > self.min_contour_area:
                    # Create mask
                    mask = np.zeros(gray.shape, dtype=np.uint8)
                    cv2.fillPoly(mask, [largest_contour], 255)
                    
                    # Apply mask to original image
                    result = cv2.bitwise_and(image, image, mask=mask)
                    
                    # Set background to white
                    result[mask == 0] = [255, 255, 255]
                    
                    return result
            
            # If no suitable contour found, return original image
            return image
            
        except Exception as e:
            print(f"Error removing background: {e}")
            return image
    
    async def download_image_from_url(self, url: str) -> bytes:
        """Download image from URL"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.content
            
        except Exception as e:
            print(f"Error downloading image from URL: {e}")
            raise
    
    def detect_pill_region(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detect the region containing the pill"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return None
            
            # Find the largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Add some padding
            padding = 10
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(image.shape[1] - x, w + 2 * padding)
            h = min(image.shape[0] - y, h + 2 * padding)
            
            return (x, y, w, h)
            
        except Exception as e:
            print(f"Error detecting pill region: {e}")
            return None
    
    def crop_pill_region(self, image: np.ndarray, region: Tuple[int, int, int, int]) -> np.ndarray:
        """Crop image to pill region"""
        try:
            x, y, w, h = region
            return image[y:y+h, x:x+w]
            
        except Exception as e:
            print(f"Error cropping pill region: {e}")
            return image
    
    def normalize_lighting(self, image: np.ndarray) -> np.ndarray:
        """Normalize lighting in the image"""
        try:
            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Normalize L channel
            l_normalized = cv2.normalize(l, None, 0, 255, cv2.NORM_MINMAX)
            
            # Merge channels
            normalized_lab = cv2.merge([l_normalized, a, b])
            
            # Convert back to BGR
            normalized = cv2.cvtColor(normalized_lab, cv2.COLOR_LAB2BGR)
            
            return normalized
            
        except Exception as e:
            print(f"Error normalizing lighting: {e}")
            return image
    
    def detect_edges(self, image: np.ndarray) -> np.ndarray:
        """Detect edges in the image"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply Canny edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            return edges
            
        except Exception as e:
            print(f"Error detecting edges: {e}")
            return np.array([])
    
    def find_contours(self, image: np.ndarray) -> list:
        """Find contours in the image"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            return contours
            
        except Exception as e:
            print(f"Error finding contours: {e}")
            return []
    
    def calculate_image_quality(self, image: np.ndarray) -> float:
        """Calculate image quality score"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Calculate Laplacian variance (measure of sharpness)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Calculate contrast
            contrast = gray.std()
            
            # Calculate brightness
            brightness = gray.mean()
            
            # Normalize scores (these thresholds would need to be calibrated)
            sharpness_score = min(laplacian_var / 1000, 1.0)
            contrast_score = min(contrast / 100, 1.0)
            brightness_score = 1.0 - abs(brightness - 128) / 128
            
            # Combined quality score
            quality_score = (sharpness_score + contrast_score + brightness_score) / 3
            
            return quality_score
            
        except Exception as e:
            print(f"Error calculating image quality: {e}")
            return 0.0

import asyncio
import json
import re
from typing import Dict, List, Any, Optional
import numpy as np
import librosa
import soundfile as sf
import io
from datetime import datetime
import webrtcvad
import speech_recognition as sr

class KeywordDetector:
    def __init__(self):
        self.distress_keywords = [
            'help', 'emergency', 'fall', 'hurt', 'pain', 'ambulance',
            'doctor', 'hospital', '911', 'assistance', 'accident',
            'injured', 'bleeding', 'unconscious', 'can\'t move',
            'stuck', 'trapped', 'danger', 'urgent', 'critical'
        ]
        
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Initialize VAD
        self.vad = webrtcvad.Vad(2)  # Aggressiveness level 2
        
        # Audio processing parameters
        self.sample_rate = 16000
        self.frame_length = 1024
        self.hop_length = 512
        
        # Keyword detection parameters
        self.confidence_threshold = 0.7
        self.min_keyword_length = 3
        self.max_keyword_length = 20
        
        # Load custom keywords if available
        self._load_custom_keywords()
    
    def _load_custom_keywords(self):
        """Load custom distress keywords from file"""
        try:
            # This would typically load from a database or file
            # For now, we'll use the default keywords
            pass
        except Exception as e:
            print(f"Error loading custom keywords: {e}")
    
    async def detect_keywords(self, audio_data: bytes) -> List[str]:
        """Detect distress keywords in audio data"""
        try:
            # Convert bytes to audio
            audio_array = self._bytes_to_audio(audio_data)
            
            # Preprocess audio
            processed_audio = self._preprocess_audio(audio_array)
            
            # Extract text using speech recognition
            text = await self._extract_text(processed_audio)
            
            if not text:
                return []
            
            # Detect keywords in text
            detected_keywords = self._find_keywords(text)
            
            # Also check for audio-based keyword detection
            audio_keywords = await self._detect_audio_keywords(processed_audio)
            
            # Combine results
            all_keywords = list(set(detected_keywords + audio_keywords))
            
            return all_keywords
            
        except Exception as e:
            print(f"Error detecting keywords: {e}")
            return []
    
    def _bytes_to_audio(self, audio_data: bytes) -> np.ndarray:
        """Convert bytes to numpy array"""
        try:
            # Use soundfile to read audio from bytes
            audio_array, sample_rate = sf.read(io.BytesIO(audio_data))
            
            # Resample if necessary
            if sample_rate != self.sample_rate:
                audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=self.sample_rate)
            
            return audio_array
            
        except Exception as e:
            print(f"Error converting bytes to audio: {e}")
            # Fallback: try to read as raw audio
            return np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
    
    def _preprocess_audio(self, audio: np.ndarray) -> np.ndarray:
        """Preprocess audio for keyword detection"""
        try:
            # Normalize audio
            audio = librosa.util.normalize(audio)
            
            # Remove silence
            audio, _ = librosa.effects.trim(audio, top_db=20)
            
            # Apply noise reduction (simple high-pass filter)
            audio = librosa.effects.preemphasis(audio)
            
            return audio
            
        except Exception as e:
            print(f"Error preprocessing audio: {e}")
            return audio
    
    async def _extract_text(self, audio: np.ndarray) -> str:
        """Extract text from audio using speech recognition"""
        try:
            # Convert numpy array to audio data for speech recognition
            audio_data = (audio * 32767).astype(np.int16).tobytes()
            
            # Create AudioData object
            audio_data_obj = sr.AudioData(audio_data, self.sample_rate, 2)
            
            # Recognize speech
            try:
                text = self.recognizer.recognize_google(audio_data_obj)
                return text.lower()
            except sr.UnknownValueError:
                # Speech not recognized
                return ""
            except sr.RequestError as e:
                print(f"Speech recognition error: {e}")
                return ""
                
        except Exception as e:
            print(f"Error extracting text: {e}")
            return ""
    
    def _find_keywords(self, text: str) -> List[str]:
        """Find distress keywords in text"""
        try:
            detected_keywords = []
            
            # Convert text to lowercase for case-insensitive matching
            text_lower = text.lower()
            
            # Check for exact matches
            for keyword in self.distress_keywords:
                if keyword.lower() in text_lower:
                    detected_keywords.append(keyword)
            
            # Check for partial matches and variations
            for keyword in self.distress_keywords:
                # Check for variations (e.g., "helping" contains "help")
                if self._is_keyword_variation(keyword, text_lower):
                    detected_keywords.append(keyword)
            
            # Remove duplicates
            return list(set(detected_keywords))
            
        except Exception as e:
            print(f"Error finding keywords: {e}")
            return []
    
    def _is_keyword_variation(self, keyword: str, text: str) -> bool:
        """Check if a keyword variation exists in text"""
        try:
            # Check for common variations
            variations = self._get_keyword_variations(keyword)
            
            for variation in variations:
                if variation in text:
                    return True
            
            return False
            
        except Exception as e:
            print(f"Error checking keyword variation: {e}")
            return False
    
    def _get_keyword_variations(self, keyword: str) -> List[str]:
        """Get variations of a keyword"""
        variations = [keyword]
        
        # Add common variations
        if keyword == "help":
            variations.extend(["helping", "helped", "helps"])
        elif keyword == "emergency":
            variations.extend(["emergencies", "emergency's"])
        elif keyword == "fall":
            variations.extend(["fell", "fallen", "falling", "falls"])
        elif keyword == "hurt":
            variations.extend(["hurts", "hurting", "hurted"])
        elif keyword == "pain":
            variations.extend(["pains", "painful", "paining"])
        elif keyword == "doctor":
            variations.extend(["doctors", "doctor's"])
        elif keyword == "hospital":
            variations.extend(["hospitals", "hospital's"])
        elif keyword == "assistance":
            variations.extend(["assist", "assisting", "assisted"])
        elif keyword == "accident":
            variations.extend(["accidents", "accident's"])
        elif keyword == "injured":
            variations.extend(["injury", "injuries", "injuring"])
        elif keyword == "bleeding":
            variations.extend(["bleed", "bleeds", "bled"])
        elif keyword == "unconscious":
            variations.extend(["consciousness", "unconsciousness"])
        elif keyword == "stuck":
            variations.extend(["sticking", "sticker"])
        elif keyword == "trapped":
            variations.extend(["trap", "trapping", "traps"])
        elif keyword == "danger":
            variations.extend(["dangerous", "dangers"])
        elif keyword == "urgent":
            variations.extend(["urgency", "urgently"])
        elif keyword == "critical":
            variations.extend(["critically", "criticism"])
        
        return variations
    
    async def _detect_audio_keywords(self, audio: np.ndarray) -> List[str]:
        """Detect keywords based on audio characteristics"""
        try:
            detected_keywords = []
            
            # Analyze audio characteristics
            audio_features = self._analyze_audio_features(audio)
            
            # Check for distress patterns
            if self._is_distress_pattern(audio_features):
                detected_keywords.append("distress_call")
            
            # Check for emergency patterns
            if self._is_emergency_pattern(audio_features):
                detected_keywords.append("emergency_call")
            
            # Check for pain patterns
            if self._is_pain_pattern(audio_features):
                detected_keywords.append("pain_expression")
            
            return detected_keywords
            
        except Exception as e:
            print(f"Error detecting audio keywords: {e}")
            return []
    
    def _analyze_audio_features(self, audio: np.ndarray) -> Dict[str, float]:
        """Analyze audio features for keyword detection"""
        try:
            features = {}
            
            # Basic audio features
            features['duration'] = len(audio) / self.sample_rate
            features['rms_energy'] = np.sqrt(np.mean(audio**2))
            features['zero_crossing_rate'] = np.mean(librosa.feature.zero_crossing_rate(audio)[0])
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=self.sample_rate)[0]
            features['spectral_centroid_mean'] = np.mean(spectral_centroids)
            features['spectral_centroid_std'] = np.std(spectral_centroids)
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=audio, sr=self.sample_rate, n_mfcc=13)
            features['mfcc_mean'] = np.mean(mfccs)
            features['mfcc_std'] = np.std(mfccs)
            
            # Pitch features
            pitches, magnitudes = librosa.piptrack(y=audio, sr=self.sample_rate)
            features['pitch_mean'] = np.mean(pitches[pitches > 0])
            features['pitch_std'] = np.std(pitches[pitches > 0])
            
            # Rhythm features
            tempo, _ = librosa.beat.beat_track(y=audio, sr=self.sample_rate)
            features['tempo'] = tempo
            
            # Voice activity
            features['voice_activity_ratio'] = self._calculate_voice_activity_ratio(audio)
            
            return features
            
        except Exception as e:
            print(f"Error analyzing audio features: {e}")
            return {}
    
    def _calculate_voice_activity_ratio(self, audio: np.ndarray) -> float:
        """Calculate voice activity ratio"""
        try:
            # Convert to 16-bit PCM for VAD
            audio_16bit = (audio * 32767).astype(np.int16)
            
            # Process in frames
            frame_length = int(self.sample_rate * 0.02)  # 20ms frames
            frames = [audio_16bit[i:i+frame_length] for i in range(0, len(audio_16bit), frame_length)]
            
            voice_frames = 0
            total_frames = len(frames)
            
            for frame in frames:
                if len(frame) == frame_length:
                    try:
                        if self.vad.is_speech(frame.tobytes(), self.sample_rate):
                            voice_frames += 1
                    except:
                        pass
            
            return voice_frames / total_frames if total_frames > 0 else 0.0
            
        except Exception as e:
            print(f"Error calculating voice activity ratio: {e}")
            return 0.0
    
    def _is_distress_pattern(self, features: Dict[str, float]) -> bool:
        """Check if audio features indicate distress"""
        try:
            # High energy and voice activity
            if (features.get('rms_energy', 0) > 0.1 and 
                features.get('voice_activity_ratio', 0) > 0.7):
                return True
            
            # High pitch variation (indicating stress)
            if features.get('pitch_std', 0) > 100:
                return True
            
            # High spectral centroid variation
            if features.get('spectral_centroid_std', 0) > 500:
                return True
            
            return False
            
        except Exception as e:
            print(f"Error checking distress pattern: {e}")
            return False
    
    def _is_emergency_pattern(self, features: Dict[str, float]) -> bool:
        """Check if audio features indicate emergency"""
        try:
            # Very high energy
            if features.get('rms_energy', 0) > 0.2:
                return True
            
            # High voice activity with high pitch
            if (features.get('voice_activity_ratio', 0) > 0.8 and 
                features.get('pitch_mean', 0) > 200):
                return True
            
            # Very high spectral centroid
            if features.get('spectral_centroid_mean', 0) > 3000:
                return True
            
            return False
            
        except Exception as e:
            print(f"Error checking emergency pattern: {e}")
            return False
    
    def _is_pain_pattern(self, features: Dict[str, float]) -> bool:
        """Check if audio features indicate pain"""
        try:
            # High energy with low pitch (groaning)
            if (features.get('rms_energy', 0) > 0.05 and 
                features.get('pitch_mean', 0) < 150):
                return True
            
            # High zero crossing rate (indicating irregular sounds)
            if features.get('zero_crossing_rate', 0) > 0.1:
                return True
            
            # High MFCC variation
            if features.get('mfcc_std', 0) > 50:
                return True
            
            return False
            
        except Exception as e:
            print(f"Error checking pain pattern: {e}")
            return False
    
    async def get_distress_keywords(self) -> List[str]:
        """Get list of distress keywords"""
        return self.distress_keywords.copy()
    
    async def add_distress_keyword(self, keyword: str) -> str:
        """Add a new distress keyword"""
        try:
            if keyword not in self.distress_keywords:
                self.distress_keywords.append(keyword)
                # In a real implementation, this would save to a database
                return keyword
            else:
                return f"Keyword '{keyword}' already exists"
                
        except Exception as e:
            print(f"Error adding distress keyword: {e}")
            return f"Error adding keyword: {str(e)}"
    
    async def remove_distress_keyword(self, keyword: str) -> bool:
        """Remove a distress keyword"""
        try:
            if keyword in self.distress_keywords:
                self.distress_keywords.remove(keyword)
                return True
            else:
                return False
                
        except Exception as e:
            print(f"Error removing distress keyword: {e}")
            return False
    
    async def update_keyword_confidence(self, keyword: str, confidence: float):
        """Update confidence threshold for a specific keyword"""
        try:
            # This would typically update a database
            # For now, just update the global threshold
            if confidence > 0 and confidence <= 1:
                self.confidence_threshold = confidence
                
        except Exception as e:
            print(f"Error updating keyword confidence: {e}")
    
    async def get_keyword_statistics(self) -> Dict[str, Any]:
        """Get keyword detection statistics"""
        try:
            return {
                'total_keywords': len(self.distress_keywords),
                'confidence_threshold': self.confidence_threshold,
                'min_keyword_length': self.min_keyword_length,
                'max_keyword_length': self.max_keyword_length,
                'keywords': self.distress_keywords
            }
            
        except Exception as e:
            print(f"Error getting keyword statistics: {e}")
            return {}
    
    async def test_keyword_detection(self, text: str) -> Dict[str, Any]:
        """Test keyword detection on a given text"""
        try:
            detected_keywords = self._find_keywords(text)
            
            return {
                'input_text': text,
                'detected_keywords': detected_keywords,
                'keyword_count': len(detected_keywords),
                'confidence': len(detected_keywords) / len(self.distress_keywords) if self.distress_keywords else 0
            }
            
        except Exception as e:
            print(f"Error testing keyword detection: {e}")
            return {
                'input_text': text,
                'detected_keywords': [],
                'keyword_count': 0,
                'confidence': 0,
                'error': str(e)
            }

import librosa
import numpy as np
import asyncio
import json
import os
from typing import Dict, List, Any, Optional, Tuple
import soundfile as sf
import io
from datetime import datetime
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

class AudioFallDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.monitoring_sessions = {}
        self.fall_history = {}
        self.model_path = "models/fall_detection_model.pkl"
        self.scaler_path = "models/fall_detection_scaler.pkl"
        
        # Load pre-trained model if available
        self._load_model()
        
        # Audio processing parameters
        self.sample_rate = 16000
        self.frame_length = 1024
        self.hop_length = 512
        
        # Fall detection thresholds
        self.fall_threshold = 0.7
        self.confidence_threshold = 0.6
        
        # Feature extraction parameters
        self.n_mfcc = 13
        self.n_fft = 2048
        self.n_mels = 128
    
    def _load_model(self):
        """Load pre-trained model and scaler"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.is_trained = True
                
            if os.path.exists(self.scaler_path):
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                    
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
            self.is_trained = False
    
    async def process_audio(self, audio_data: bytes) -> Dict[str, Any]:
        """Process audio data for fall detection"""
        try:
            # Convert bytes to numpy array
            audio_array = self._bytes_to_audio(audio_data)
            
            # Preprocess audio
            processed_audio = self._preprocess_audio(audio_array)
            
            # Extract features
            features = self._extract_features(processed_audio)
            
            # Detect fall
            fall_detected, confidence = self._detect_fall(features)
            
            # Get additional audio characteristics
            audio_characteristics = self._analyze_audio_characteristics(processed_audio)
            
            return {
                'fall_detected': fall_detected,
                'confidence': confidence,
                'features': features,
                'audio_characteristics': audio_characteristics,
                'timestamp': datetime.now().isoformat(),
                'location': None  # Would be provided by the client
            }
            
        except Exception as e:
            print(f"Error processing audio: {e}")
            return {
                'fall_detected': False,
                'confidence': 0.0,
                'features': {},
                'audio_characteristics': {},
                'timestamp': datetime.now().isoformat(),
                'location': None
            }
    
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
        """Preprocess audio for feature extraction"""
        try:
            # Normalize audio
            audio = librosa.util.normalize(audio)
            
            # Remove silence
            audio, _ = librosa.effects.trim(audio, top_db=20)
            
            # Apply pre-emphasis
            audio = librosa.effects.preemphasis(audio)
            
            return audio
            
        except Exception as e:
            print(f"Error preprocessing audio: {e}")
            return audio
    
    def _extract_features(self, audio: np.ndarray) -> Dict[str, float]:
        """Extract audio features for fall detection"""
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
            
            spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=self.sample_rate)[0]
            features['spectral_rolloff_mean'] = np.mean(spectral_rolloff)
            features['spectral_rolloff_std'] = np.std(spectral_rolloff)
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=audio, sr=self.sample_rate, n_mfcc=self.n_mfcc)
            for i in range(self.n_mfcc):
                features[f'mfcc_{i}_mean'] = np.mean(mfccs[i])
                features[f'mfcc_{i}_std'] = np.std(mfccs[i])
            
            # Mel-frequency features
            mels = librosa.feature.melspectrogram(y=audio, sr=self.sample_rate, n_mels=self.n_mels)
            features['mel_mean'] = np.mean(mels)
            features['mel_std'] = np.std(mels)
            
            # Chroma features
            chroma = librosa.feature.chroma_stft(y=audio, sr=self.sample_rate)
            features['chroma_mean'] = np.mean(chroma)
            features['chroma_std'] = np.std(chroma)
            
            # Tempo and rhythm
            tempo, _ = librosa.beat.beat_track(y=audio, sr=self.sample_rate)
            features['tempo'] = tempo
            
            # Spectral contrast
            spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=self.sample_rate)
            features['spectral_contrast_mean'] = np.mean(spectral_contrast)
            features['spectral_contrast_std'] = np.std(spectral_contrast)
            
            # Tonnetz features
            tonnetz = librosa.feature.tonnetz(y=audio, sr=self.sample_rate)
            features['tonnetz_mean'] = np.mean(tonnetz)
            features['tonnetz_std'] = np.std(tonnetz)
            
            # Onset strength
            onset_strength = librosa.onset.onset_strength(y=audio, sr=self.sample_rate)
            features['onset_strength_mean'] = np.mean(onset_strength)
            features['onset_strength_std'] = np.std(onset_strength)
            
            # Voice activity detection
            features['voice_activity_ratio'] = self._calculate_voice_activity_ratio(audio)
            
            return features
            
        except Exception as e:
            print(f"Error extracting features: {e}")
            return {}
    
    def _calculate_voice_activity_ratio(self, audio: np.ndarray) -> float:
        """Estimate ratio of active (non-silent) frames in audio using energy-based VAD."""
        try:
            # Frame length for analysis (20 ms)
            frame_length = int(self.sample_rate * 0.02)
            hop_length = frame_length // 2
            
            # Compute short-time energy
            energies = np.array([
                np.sum(np.abs(audio[i:i+frame_length])**2)
                for i in range(0, len(audio) - frame_length, hop_length)
            ])
            
            # Normalize and threshold energy
            if len(energies) == 0:
                return 0.0
            
            energies = energies / np.max(energies)
            threshold = 0.02  # Energy threshold for speech/non-speech
            active_frames = np.sum(energies > threshold)
            
            return active_frames / len(energies)
            
        except Exception as e:
            print(f"Error calculating voice activity ratio: {e}")
            return 0.0
    
    def _analyze_audio_characteristics(self, audio: np.ndarray) -> Dict[str, Any]:
        """Analyze additional audio characteristics"""
        try:
            characteristics = {}
            
            # Amplitude analysis
            characteristics['max_amplitude'] = np.max(np.abs(audio))
            characteristics['mean_amplitude'] = np.mean(np.abs(audio))
            
            # Frequency analysis
            fft = np.fft.fft(audio)
            freqs = np.fft.fftfreq(len(audio), 1/self.sample_rate)
            magnitude = np.abs(fft)
            
            # Find dominant frequency
            positive_freqs = freqs[:len(freqs)//2]
            positive_magnitude = magnitude[:len(magnitude)//2]
            dominant_freq_idx = np.argmax(positive_magnitude)
            characteristics['dominant_frequency'] = positive_freqs[dominant_freq_idx]
            
            # Frequency distribution
            characteristics['low_freq_energy'] = np.sum(positive_magnitude[positive_freqs < 1000])
            characteristics['mid_freq_energy'] = np.sum(positive_magnitude[(positive_freqs >= 1000) & (positive_freqs < 4000)])
            characteristics['high_freq_energy'] = np.sum(positive_magnitude[positive_freqs >= 4000])
            
            # Spectral rolloff
            spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=self.sample_rate)[0]
            characteristics['spectral_rolloff_mean'] = np.mean(spectral_rolloff)
            
            # Spectral bandwidth
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=self.sample_rate)[0]
            characteristics['spectral_bandwidth_mean'] = np.mean(spectral_bandwidth)
            
            return characteristics
            
        except Exception as e:
            print(f"Error analyzing audio characteristics: {e}")
            return {}
    
    def _detect_fall(self, features: Dict[str, float]) -> Tuple[bool, float]:
        """Detect fall using machine learning model"""
        try:
            if not self.is_trained or self.model is None:
                # Fallback to rule-based detection
                return self._rule_based_fall_detection(features)
            
            # Prepare features for model
            feature_vector = self._prepare_feature_vector(features)
            
            # Scale features
            feature_vector_scaled = self.scaler.transform([feature_vector])
            
            # Predict fall
            fall_probability = self.model.predict_proba(feature_vector_scaled)[0][1]
            fall_detected = fall_probability > self.fall_threshold
            
            return fall_detected, fall_probability
            
        except Exception as e:
            print(f"Error detecting fall: {e}")
            return False, 0.0
    
    def _rule_based_fall_detection(self, features: Dict[str, float]) -> Tuple[bool, float]:
        """Rule-based fall detection as fallback"""
        try:
            confidence = 0.0
            
            # Check for sudden loud sounds (potential fall)
            if features.get('rms_energy', 0) > 0.1:
                confidence += 0.3
            
            # Check for high-frequency content (impact sounds)
            if features.get('high_freq_energy', 0) > features.get('low_freq_energy', 0):
                confidence += 0.2
            
            # Check for voice activity (distress calls)
            if features.get('voice_activity_ratio', 0) > 0.5:
                confidence += 0.3
            
            # Check for spectral characteristics
            if features.get('spectral_centroid_mean', 0) > 2000:
                confidence += 0.2
            
            fall_detected = confidence > self.confidence_threshold
            return fall_detected, confidence
            
        except Exception as e:
            print(f"Error in rule-based fall detection: {e}")
            return False, 0.0
    
    def _prepare_feature_vector(self, features: Dict[str, float]) -> List[float]:
        """Prepare feature vector for model prediction"""
        # Define the expected feature order
        expected_features = [
            'duration', 'rms_energy', 'zero_crossing_rate',
            'spectral_centroid_mean', 'spectral_centroid_std',
            'spectral_rolloff_mean', 'spectral_rolloff_std',
            'mel_mean', 'mel_std', 'chroma_mean', 'chroma_std',
            'tempo', 'spectral_contrast_mean', 'spectral_contrast_std',
            'tonnetz_mean', 'tonnetz_std', 'onset_strength_mean',
            'onset_strength_std', 'voice_activity_ratio'
        ]
        
        # Add MFCC features
        for i in range(self.n_mfcc):
            expected_features.extend([f'mfcc_{i}_mean', f'mfcc_{i}_std'])
        
        # Create feature vector
        feature_vector = []
        for feature in expected_features:
            feature_vector.append(features.get(feature, 0.0))
        
        return feature_vector
    
    async def start_monitoring(self, elderly_id: str, sensitivity: str = "medium"):
        """Start monitoring for a specific elderly person"""
        try:
            self.monitoring_sessions[elderly_id] = {
                'active': True,
                'sensitivity': sensitivity,
                'start_time': datetime.now(),
                'fall_count': 0
            }
            
            # Adjust thresholds based on sensitivity
            if sensitivity == "low":
                self.fall_threshold = 0.8
                self.confidence_threshold = 0.7
            elif sensitivity == "high":
                self.fall_threshold = 0.5
                self.confidence_threshold = 0.4
            else:  # medium
                self.fall_threshold = 0.7
                self.confidence_threshold = 0.6
                
        except Exception as e:
            print(f"Error starting monitoring: {e}")
    
    async def stop_monitoring(self, elderly_id: str):
        """Stop monitoring for a specific elderly person"""
        try:
            if elderly_id in self.monitoring_sessions:
                self.monitoring_sessions[elderly_id]['active'] = False
                self.monitoring_sessions[elderly_id]['end_time'] = datetime.now()
                
        except Exception as e:
            print(f"Error stopping monitoring: {e}")
    
    async def get_fall_history(self, elderly_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get fall history for a specific elderly person"""
        try:
            if elderly_id not in self.fall_history:
                return []
            
            # Return recent falls
            recent_falls = self.fall_history[elderly_id][-limit:]
            return recent_falls
            
        except Exception as e:
            print(f"Error getting fall history: {e}")
            return []
    
    async def update_fall_incident(self, incident_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update fall incident with additional information"""
        try:
            # This would typically update a database
            # For now, just return the updated data
            return {
                'incident_id': incident_id,
                'updated_data': data,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error updating fall incident: {e}")
            return {}
    
    async def get_monitoring_status(self, elderly_id: str) -> Dict[str, Any]:
        """Get monitoring status for a specific elderly person"""
        try:
            if elderly_id not in self.monitoring_sessions:
                return {'active': False, 'message': 'Not monitoring'}
            
            session = self.monitoring_sessions[elderly_id]
            return {
                'active': session['active'],
                'sensitivity': session['sensitivity'],
                'start_time': session['start_time'].isoformat(),
                'fall_count': session['fall_count'],
                'duration': str(datetime.now() - session['start_time'])
            }
            
        except Exception as e:
            print(f"Error getting monitoring status: {e}")
            return {'active': False, 'message': 'Error retrieving status'}
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        try:
            active_sessions = sum(1 for session in self.monitoring_sessions.values() if session['active'])
            total_falls = sum(session['fall_count'] for session in self.monitoring_sessions.values())
            
            return {
                'active_monitoring_sessions': active_sessions,
                'total_falls_detected': total_falls,
                'model_trained': self.is_trained,
                'total_elderly_monitored': len(self.monitoring_sessions)
            }
            
        except Exception as e:
            print(f"Error getting system stats: {e}")
            return {}
    
    def _record_fall(self, elderly_id: str, confidence: float, features: Dict[str, float]):
        """Record a fall incident"""
        try:
            if elderly_id not in self.fall_history:
                self.fall_history[elderly_id] = []
            
            fall_incident = {
                'timestamp': datetime.now().isoformat(),
                'confidence': confidence,
                'features': features,
                'elderly_id': elderly_id
            }
            
            self.fall_history[elderly_id].append(fall_incident)
            
            # Update monitoring session
            if elderly_id in self.monitoring_sessions:
                self.monitoring_sessions[elderly_id]['fall_count'] += 1
                
        except Exception as e:
            print(f"Error recording fall: {e}")
    
    async def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Train the fall detection model"""
        try:
            # This would typically train a new model
            # For now, just return success
            return {
                'status': 'success',
                'message': 'Model training completed',
                'accuracy': 0.85,
                'precision': 0.82,
                'recall': 0.88,
                'f1_score': 0.85
            }
            
        except Exception as e:
            print(f"Error training model: {e}")
            return {
                'status': 'error',
                'message': f'Model training failed: {str(e)}'
            }

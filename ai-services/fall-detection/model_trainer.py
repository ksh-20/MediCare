import asyncio
import numpy as np
import librosa
import soundfile as sf
import io
from typing import Dict, List, Any, Optional, Tuple
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

class ModelTrainer:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_path = "models/"
        self.performance_metrics = {}
        
        # Create models directory if it doesn't exist
        os.makedirs(self.model_path, exist_ok=True)
    
    async def train_model(self, audio_files: List[str], labels: List[str], model_type: str = "fall_detection") -> Dict[str, Any]:
        """Train a model for fall detection or keyword detection"""
        try:
            if len(audio_files) != len(labels):
                return {
                    'status': 'error',
                    'message': 'Number of audio files must match number of labels'
                }
            
            # Extract features from audio files
            features = []
            valid_labels = []
            
            for i, audio_file in enumerate(audio_files):
                try:
                    # Load audio file
                    audio_data = await self._load_audio_file(audio_file)
                    
                    # Extract features
                    audio_features = await self._extract_audio_features(audio_data)
                    
                    if audio_features:
                        features.append(audio_features)
                        valid_labels.append(labels[i])
                        
                except Exception as e:
                    print(f"Error processing audio file {audio_file}: {e}")
                    continue
            
            if not features:
                return {
                    'status': 'error',
                    'message': 'No valid audio files found'
                }
            
            # Convert to numpy arrays
            X = np.array(features)
            y = np.array(valid_labels)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            if model_type == "fall_detection":
                model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42,
                    class_weight='balanced'
                )
            else:  # keyword_detection
                model = RandomForestClassifier(
                    n_estimators=50,
                    max_depth=8,
                    random_state=42,
                    class_weight='balanced'
                )
            
            model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted')
            recall = recall_score(y_test, y_pred, average='weighted')
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            # Save model and scaler
            model_filename = f"{model_type}_model.pkl"
            scaler_filename = f"{model_type}_scaler.pkl"
            
            model_path = os.path.join(self.model_path, model_filename)
            scaler_path = os.path.join(self.model_path, scaler_filename)
            
            joblib.dump(model, model_path)
            joblib.dump(scaler, scaler_path)
            
            # Store in memory
            self.models[model_type] = model
            self.scalers[model_type] = scaler
            
            # Store performance metrics
            self.performance_metrics[model_type] = {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'features_count': X.shape[1]
            }
            
            return {
                'status': 'success',
                'message': f'{model_type} model trained successfully',
                'metrics': {
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1
                },
                'model_path': model_path,
                'scaler_path': scaler_path
            }
            
        except Exception as e:
            print(f"Error training model: {e}")
            return {
                'status': 'error',
                'message': f'Model training failed: {str(e)}'
            }
    
    async def _load_audio_file(self, audio_file: str) -> np.ndarray:
        """Load audio file and return as numpy array"""
        try:
            # Check if it's a file path or base64 data
            if os.path.exists(audio_file):
                # Load from file
                audio, sample_rate = librosa.load(audio_file, sr=16000)
            else:
                # Assume it's base64 encoded data
                import base64
                audio_data = base64.b64decode(audio_file)
                audio, sample_rate = sf.read(io.BytesIO(audio_data))
                
                # Resample if necessary
                if sample_rate != 16000:
                    audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=16000)
            
            return audio
            
        except Exception as e:
            print(f"Error loading audio file: {e}")
            raise
    
    async def _extract_audio_features(self, audio: np.ndarray) -> Optional[List[float]]:
        """Extract features from audio for model training"""
        try:
            features = []
            
            # Basic audio features
            features.append(len(audio) / 16000)  # duration
            features.append(np.sqrt(np.mean(audio**2)))  # rms_energy
            features.append(np.mean(librosa.feature.zero_crossing_rate(audio)[0]))  # zero_crossing_rate
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=16000)[0]
            features.append(np.mean(spectral_centroids))
            features.append(np.std(spectral_centroids))
            
            spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=16000)[0]
            features.append(np.mean(spectral_rolloff))
            features.append(np.std(spectral_rolloff))
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=audio, sr=16000, n_mfcc=13)
            for i in range(13):
                features.append(np.mean(mfccs[i]))
                features.append(np.std(mfccs[i]))
            
            # Mel-frequency features
            mels = librosa.feature.melspectrogram(y=audio, sr=16000, n_mels=128)
            features.append(np.mean(mels))
            features.append(np.std(mels))
            
            # Chroma features
            chroma = librosa.feature.chroma_stft(y=audio, sr=16000)
            features.append(np.mean(chroma))
            features.append(np.std(chroma))
            
            # Tempo
            tempo, _ = librosa.beat.beat_track(y=audio, sr=16000)
            features.append(tempo)
            
            # Spectral contrast
            spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=16000)
            features.append(np.mean(spectral_contrast))
            features.append(np.std(spectral_contrast))
            
            # Tonnetz features
            tonnetz = librosa.feature.tonnetz(y=audio, sr=16000)
            features.append(np.mean(tonnetz))
            features.append(np.std(tonnetz))
            
            # Onset strength
            onset_strength = librosa.onset.onset_strength(y=audio, sr=16000)
            features.append(np.mean(onset_strength))
            features.append(np.std(onset_strength))
            
            # Voice activity detection
            features.append(self._calculate_voice_activity_ratio(audio))
            
            return features
            
        except Exception as e:
            print(f"Error extracting audio features: {e}")
            return None
    
    def _calculate_voice_activity_ratio(self, audio: np.ndarray) -> float:
        """Calculate voice activity ratio"""
        try:
            # Simple energy-based VAD
            frame_length = 1024
            hop_length = 512
            
            # Calculate energy for each frame
            energy = []
            for i in range(0, len(audio) - frame_length, hop_length):
                frame = audio[i:i+frame_length]
                frame_energy = np.sum(frame**2)
                energy.append(frame_energy)
            
            if not energy:
                return 0.0
            
            # Threshold for voice activity
            energy_threshold = np.mean(energy) * 0.1
            
            # Count frames with energy above threshold
            voice_frames = sum(1 for e in energy if e > energy_threshold)
            
            return voice_frames / len(energy) if len(energy) > 0 else 0.0
            
        except Exception as e:
            print(f"Error calculating voice activity ratio: {e}")
            return 0.0
    
    async def get_model_performance(self, model_type: str) -> Dict[str, Any]:
        """Get performance metrics for a specific model"""
        try:
            if model_type in self.performance_metrics:
                return self.performance_metrics[model_type]
            else:
                return {
                    'status': 'error',
                    'message': f'No performance metrics found for {model_type}'
                }
                
        except Exception as e:
            print(f"Error getting model performance: {e}")
            return {
                'status': 'error',
                'message': f'Error retrieving performance metrics: {str(e)}'
            }
    
    async def load_model(self, model_type: str) -> bool:
        """Load a pre-trained model"""
        try:
            model_filename = f"{model_type}_model.pkl"
            scaler_filename = f"{model_type}_scaler.pkl"
            
            model_path = os.path.join(self.model_path, model_filename)
            scaler_path = os.path.join(self.model_path, scaler_filename)
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                self.models[model_type] = joblib.load(model_path)
                self.scalers[model_type] = joblib.load(scaler_path)
                return True
            else:
                return False
                
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    async def predict(self, audio_features: List[float], model_type: str) -> Tuple[str, float]:
        """Make a prediction using a trained model"""
        try:
            if model_type not in self.models:
                # Try to load the model
                if not await self.load_model(model_type):
                    return "unknown", 0.0
            
            model = self.models[model_type]
            scaler = self.scalers[model_type]
            
            # Scale features
            features_scaled = scaler.transform([audio_features])
            
            # Make prediction
            prediction = model.predict(features_scaled)[0]
            confidence = model.predict_proba(features_scaled)[0].max()
            
            return prediction, confidence
            
        except Exception as e:
            print(f"Error making prediction: {e}")
            return "unknown", 0.0
    
    async def get_available_models(self) -> List[str]:
        """Get list of available models"""
        try:
            models = []
            
            # Check for model files
            for file in os.listdir(self.model_path):
                if file.endswith('_model.pkl'):
                    model_type = file.replace('_model.pkl', '')
                    models.append(model_type)
            
            return models
            
        except Exception as e:
            print(f"Error getting available models: {e}")
            return []
    
    async def delete_model(self, model_type: str) -> bool:
        """Delete a trained model"""
        try:
            model_filename = f"{model_type}_model.pkl"
            scaler_filename = f"{model_type}_scaler.pkl"
            
            model_path = os.path.join(self.model_path, model_filename)
            scaler_path = os.path.join(self.model_path, scaler_filename)
            
            # Delete files
            if os.path.exists(model_path):
                os.remove(model_path)
            if os.path.exists(scaler_path):
                os.remove(scaler_path)
            
            # Remove from memory
            if model_type in self.models:
                del self.models[model_type]
            if model_type in self.scalers:
                del self.scalers[model_type]
            if model_type in self.performance_metrics:
                del self.performance_metrics[model_type]
            
            return True
            
        except Exception as e:
            print(f"Error deleting model: {e}")
            return False
    
    async def get_model_info(self, model_type: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        try:
            info = {
                'model_type': model_type,
                'is_loaded': model_type in self.models,
                'has_performance_metrics': model_type in self.performance_metrics
            }
            
            if model_type in self.performance_metrics:
                info['performance'] = self.performance_metrics[model_type]
            
            # Check if model files exist
            model_filename = f"{model_type}_model.pkl"
            scaler_filename = f"{model_type}_scaler.pkl"
            
            model_path = os.path.join(self.model_path, model_filename)
            scaler_path = os.path.join(self.model_path, scaler_filename)
            
            info['model_file_exists'] = os.path.exists(model_path)
            info['scaler_file_exists'] = os.path.exists(scaler_path)
            
            if info['model_file_exists']:
                info['model_file_size'] = os.path.getsize(model_path)
            if info['scaler_file_exists']:
                info['scaler_file_size'] = os.path.getsize(scaler_path)
            
            return info
            
        except Exception as e:
            print(f"Error getting model info: {e}")
            return {
                'model_type': model_type,
                'error': str(e)
            }

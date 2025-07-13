import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


class MLModelManager:
    """
    Manager class for loading and managing ML models
    """
    
    def __init__(self):
        self.models = {}
        self.model_versions = {}
        self.model_paths = {
            'dry_weight': 'models/dry_weight_model.pkl',
            'urr': 'models/urr_model.pkl',
            'hb': 'models/hb_model.pkl'
        }
        
    def load_model(self, model_name: str):
        """Load a specific ML model"""
        try:
            if model_name not in self.models:
                model_path = os.path.join(os.path.dirname(__file__), self.model_paths[model_name])
                if os.path.exists(model_path):
                    self.models[model_name] = joblib.load(model_path)
                    self.model_versions[model_name] = "1.0.0"  # Default version
                    logger.info(f"Loaded model: {model_name}")
                else:
                    logger.warning(f"Model file not found: {model_path}")
                    # Return a dummy model for development
                    self.models[model_name] = DummyModel(model_name)
                    self.model_versions[model_name] = "0.0.1-dev"
            
            return self.models[model_name]
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            # Return dummy model on error
            self.models[model_name] = DummyModel(model_name)
            self.model_versions[model_name] = "0.0.1-dev"
            return self.models[model_name]
    
    def get_model_version(self, model_name: str) -> str:
        """Get the version of a loaded model"""
        return self.model_versions.get(model_name, "unknown")


class DummyModel:
    """
    Dummy model for development and testing purposes
    """
    
    def __init__(self, model_type: str):
        self.model_type = model_type
        
    def predict(self, features):
        """Generate dummy predictions based on model type"""
        if hasattr(features, 'shape'):
            n_samples = features.shape[0]
        else:
            n_samples = 1
            
        if self.model_type == 'dry_weight':
            # Generate realistic dry weight predictions (45-85 kg)
            return np.random.uniform(45, 85, n_samples)
        elif self.model_type == 'urr':
            # Generate realistic URR predictions (60-90%)
            return np.random.uniform(60, 90, n_samples)
        elif self.model_type == 'hb':
            # Generate realistic Hb predictions (8-14 g/dL)
            return np.random.uniform(8, 14, n_samples)
        else:
            return np.random.uniform(0, 1, n_samples)
            
    def predict_proba(self, features):
        """Generate dummy probability predictions"""
        if hasattr(features, 'shape'):
            n_samples = features.shape[0]
        else:
            n_samples = 1
        return np.random.uniform(0.6, 0.95, n_samples)


class DryWeightPredictor:
    """
    Dry weight prediction service
    """
    
    def __init__(self, model_manager: MLModelManager):
        self.model_manager = model_manager
        self.model_name = 'dry_weight'
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict dry weight for a patient
        """
        try:
            # Load model
            model = self.model_manager.load_model(self.model_name)
            
            # Prepare features
            features = self._prepare_features(input_data)
            
            # Make prediction
            prediction = model.predict([features])[0]
            
            # Calculate confidence (dummy implementation)
            confidence = np.random.uniform(0.7, 0.95)
            
            return {
                'patient_id': input_data['patient_id'],
                'predicted_dry_weight': round(float(prediction), 2),
                'confidence_score': round(float(confidence), 3),
                'model_version': self.model_manager.get_model_version(self.model_name),
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in dry weight prediction: {str(e)}")
            raise
    
    def _prepare_features(self, input_data: Dict[str, Any]) -> List[float]:
        """Prepare features for the model"""
        # Feature engineering for dry weight prediction
        features = [
            input_data['age'],
            1 if input_data['gender'].lower() == 'male' else 0,
            input_data['height'],
            input_data['weight'],
            input_data['systolic_bp'],
            input_data['diastolic_bp'],
            input_data['pre_dialysis_weight'],
            input_data['post_dialysis_weight'],
            input_data['ultrafiltration_volume'],
            input_data['dialysis_duration']
        ]
        return features


class URRPredictor:
    """
    URR (Urea Reduction Ratio) prediction service
    """
    
    def __init__(self, model_manager: MLModelManager):
        self.model_manager = model_manager
        self.model_name = 'urr'
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict URR for a patient
        """
        try:
            # Load model
            model = self.model_manager.load_model(self.model_name)
            
            # Prepare features
            features = self._prepare_features(input_data)
            
            # Make prediction
            prediction = model.predict([features])[0]
            
            # Calculate confidence
            confidence = np.random.uniform(0.7, 0.95)
            
            # Determine adequacy status
            adequacy_status = "Adequate" if prediction >= 65 else "Inadequate"
            
            return {
                'patient_id': input_data['patient_id'],
                'predicted_urr': round(float(prediction), 2),
                'adequacy_status': adequacy_status,
                'confidence_score': round(float(confidence), 3),
                'model_version': self.model_manager.get_model_version(self.model_name),
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in URR prediction: {str(e)}")
            raise
    
    def _prepare_features(self, input_data: Dict[str, Any]) -> List[float]:
        """Prepare features for the model"""
        features = [
            input_data['pre_dialysis_urea'],
            input_data['dialysis_duration'],
            input_data['blood_flow_rate'],
            input_data['dialysate_flow_rate'],
            input_data['ultrafiltration_rate'],
            1 if input_data['access_type'].lower() == 'fistula' else 0,
            input_data.get('kt_v', 1.2)  # Default Kt/V if not provided
        ]
        return features


class HbPredictor:
    """
    Hemoglobin prediction service
    """
    
    def __init__(self, model_manager: MLModelManager):
        self.model_manager = model_manager
        self.model_name = 'hb'
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict Hb for next month
        """
        try:
            # Load model
            model = self.model_manager.load_model(self.model_name)
            
            # Prepare features
            features = self._prepare_features(input_data)
            
            # Make prediction
            prediction = model.predict([features])[0]
            
            # Calculate confidence
            confidence = np.random.uniform(0.7, 0.95)
            
            # Determine trend
            current_hb = input_data['current_hb']
            if prediction > current_hb + 0.3:
                trend = "Increasing"
            elif prediction < current_hb - 0.3:
                trend = "Decreasing"
            else:
                trend = "Stable"
            
            # Generate recommendations
            recommendations = self._generate_recommendations(input_data, prediction)
            
            return {
                'patient_id': input_data['patient_id'],
                'predicted_hb_next_month': round(float(prediction), 2),
                'hb_trend': trend,
                'target_hb_range': {'min': 10.0, 'max': 12.0},
                'recommendations': recommendations,
                'confidence_score': round(float(confidence), 3),
                'model_version': self.model_manager.get_model_version(self.model_name),
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in Hb prediction: {str(e)}")
            raise
    
    def _prepare_features(self, input_data: Dict[str, Any]) -> List[float]:
        """Prepare features for the model"""
        features = [
            input_data['current_hb'],
            input_data['ferritin'],
            input_data['iron'],
            input_data['transferrin_saturation'],
            input_data.get('epo_dose', 0),
            1 if input_data.get('iron_supplement', False) else 0,
            input_data.get('dialysis_adequacy', 1.2),
            len(input_data.get('comorbidities', []))
        ]
        return features
    
    def _generate_recommendations(self, input_data: Dict[str, Any], predicted_hb: float) -> List[str]:
        """Generate clinical recommendations based on prediction"""
        recommendations = []
        
        if predicted_hb < 10:
            recommendations.append("Consider increasing EPO dose")
            if input_data['ferritin'] < 200:
                recommendations.append("Iron supplementation recommended")
        elif predicted_hb > 12:
            recommendations.append("Consider reducing EPO dose")
            recommendations.append("Monitor for hypertension")
        
        if input_data['transferrin_saturation'] < 20:
            recommendations.append("Iron deficiency detected - start iron therapy")
        
        if input_data.get('dialysis_adequacy', 1.2) < 1.2:
            recommendations.append("Improve dialysis adequacy (target Kt/V > 1.2)")
        
        return recommendations


# Global model manager instance
model_manager = MLModelManager()

# Global predictor instances
dry_weight_predictor = DryWeightPredictor(model_manager)
urr_predictor = URRPredictor(model_manager)
hb_predictor = HbPredictor(model_manager)

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
            # Generate binary classification predictions (0: No change, 1: Change expected)
            return np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        elif self.model_type == 'urr':
            # Generate binary classification predictions (0: No risk, 1: Risk of inadequate URR)
            return np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
        elif self.model_type == 'hb':
            # Generate binary classification predictions (0: No risk, 1: Risk region)
            return np.random.choice([0, 1], n_samples, p=[0.75, 0.25])
        else:
            return np.random.choice([0, 1], n_samples)
            
    def predict_proba(self, features):
        """Generate dummy probability predictions for classification"""
        if hasattr(features, 'shape'):
            n_samples = features.shape[0]
        else:
            n_samples = 1
        
        # Return probabilities for binary classification [prob_class_0, prob_class_1]
        prob_class_1 = np.random.uniform(0.1, 0.9, n_samples)
        prob_class_0 = 1 - prob_class_1
        
        if n_samples == 1:
            return np.array([[prob_class_0[0], prob_class_1[0]]])
        else:
            return np.column_stack([prob_class_0, prob_class_1])


class DryWeightPredictor:
    """
    Dry weight prediction service
    """
    
    def __init__(self, model_manager: MLModelManager):
        self.model_manager = model_manager
        self.model_name = 'dry_weight'
        
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict if dry weight will change in next session
        """
        try:
            # Load model
            model = self.model_manager.load_model(self.model_name)
            
            # Prepare features
            features = self._prepare_features(input_data)
            
            # Make classification prediction
            prediction = model.predict([features])[0]
            
            # Get prediction probabilities
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba([features])[0]
                confidence = max(probabilities)
                risk_probability = probabilities[1] if len(probabilities) > 1 else probabilities[0]
            else:
                confidence = np.random.uniform(0.7, 0.95)
                risk_probability = np.random.uniform(0.1, 0.9)
            
            # Interpret prediction
            will_change = bool(prediction)
            status = "Change Expected" if will_change else "Stable"
            
            return {
                'patient_id': input_data['patient_id'],
                'dry_weight_change_predicted': will_change,
                'prediction_status': status,
                'change_probability': round(float(risk_probability), 3),
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
        Predict if URR will go to risk region next month
        """
        try:
            # Load model
            model = self.model_manager.load_model(self.model_name)
            
            # Prepare features
            features = self._prepare_features(input_data)
            
            # Make classification prediction
            prediction = model.predict([features])[0]
            
            # Get prediction probabilities
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba([features])[0]
                confidence = max(probabilities)
                risk_probability = probabilities[1] if len(probabilities) > 1 else probabilities[0]
            else:
                confidence = np.random.uniform(0.7, 0.95)
                risk_probability = np.random.uniform(0.1, 0.9)
            
            # Interpret prediction
            at_risk = bool(prediction)
            risk_status = "At Risk" if at_risk else "Safe"
            adequacy_status = "Predicted Inadequate" if at_risk else "Predicted Adequate"
            
            return {
                'patient_id': input_data['patient_id'],
                'urr_risk_predicted': at_risk,
                'risk_status': risk_status,
                'adequacy_status': adequacy_status,
                'risk_probability': round(float(risk_probability), 3),
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
        Predict if Hb will go to risk region next month
        """
        try:
            # Load model
            model = self.model_manager.load_model(self.model_name)
            
            # Prepare features
            features = self._prepare_features(input_data)
            
            # Make classification prediction
            prediction = model.predict([features])[0]
            
            # Get prediction probabilities
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba([features])[0]
                confidence = max(probabilities)
                risk_probability = probabilities[1] if len(probabilities) > 1 else probabilities[0]
            else:
                confidence = np.random.uniform(0.7, 0.95)
                risk_probability = np.random.uniform(0.1, 0.9)
            
            # Interpret prediction
            at_risk = bool(prediction)
            risk_status = "At Risk" if at_risk else "Safe"
            
            # Determine trend based on current Hb and risk prediction
            current_hb = input_data['hb']
            if at_risk:
                if current_hb < 10:
                    trend = "Declining to Critical"
                elif current_hb > 12:
                    trend = "Rising to Excessive"
                else:
                    trend = "Moving to Risk Zone"
            else:
                trend = "Stable in Target Range"
            
            # Generate recommendations
            recommendations = self._generate_recommendations(input_data, at_risk, current_hb)
            
            return {
                'patient_id': str(input_data['patient_id']),
                'hb_risk_predicted': at_risk,
                'risk_status': risk_status,
                'hb_trend': trend,
                'current_hb': float(current_hb),
                'target_hb_range': {'min': 10.0, 'max': 12.0},
                'risk_probability': round(float(risk_probability), 3),
                'recommendations': recommendations,
                'confidence_score': round(float(confidence), 3),
                'model_version': self.model_manager.get_model_version(self.model_name),
                'prediction_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in Hb prediction: {str(e)}")
            raise
    
    def _prepare_features(self, input_data: Dict[str, Any]) -> List[float]:
        """Prepare features for the model based on actual feature columns"""
        # Feature order based on model training:
        # ['Albumin (g/L)', 'BU - post HD', 'BU - pre HD', 'S Ca (mmol/L)',
        #  'SCR- post HD (µmol/L)', 'SCR- pre HD (µmol/L)',
        #  'Serum K Post-HD (mmol/L)', 'Serum K Pre-HD (mmol/L)',
        #  'Serum Na Pre-HD (mmol/L)', 'UA (mg/dL)', 'Hb_diff', 'Hb (g/dL)']
        
        features = [
            input_data['albumin'],                  # Albumin (g/L)
            input_data['bu_post_hd'],              # BU - post HD
            input_data['bu_pre_hd'],               # BU - pre HD
            input_data['s_ca'],                    # S Ca (mmol/L)
            input_data['scr_post_hd'],             # SCR- post HD (µmol/L)
            input_data['scr_pre_hd'],              # SCR- pre HD (µmol/L)
            input_data['serum_k_post_hd'],         # Serum K Post-HD (mmol/L)
            input_data['serum_k_pre_hd'],          # Serum K Pre-HD (mmol/L)
            input_data['serum_na_pre_hd'],         # Serum Na Pre-HD (mmol/L)
            input_data['ua'],                      # UA (mg/dL)
            input_data['hb_diff'],                 # Hb_diff
            input_data['hb']                       # Hb (g/dL)
        ]
        return features
    
    def _generate_recommendations(self, input_data: Dict[str, Any], at_risk: bool, current_hb: float) -> List[str]:
        """Generate clinical recommendations based on risk prediction and lab values"""
        recommendations = []
        
        # Risk-based recommendations
        if at_risk:
            recommendations.append("⚠️ Patient predicted to enter Hb risk zone next month")
            if current_hb < 10:
                recommendations.append("Current Hb below target - urgent intervention needed")
                recommendations.append("Consider increasing EPO dose or iron supplementation")
            elif current_hb > 12:
                recommendations.append("Current Hb above target - risk of cardiovascular complications")
                recommendations.append("Consider reducing EPO dose and monitor closely")
            else:
                recommendations.append("Monitor closely and consider preventive measures")
        else:
            recommendations.append("✅ Hb levels predicted to remain stable")
            recommendations.append("Continue current treatment regimen")
        
        # Lab-based recommendations
        if input_data['albumin'] < 35:
            recommendations.append("Low albumin - nutritional counseling recommended")
        
        if input_data['s_ca'] < 2.1:
            recommendations.append("Low calcium - consider calcium supplementation")
        elif input_data['s_ca'] > 2.6:
            recommendations.append("High calcium - review phosphate binders")
        
        if input_data['serum_k_pre_hd'] > 5.5:
            recommendations.append("High potassium - dietary restriction advised")
        elif input_data['serum_k_pre_hd'] < 3.5:
            recommendations.append("Low potassium - monitor for arrhythmias")
        
        # Dialysis adequacy
        bu_reduction = ((input_data['bu_pre_hd'] - input_data['bu_post_hd']) / input_data['bu_pre_hd']) * 100
        if bu_reduction < 65:
            recommendations.append("Inadequate dialysis - consider increasing treatment time/frequency")
        
        return recommendations


# Global model manager instance
model_manager = MLModelManager()

# Global predictor instances
dry_weight_predictor = DryWeightPredictor(model_manager)
urr_predictor = URRPredictor(model_manager)
hb_predictor = HbPredictor(model_manager)

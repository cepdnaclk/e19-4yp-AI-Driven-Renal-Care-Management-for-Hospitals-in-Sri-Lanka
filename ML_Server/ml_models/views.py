from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
import logging
import re

from .serializers import (
    DryWeightPredictionSerializer,
    DryWeightPredictionResponseSerializer,
    URRPredictionSerializer,
    URRPredictionResponseSerializer,
    HbPredictionSerializer,
    HbPredictionResponseSerializer,
    ErrorResponseSerializer
)
from .services import dry_weight_predictor, urr_predictor, hb_predictor

logger = logging.getLogger(__name__)


def validate_patient_id(patient_id: str) -> bool:
    """Validate patient ID format RHD_THP_XXX"""
    pattern = r'^RHD_THP_\d{3}$'
    return bool(re.match(pattern, patient_id))


@extend_schema(
    request=DryWeightPredictionSerializer,
    responses={
        200: DryWeightPredictionResponseSerializer,
        400: ErrorResponseSerializer,
        500: ErrorResponseSerializer
    },
    summary="Predict Dry Weight",
    description="Predict optimal dry weight for a dialysis patient based on clinical parameters"
)
@api_view(['POST'])
def predict_dry_weight(request):
    """
    Predict dry weight for a dialysis patient
    """
    try:
        # Validate input data
        serializer = DryWeightPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Invalid input data',
                'message': 'Please check the input parameters',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        # Validate patient ID format
        if not validate_patient_id(validated_data['patient_id']):
            return Response({
                'error': 'Invalid patient ID format',
                'message': 'Patient ID must be in format RHD_THP_XXX (e.g., RHD_THP_001)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Make prediction
        prediction_result = dry_weight_predictor.predict(validated_data)
        
        # Return response
        response_serializer = DryWeightPredictionResponseSerializer(prediction_result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in dry weight prediction: {str(e)}")
        return Response({
            'error': 'Prediction failed',
            'message': 'An error occurred during prediction. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    request=URRPredictionSerializer,
    responses={
        200: URRPredictionResponseSerializer,
        400: ErrorResponseSerializer,
        500: ErrorResponseSerializer
    },
    summary="Predict URR",
    description="Predict Urea Reduction Ratio (URR) for a dialysis session"
)
@api_view(['POST'])
def predict_urr(request):
    """
    Predict URR (Urea Reduction Ratio) for a dialysis session
    """
    try:
        # Validate input data
        serializer = URRPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Invalid input data',
                'message': 'Please check the input parameters',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        # Validate patient ID format
        if not validate_patient_id(validated_data['patient_id']):
            return Response({
                'error': 'Invalid patient ID format',
                'message': 'Patient ID must be in format RHD_THP_XXX (e.g., RHD_THP_001)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Make prediction
        prediction_result = urr_predictor.predict(validated_data)
        
        # Return response
        response_serializer = URRPredictionResponseSerializer(prediction_result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in URR prediction: {str(e)}")
        return Response({
            'error': 'Prediction failed',
            'message': 'An error occurred during prediction. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    request=HbPredictionSerializer,
    responses={
        200: HbPredictionResponseSerializer,
        400: ErrorResponseSerializer,
        500: ErrorResponseSerializer
    },
    summary="Predict Hemoglobin",
    description="Predict next month's hemoglobin level and provide clinical recommendations"
)
@api_view(['POST'])
def predict_hb(request):
    """
    Predict hemoglobin level for next month
    """
    try:
        # Validate input data
        serializer = HbPredictionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Invalid input data',
                'message': 'Please check the input parameters',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
        # Validate patient ID format
        if not validate_patient_id(validated_data['patient_id']):
            return Response({
                'error': 'Invalid patient ID format',
                'message': 'Patient ID must be in format RHD_THP_XXX (e.g., RHD_THP_001)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Make prediction
        prediction_result = hb_predictor.predict(validated_data)
        
        # Return response
        response_serializer = HbPredictionResponseSerializer(prediction_result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in Hb prediction: {str(e)}")
        return Response({
            'error': 'Prediction failed',
            'message': 'An error occurred during prediction. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for ML models
    """
    return Response({
        'status': 'healthy',
        'service': 'ML Models API',
        'available_models': ['dry_weight', 'urr', 'hb'],
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def models_info(request):
    """
    Get information about available ML models
    """
    models_info = {
        'dry_weight': {
            'name': 'Dry Weight Prediction',
            'description': 'Predicts optimal dry weight for dialysis patients',
            'input_parameters': [
                'patient_id', 'age', 'gender', 'height', 'weight',
                'systolic_bp', 'diastolic_bp', 'pre_dialysis_weight',
                'post_dialysis_weight', 'ultrafiltration_volume', 'dialysis_duration'
            ],
            'output': 'Predicted dry weight in kg'
        },
        'urr': {
            'name': 'URR Prediction',
            'description': 'Predicts Urea Reduction Ratio for dialysis sessions',
            'input_parameters': [
                'patient_id', 'pre_dialysis_urea', 'dialysis_duration',
                'blood_flow_rate', 'dialysate_flow_rate', 'ultrafiltration_rate',
                'access_type', 'kt_v'
            ],
            'output': 'Predicted URR percentage and adequacy status'
        },
        'hb': {
            'name': 'Hemoglobin Prediction',
            'description': 'Predicts next month hemoglobin level with clinical recommendations',
            'input_parameters': [
                'patient_id', 'current_hb', 'ferritin', 'iron',
                'transferrin_saturation', 'epo_dose', 'iron_supplement',
                'dialysis_adequacy', 'comorbidities'
            ],
            'output': 'Predicted Hb level, trend, and clinical recommendations'
        }
    }
    
    return Response({
        'available_models': models_info,
        'patient_id_format': 'RHD_THP_XXX (e.g., RHD_THP_001)',
        'endpoints': {
            'dry_weight': '/api/ml/predict/dry-weight/',
            'urr': '/api/ml/predict/urr/',
            'hb': '/api/ml/predict/hb/'
        }
    }, status=status.HTTP_200_OK)

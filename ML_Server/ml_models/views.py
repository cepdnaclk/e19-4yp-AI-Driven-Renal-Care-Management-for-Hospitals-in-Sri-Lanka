from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
import logging

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
from .middleware.auth import require_auth, require_role

logger = logging.getLogger(__name__)


@extend_schema(
    request=DryWeightPredictionSerializer,
    responses={
        200: DryWeightPredictionResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        500: ErrorResponseSerializer
    },
    summary="Predict Dry Weight Change",
    description="Predict if dry weight will change in the next dialysis session based on clinical parameters"
)
@api_view(['POST'])
@require_auth
@require_role(['DOCTOR', 'NURSE'])
def predict_dry_weight(request):
    """
    Predict if dry weight will change in next session
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
        401: ErrorResponseSerializer,
        500: ErrorResponseSerializer
    },
    summary="Predict URR Risk",
    description="Predict if URR will go to risk region (inadequate) in next month"
)
@api_view(['POST'])
@require_auth
@require_role(['DOCTOR', 'NURSE'])
def predict_urr(request):
    """
    Predict if URR will go to risk region next month
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
        401: ErrorResponseSerializer,
        500: ErrorResponseSerializer
    },
    summary="Predict Hemoglobin Risk",
    description="Predict if hemoglobin will go to risk region next month and provide clinical recommendations"
)
@api_view(['POST'])
@require_auth
@require_role(['DOCTOR', 'NURSE'])
def predict_hb(request):
    """
    Predict if hemoglobin will go to risk region next month
    """
    try:
        # Validate input data
        serializer = HbPredictionSerializer(data=request.data)
        print(serializer.is_valid(), serializer.errors)
        if not serializer.is_valid():
            return Response({
                'error': 'Invalid input data',
                'message': 'Please check the input parameters',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        
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
            'name': 'Dry Weight Change Prediction',
            'description': 'Predicts if dry weight will change in next dialysis session',
            'input_parameters': [
                'age', 'gender', 'height', 'weight',
                'systolic_bp', 'diastolic_bp', 'pre_dialysis_weight',
                'post_dialysis_weight', 'ultrafiltration_volume', 'dialysis_duration'
            ],
            'output': 'Binary classification: will dry weight change (True/False) with probability'
        },
        'urr': {
            'name': 'URR Risk Prediction (LightGBM)',
            'description': 'Predicts if URR will go to risk region (inadequate) next month using LightGBM model',
            'model_type': 'LightGBM',
            'input_parameters': [
                'albumin', 'hb', 's_ca', 'serum_na_pre_hd',
                'urr', 'urr_diff', 'serum_k_pre_hd', 'serum_k_post_hd',
                'bu_pre_hd', 'bu_post_hd', 'scr_pre_hd', 'scr_post_hd'
            ],
            'calculated_features': [
                'K_Diff (serum_k_pre_hd - serum_k_post_hd)',
                'BU_Diff (bu_pre_hd - bu_post_hd)',
                'SCR_Diff (scr_pre_hd - scr_post_hd)'
            ],
            'output': 'Binary classification: URR at risk (True/False) with probability, adequacy status and clinical recommendations'
        },
        'hb': {
            'name': 'Hemoglobin Risk Prediction',
            'description': 'Predicts if hemoglobin will go to risk region next month using ensemble model',
            'input_parameters': [
                'albumin', 'bu_post_hd', 'bu_pre_hd', 's_ca',
                'scr_post_hd', 'scr_pre_hd', 'serum_k_post_hd', 'serum_k_pre_hd',
                'serum_na_pre_hd', 'ua', 'hb_diff', 'hb'
            ],
            'calculated_features': [
                'albumin_bu_ratio', 'k_diff', 'bu_diff', 'scr_diff'
            ],
            'feature_engineering': 'Server automatically calculates derived features from input parameters',
            'model_type': 'Ensemble (XGBoost + LightGBM) with weighted averaging',
            'output': 'Binary classification: Hb at risk (True/False) with probability and clinical recommendations'
        }
    }
    
    return Response({
        'available_models': models_info,
        'endpoints': {
            'dry_weight': '/api/ml/predict/dry-weight/',
            'urr': '/api/ml/predict/urr/',
            'hb': '/api/ml/predict/hb/'
        }
    }, status=status.HTTP_200_OK)

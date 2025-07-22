#!/usr/bin/env python
"""
Test script for the ML Server API endpoints with JWT authentication
"""

import requests
import json
import sys
import jwt
import os
from datetime import datetime, timedelta

# Base URL for the ML Server
BASE_URL = "http://localhost:8001"

def generate_test_jwt():
    """Generate a test JWT token for authentication"""
    # Use the same secret as in the .env file
    jwt_secret = "your-super-secret-jwt-key-here-change-in-production"
    
    payload = {
        'id': '60d0fe4f5311236168a109ca',  # Test user ID
        'role': 'DOCTOR',  # User role (matches backend format)
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    
    token = jwt.encode(payload, jwt_secret, algorithm='HS256')
    return token

def get_auth_headers():
    """Get authorization headers with JWT token"""
    token = generate_test_jwt()
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_ml_health_check():
    """Test the ML models health check endpoint"""
    print("\nTesting ML health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/ml/health/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_models_info():
    """Test the models info endpoint"""
    print("\nTesting models info...")
    try:
        response = requests.get(f"{BASE_URL}/api/ml/models/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_dry_weight_prediction():
    """Test dry weight prediction endpoint with authentication"""
    print("\nTesting dry weight prediction...")
    test_data = {
        "patient_id": "RHD_THP_001",
        "age": 45,
        "gender": "Male",
        "height": 170.5,
        "weight": 70.2,
        "systolic_bp": 140,
        "diastolic_bp": 90,
        "pre_dialysis_weight": 72.5,
        "post_dialysis_weight": 69.8,
        "ultrafiltration_volume": 2.7,
        "dialysis_duration": 4.0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ml/predict/dry-weight/",
            json=test_data,
            headers=get_auth_headers()
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_urr_prediction():
    """Test URR prediction endpoint with authentication"""
    print("\nTesting URR prediction...")
    test_data = {
        "patient_id": "RHD_THP_002",
        "pre_dialysis_urea": 120,
        "dialysis_duration": 4.0,
        "blood_flow_rate": 300,
        "dialysate_flow_rate": 500,
        "ultrafiltration_rate": 800,
        "access_type": "fistula",
        "kt_v": 1.4
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ml/predict/urr/",
            json=test_data,
            headers=get_auth_headers()
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_hb_prediction():
    """Test Hb prediction endpoint with authentication"""
    print("\nTesting Hb prediction...")
    test_data = {
        "patient_id": "RHD_THP_003",
        "albumin": 35.2,
        "bu_post_hd": 8.5,
        "bu_pre_hd": 25.3,
        "s_ca": 2.3,
        "scr_post_hd": 450,
        "scr_pre_hd": 890,
        "serum_k_post_hd": 3.8,
        "serum_k_pre_hd": 5.2,
        "serum_na_pre_hd": 138,
        "ua": 6.8,
        "hb_diff": -0.5,
        "hb": 9.5
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ml/predict/hb/",
            json=test_data,
            headers=get_auth_headers()
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_authentication_failure():
    """Test authentication failure without JWT token"""
    print("\nTesting authentication failure...")
    test_data = {
        "patient_id": "RHD_THP_001",
        "age": 45,
        "gender": "Male",
        "height": 170.5,
        "weight": 70.2,
        "systolic_bp": 140,
        "diastolic_bp": 90,
        "pre_dialysis_weight": 72.5,
        "post_dialysis_weight": 69.8,
        "ultrafiltration_volume": 2.7,
        "dialysis_duration": 4.0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ml/predict/dry-weight/",
            json=test_data,
            headers={'Content-Type': 'application/json'}  # No Authorization header
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 401  # Should return 401 Unauthorized
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("ML Server API Tests")
    print("=" * 60)
    
    tests = [
        test_health_check,
        test_ml_health_check,
        test_models_info,
        test_authentication_failure,
        test_dry_weight_prediction,
        test_urr_prediction,
        test_hb_prediction
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
            print("✅ PASSED")
        else:
            print("❌ FAILED")
        print("-" * 40)
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()

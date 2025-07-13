#!/usr/bin/env python
"""
Test script for the ML Server API endpoints
"""

import requests
import json
import sys

# Base URL for the ML Server
BASE_URL = "http://localhost:8001"

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
    """Test dry weight prediction endpoint"""
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
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_urr_prediction():
    """Test URR prediction endpoint"""
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
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_hb_prediction():
    """Test Hb prediction endpoint"""
    print("\nTesting Hb prediction...")
    test_data = {
        "patient_id": "RHD_THP_003",
        "current_hb": 9.5,
        "ferritin": 150,
        "iron": 80,
        "transferrin_saturation": 25,
        "epo_dose": 4000,
        "iron_supplement": True,
        "dialysis_adequacy": 1.3,
        "comorbidities": ["diabetes", "hypertension"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ml/predict/hb/",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
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

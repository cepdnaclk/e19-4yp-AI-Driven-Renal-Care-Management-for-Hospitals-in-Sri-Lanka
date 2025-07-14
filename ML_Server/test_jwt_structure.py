#!/usr/bin/env python
"""
Test script to verify JWT token structure from Express.js backend
"""

import requests
import json
import jwt

# Base URL for the Express.js backend
BACKEND_URL = "http://localhost:3000"  # Adjust if your backend runs on different port

def test_login_and_decode_jwt():
    """Test login and decode the JWT to verify role is included"""
    
    print("Testing JWT token structure from Express.js backend...")
    print("=" * 60)
    
    # Sample login credentials - you'll need to adjust these
    login_data = {
        "email": "doctor@example.com",  # Replace with actual test user
        "password": "password123"        # Replace with actual password
    }
    
    try:
        # Login to get JWT token
        print("1. Attempting login...")
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Login Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            
            if token:
                print("✅ JWT token received successfully")
                print(f"Token: {token[:50]}...")
                
                # Decode the JWT token (without verification for inspection)
                print("\n2. Decoding JWT token...")
                try:
                    # Decode without verification to inspect payload
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    
                    print("✅ JWT payload decoded successfully:")
                    print(json.dumps(decoded, indent=2, default=str))
                    
                    # Check if role is present
                    if 'role' in decoded:
                        print(f"\n✅ Role found in token: {decoded['role']}")
                        print("🎉 JWT token structure is correct for ML server!")
                    else:
                        print("\n❌ Role NOT found in token!")
                        print("⚠️  Need to update backend to include role in JWT")
                    
                    # Check if id is present
                    if 'id' in decoded:
                        print(f"✅ User ID found in token: {decoded['id']}")
                    else:
                        print("❌ User ID NOT found in token!")
                        
                except Exception as e:
                    print(f"❌ Error decoding JWT: {e}")
            else:
                print("❌ No token in response")
                print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response text: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("Make sure the Express.js backend is running on http://localhost:3000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_ml_server_auth():
    """Test if ML server can validate the JWT token"""
    
    print("\n" + "=" * 60)
    print("Testing ML server authentication...")
    
    # First get a token from backend
    login_data = {
        "email": "doctor@example.com",  # Replace with actual test user
        "password": "password123"        # Replace with actual password
    }
    
    try:
        # Get token from backend
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            token = response.json().get('token')
            
            if token:
                print("3. Testing ML server with real JWT token...")
                
                # Test ML server health endpoint with token
                ml_response = requests.get(
                    "http://localhost:8001/api/ml/models/",
                    headers={'Authorization': f'Bearer {token}'}
                )
                
                print(f"ML Server Response Code: {ml_response.status_code}")
                if ml_response.status_code == 200:
                    print("✅ ML server accepts the JWT token!")
                else:
                    print("❌ ML server rejected the JWT token")
                    try:
                        print(f"Error: {ml_response.json()}")
                    except:
                        print(f"Response: {ml_response.text}")
        
    except requests.exceptions.ConnectionError as e:
        if "8001" in str(e):
            print("❌ Could not connect to ML server on http://localhost:8001")
        else:
            print("❌ Could not connect to backend server on http://localhost:3000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("JWT Token Structure Test")
    print("This script tests if the Express.js backend includes role in JWT tokens")
    print("\nNOTE: Make sure both servers are running:")
    print("- Express.js backend on http://localhost:3000")
    print("- ML server on http://localhost:8001")
    print("\nYou may need to update the login credentials in the script.")
    print()
    
    test_login_and_decode_jwt()
    test_ml_server_auth()

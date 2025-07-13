# ML Server for Renal Care Management

A Django-based ML server providing machine learning model predictions for renal care management.

## Features

- **Dry Weight Prediction**: Predicts optimal dry weight for dialysis patients
- **URR Prediction**: Predicts Urea Reduction Ratio for dialysis sessions  
- **Hemoglobin Prediction**: Predicts next month's Hb level with clinical recommendations

## API Endpoints

### Health Check
```
GET /health/ - Server health check
GET /api/ml/health/ - ML models health check
GET /api/ml/models/ - Information about available models
```

### Predictions
```
POST /api/ml/predict/dry-weight/ - Predict dry weight
POST /api/ml/predict/urr/ - Predict URR
POST /api/ml/predict/hb/ - Predict hemoglobin
```

## Patient ID Format

All endpoints require patient ID in the format: `RHD_THP_XXX` (e.g., RHD_THP_001)

## Quick Start

### Option 1: Use the startup script (Windows)
```cmd
# For Command Prompt
start_server.bat

# For PowerShell
.\start_server.ps1
```

### Option 2: Manual setup
1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Start the server:
```bash
python manage.py runserver 8001
```

## Testing

Run the API tests:
```bash
python test_api.py
```

## Usage

The server runs on port 8001 and provides REST API endpoints for ML predictions.

### Example API Calls

#### Dry Weight Prediction
```bash
curl -X POST http://localhost:8001/api/ml/predict/dry-weight/ \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### URR Prediction
```bash
curl -X POST http://localhost:8001/api/ml/predict/urr/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "RHD_THP_002",
    "pre_dialysis_urea": 120,
    "dialysis_duration": 4.0,
    "blood_flow_rate": 300,
    "dialysate_flow_rate": 500,
    "ultrafiltration_rate": 800,
    "access_type": "fistula",
    "kt_v": 1.4
  }'
```

#### Hemoglobin Prediction
```bash
curl -X POST http://localhost:8001/api/ml/predict/hb/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "RHD_THP_003",
    "current_hb": 9.5,
    "ferritin": 150,
    "iron": 80,
    "transferrin_saturation": 25,
    "epo_dose": 4000,
    "iron_supplement": true,
    "dialysis_adequacy": 1.3,
    "comorbidities": ["diabetes", "hypertension"]
  }'
```

## Model Files

Place trained model files in `ml_models/models/` directory:
- `dry_weight_model.pkl`
- `urr_model.pkl` 
- `hb_model.pkl`

If model files are not found, dummy models will be used for development.

## Integration with Express.js Backend

The ML server is designed to work alongside the Express.js backend:
- Express.js backend runs on port 3000
- ML server runs on port 8001
- CORS is configured to allow requests from the Express.js server

## Architecture

```
Frontend (React) → Express.js Backend (port 3000) → ML Server (port 8001)
                        ↓
                  MongoDB Database
```

## Project Structure

```
ML_Server/
├── ml_server/              # Django project
│   ├── __init__.py
│   ├── settings.py         # Django settings with CORS, REST framework
│   ├── urls.py             # Main URL routing
│   ├── wsgi.py             # WSGI application
│   └── asgi.py             # ASGI application
├── ml_models/              # Django app for ML models
│   ├── __init__.py
│   ├── apps.py             # App configuration
│   ├── views.py            # API views for predictions
│   ├── serializers.py      # DRF serializers for validation
│   ├── services.py         # ML prediction services
│   ├── urls.py             # App URL patterns
│   └── models/             # ML model files directory
│       ├── README.md
│       ├── dry_weight_model.pkl    # (to be added)
│       ├── urr_model.pkl          # (to be added)
│       └── hb_model.pkl           # (to be added)
├── requirements.txt        # Python dependencies
├── manage.py              # Django management script
├── start_server.bat       # Windows batch startup script
├── start_server.ps1       # PowerShell startup script
├── test_api.py           # API testing script
└── README.md             # This file
```

## Development Notes

- The server uses dummy models for development if real model files are not available
- All endpoints validate the patient ID format (RHD_THP_XXX)
- Comprehensive error handling and logging
- REST API with proper HTTP status codes
- Input validation using Django REST Framework serializers
- CORS configured for integration with Express.js backend
- Swagger/OpenAPI documentation support (via drf-spectacular)

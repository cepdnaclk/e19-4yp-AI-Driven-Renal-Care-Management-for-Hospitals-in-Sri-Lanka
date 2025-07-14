import pickle
import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import os
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

def load_hb_model():
    """Load the hemoglobin prediction model"""
    model_path = Path(__file__).parent / 'hb_model.pkl'
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    try:
        # Try loading with joblib first (recommended for sklearn models)
        model = joblib.load(model_path)
        print(f"✓ Model loaded successfully with joblib from: {model_path}")
    except Exception as e:
        try:
            # Fallback to pickle
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print(f"✓ Model loaded successfully with pickle from: {model_path}")
        except Exception as e2:
            raise Exception(f"Failed to load model with both joblib and pickle: {e}, {e2}")
    
    return model

def create_test_data():
    """Create sample test data with the specified features"""
    feature_cols = [
        'Albumin (g/L)', 'BU - post HD', 'BU - pre HD', 'S Ca (mmol/L)',
        'SCR- post HD (µmol/L)', 'SCR- pre HD (µmol/L)',
        'Serum K Post-HD (mmol/L)', 'Serum K Pre-HD (mmol/L)',
        'Serum Na Pre-HD (mmol/L)', 'UA (mg/dL)', 'Hb_diff', 'Hb (g/dL)'
    ]
    
    # Create sample test cases with realistic medical values
    test_cases = [
        {
            'Albumin (g/L)': 35.0,
            'BU - post HD': 8.5,
            'BU - pre HD': 25.0,
            'S Ca (mmol/L)': 2.3,
            'SCR- post HD (µmol/L)': 300,
            'SCR- pre HD (µmol/L)': 800,
            'Serum K Post-HD (mmol/L)': 4.0,
            'Serum K Pre-HD (mmol/L)': 5.5,
            'Serum Na Pre-HD (mmol/L)': 140,
            'UA (mg/dL)': 6.5,
            'Hb_diff': -1.2,
            'Hb (g/dL)': 10.5
        },
        {
            'Albumin (g/L)': 32.0,
            'BU - post HD': 12.0,
            'BU - pre HD': 30.0,
            'S Ca (mmol/L)': 2.1,
            'SCR- post HD (µmol/L)': 250,
            'SCR- pre HD (µmol/L)': 700,
            'Serum K Post-HD (mmol/L)': 3.8,
            'Serum K Pre-HD (mmol/L)': 5.2,
            'Serum Na Pre-HD (mmol/L)': 138,
            'UA (mg/dL)': 7.2,
            'Hb_diff': -0.8,
            'Hb (g/dL)': 9.8
        },
        {
            'Albumin (g/L)': 38.0,
            'BU - post HD': 6.0,
            'BU - pre HD': 22.0,
            'S Ca (mmol/L)': 2.5,
            'SCR- post HD (µmol/L)': 280,
            'SCR- pre HD (µmol/L)': 750,
            'Serum K Post-HD (mmol/L)': 4.2,
            'Serum K Pre-HD (mmol/L)': 5.8,
            'Serum Na Pre-HD (mmol/L)': 142,
            'UA (mg/dL)': 5.8,
            'Hb_diff': -1.5,
            'Hb (g/dL)': 11.2
        }
    ]
    
    # Convert to DataFrame
    df = pd.DataFrame(test_cases)
    
    # Ensure all feature columns are present and in correct order
    for col in feature_cols:
        if col not in df.columns:
            print(f"Warning: Missing feature column: {col}")
    
    return df[feature_cols]

def test_model_predictions(model, test_data):
    """Test the model with sample data and validate predictions"""
    print("\n" + "="*60)
    print("TESTING HEMOGLOBIN MODEL PREDICTIONS")
    print("="*60)
    
    try:
        # Detailed input analysis
        print("\nINPUT DATA ANALYSIS:")
        print("-" * 40)
        print(f"Input shape: {test_data.shape}")
        print(f"Input data types:\n{test_data.dtypes}")
        print(f"\nInput data statistics:")
        print(test_data.describe())
        
        # Check for NaN or infinite values
        nan_count = test_data.isnull().sum().sum()
        inf_count = np.isinf(test_data.select_dtypes(include=[np.number])).sum().sum()
        print(f"\nData quality check:")
        print(f"  NaN values: {nan_count}")
        print(f"  Infinite values: {inf_count}")
        
        # Make predictions (class predictions)
        print(f"\nMAKING PREDICTIONS...")
        predictions = model.predict(test_data)
        print(f"✓ Predictions generated successfully")
        print(f"✓ Number of test samples: {len(test_data)}")
        print(f"✓ Number of predictions: {len(predictions)}")
        print(f"✓ Prediction data type: {type(predictions)}")
        print(f"✓ Prediction shape: {predictions.shape if hasattr(predictions, 'shape') else 'N/A'}")
        
        # Get prediction probabilities if available
        if hasattr(model, 'predict_proba'):
            try:
                probabilities = model.predict_proba(test_data)
                print(f"✓ Prediction probabilities shape: {probabilities.shape}")
                print(f"✓ Classes: {model.classes_ if hasattr(model, 'classes_') else 'Unknown'}")
            except Exception as e:
                print(f"⚠ Could not get probabilities: {e}")
                probabilities = None
        else:
            probabilities = None
        
        # Display results
        print("\nCLASSIFICATION RESULTS:")
        print("-" * 40)
        for i, (idx, row) in enumerate(test_data.iterrows()):
            pred = predictions[i]
            print(f"\nTest Case {i+1}:")
            print(f"  Input Hb (g/dL): {row['Hb (g/dL)']:.1f}")
            print(f"  Hb_diff: {row['Hb_diff']:.1f}")
            print(f"  Predicted Class: {pred}")
            
            if probabilities is not None:
                if hasattr(model, 'classes_'):
                    for j, class_label in enumerate(model.classes_):
                        print(f"  Probability Class {class_label}: {probabilities[i][j]:.4f}")
                else:
                    print(f"  Probabilities: {probabilities[i]}")
            
            print(f"  Albumin: {row['Albumin (g/L)']:.1f} g/L")
            print(f"  BU pre/post HD: {row['BU - pre HD']:.1f}/{row['BU - post HD']:.1f}")
            
        # Classification validation
        print("\nCLASSIFICATION VALIDATION:")
        print("-" * 40)
        unique_preds = np.unique(predictions)
        print(f"✓ Unique predictions: {unique_preds}")
        print(f"✓ Prediction distribution:")
        for pred in unique_preds:
            count = np.sum(predictions == pred)
            print(f"  Class {pred}: {count}/{len(predictions)} samples")
            
        return predictions
        
    except Exception as e:
        print(f"✗ Error during prediction: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise

def test_model_info(model):
    """Display information about the loaded model"""
    print("\n" + "="*60)
    print("MODEL INFORMATION")
    print("="*60)
    
    try:
        print(f"✓ Model type: {type(model).__name__}")
        print(f"✓ Model class: {model.__class__}")
        
        # Try to get feature information if available
        if hasattr(model, 'feature_names_in_'):
            print(f"✓ Expected features: {len(model.feature_names_in_)}")
            print("✓ Feature names:")
            for i, feature in enumerate(model.feature_names_in_, 1):
                print(f"   {i:2d}. {feature}")
        elif hasattr(model, 'n_features_in_'):
            print(f"✓ Expected number of features: {model.n_features_in_}")
        else:
            print("⚠ No feature information available in model")
        
        # Check if it's a pipeline (common cause of scaling issues)
        if hasattr(model, 'steps'):
            print(f"✓ Model is a Pipeline with {len(model.steps)} steps:")
            for i, (name, step) in enumerate(model.steps, 1):
                print(f"   {i}. {name}: {type(step).__name__}")
                
        # Check for scaler in the model
        if hasattr(model, 'named_steps'):
            for step_name, step in model.named_steps.items():
                print(f"✓ Pipeline step '{step_name}': {type(step).__name__}")
                if 'scaler' in step_name.lower() or 'standard' in step_name.lower():
                    print(f"  ⚠ Found scaler: {step_name} - this might explain zero predictions!")
                    if hasattr(step, 'scale_'):
                        print(f"    Scale factors: {step.scale_[:5]}...")  # Show first 5
                    if hasattr(step, 'mean_'):
                        print(f"    Mean values: {step.mean_[:5]}...")  # Show first 5
        
        # Model-specific information
        if hasattr(model, 'get_params'):
            params = model.get_params()
            print(f"✓ Model parameters: {len(params)} parameters")
            
            # Show important parameters
            important_params = ['n_estimators', 'max_depth', 'learning_rate', 'random_state', 'alpha']
            for param in important_params:
                if param in params:
                    print(f"  {param}: {params[param]}")
            
        if hasattr(model, 'score'):
            print("✓ Model has scoring capability")
            
        # Check model attributes that might give clues
        if hasattr(model, 'coef_'):
            print(f"✓ Model has coefficients (shape: {model.coef_.shape})")
            print(f"  Coefficient range: [{np.min(model.coef_):.6f}, {np.max(model.coef_):.6f}]")
            
        if hasattr(model, 'intercept_'):
            print(f"✓ Model intercept: {model.intercept_}")
            
        # Try to access the final estimator if it's a pipeline
        final_estimator = model
        if hasattr(model, 'named_steps') and len(model.named_steps) > 0:
            final_step_name = list(model.named_steps.keys())[-1]
            final_estimator = model.named_steps[final_step_name]
            print(f"✓ Final estimator: {type(final_estimator).__name__}")
            
            if hasattr(final_estimator, 'coef_'):
                print(f"  Final estimator coefficients shape: {final_estimator.coef_.shape}")
                print(f"  Coefficient range: [{np.min(final_estimator.coef_):.6f}, {np.max(final_estimator.coef_):.6f}]")
                
    except Exception as e:
        print(f"⚠ Could not retrieve all model information: {e}")
        import traceback
        traceback.print_exc()

def test_scaling_hypotheses(model, test_data):
    """Test different scaling approaches to see if that fixes the zero predictions"""
    print("\n" + "="*60)
    print("TESTING SCALING HYPOTHESES")
    print("="*60)
    
    original_predictions = model.predict(test_data)
    print(f"Original predictions: {original_predictions}")
    
    # Test 1: Standard scaling (mean=0, std=1)
    try:
        scaler_std = StandardScaler()
        scaled_data_std = scaler_std.fit_transform(test_data)
        scaled_df_std = pd.DataFrame(scaled_data_std, columns=test_data.columns)
        predictions_std = model.predict(scaled_df_std)
        print(f"\n1. StandardScaler predictions: {predictions_std}")
        print(f"   Range: [{np.min(predictions_std):.6f}, {np.max(predictions_std):.6f}]")
    except Exception as e:
        print(f"1. StandardScaler failed: {e}")
    
    # Test 2: MinMax scaling (0-1)
    try:
        scaler_minmax = MinMaxScaler()
        scaled_data_minmax = scaler_minmax.fit_transform(test_data)
        scaled_df_minmax = pd.DataFrame(scaled_data_minmax, columns=test_data.columns)
        predictions_minmax = model.predict(scaled_df_minmax)
        print(f"\n2. MinMaxScaler predictions: {predictions_minmax}")
        print(f"   Range: [{np.min(predictions_minmax):.6f}, {np.max(predictions_minmax):.6f}]")
    except Exception as e:
        print(f"2. MinMaxScaler failed: {e}")
    
    # Test 3: Divide by 10 (simple scaling)
    try:
        scaled_data_div10 = test_data / 10.0
        predictions_div10 = model.predict(scaled_data_div10)
        print(f"\n3. Divide by 10 predictions: {predictions_div10}")
        print(f"   Range: [{np.min(predictions_div10):.6f}, {np.max(predictions_div10):.6f}]")
    except Exception as e:
        print(f"3. Divide by 10 failed: {e}")
    
    # Test 4: Divide by 100
    try:
        scaled_data_div100 = test_data / 100.0
        predictions_div100 = model.predict(scaled_data_div100)
        print(f"\n4. Divide by 100 predictions: {predictions_div100}")
        print(f"   Range: [{np.min(predictions_div100):.6f}, {np.max(predictions_div100):.6f}]")
    except Exception as e:
        print(f"4. Divide by 100 failed: {e}")
    
    # Test 5: Test with very different values to see if model responds
    try:
        extreme_data = test_data.copy()
        extreme_data.iloc[0] = extreme_data.iloc[0] * 1000  # Make first row extreme
        predictions_extreme = model.predict(extreme_data)
        print(f"\n5. Extreme values predictions: {predictions_extreme}")
        print(f"   Range: [{np.min(predictions_extreme):.6f}, {np.max(predictions_extreme):.6f}]")
    except Exception as e:
        print(f"5. Extreme values failed: {e}")

def test_feature_order_hypothesis(model, test_data):
    """Test if feature order matters"""
    print("\n" + "="*60)
    print("TESTING FEATURE ORDER HYPOTHESIS")
    print("="*60)
    
    # Test shuffled column order
    shuffled_cols = test_data.columns.tolist()
    np.random.shuffle(shuffled_cols)
    shuffled_data = test_data[shuffled_cols]
    
    try:
        original_pred = model.predict(test_data)
        shuffled_pred = model.predict(shuffled_data)
        
        print(f"Original order predictions: {original_pred}")
        print(f"Shuffled order predictions: {shuffled_pred}")
        print(f"Original columns: {list(test_data.columns)}")
        print(f"Shuffled columns: {shuffled_cols}")
        
        if np.array_equal(original_pred, shuffled_pred):
            print("✓ Feature order doesn't matter")
        else:
            print("⚠ Feature order matters! This could be the issue.")
            
    except Exception as e:
        print(f"Feature order test failed: {e}")

def detect_scaling_requirements(model, test_data):
    """
    Automatically detect if input data needs scaling and determine the best scaling approach.
    This function tests various scaling methods and identifies which one produces the most 
    reasonable and varied predictions.
    """
    print("\n" + "="*70)
    print("AUTOMATIC SCALING DETECTION")
    print("="*70)
    
    # Original predictions
    original_preds = model.predict(test_data)
    original_proba = None
    if hasattr(model, 'predict_proba'):
        try:
            original_proba = model.predict_proba(test_data)
        except:
            pass
    
    scaling_results = []
    
    # Test different scaling approaches
    scaling_methods = [
        ("No Scaling", test_data, "original"),
        ("StandardScaler", None, "standard"),
        ("MinMaxScaler", None, "minmax"),
        ("Divide by 10", test_data / 10.0, "div10"),
        ("Divide by 100", test_data / 100.0, "div100"),
        ("Log Transform", np.log1p(np.abs(test_data)), "log"),
        ("Square Root", np.sqrt(np.abs(test_data)), "sqrt")
    ]
    
    for method_name, scaled_data, method_type in scaling_methods:
        try:
            # Prepare scaled data
            if method_type == "standard":
                scaler = StandardScaler()
                scaled_array = scaler.fit_transform(test_data)
                scaled_data = pd.DataFrame(scaled_array, columns=test_data.columns)
            elif method_type == "minmax":
                scaler = MinMaxScaler()
                scaled_array = scaler.fit_transform(test_data)
                scaled_data = pd.DataFrame(scaled_array, columns=test_data.columns)
            
            # Get predictions
            preds = model.predict(scaled_data)
            proba = None
            if hasattr(model, 'predict_proba'):
                try:
                    proba = model.predict_proba(scaled_data)
                except:
                    pass
            
            # Calculate metrics to evaluate quality of predictions
            unique_classes = len(np.unique(preds))
            class_distribution = [np.sum(preds == cls) for cls in np.unique(preds)]
            max_prob_confidence = np.max(proba, axis=1).mean() if proba is not None else 0
            min_prob_confidence = np.min(proba, axis=1).mean() if proba is not None else 0
            prob_variance = np.var(proba, axis=1).mean() if proba is not None else 0
            
            scaling_results.append({
                'method': method_name,
                'predictions': preds,
                'probabilities': proba,
                'unique_classes': unique_classes,
                'class_distribution': class_distribution,
                'max_prob_confidence': max_prob_confidence,
                'min_prob_confidence': min_prob_confidence,
                'prob_variance': prob_variance,
                'data_range': (scaled_data.min().min(), scaled_data.max().max())
            })
            
        except Exception as e:
            scaling_results.append({
                'method': method_name,
                'error': str(e),
                'predictions': None
            })
    
    # Analyze results
    print("\nSCALING METHOD ANALYSIS:")
    print("-" * 70)
    print(f"{'Method':<15} {'Classes':<8} {'Distribution':<20} {'Avg Max Prob':<12} {'Prob Variance':<12} {'Data Range'}")
    print("-" * 70)
    
    best_method = None
    best_score = -1
    
    for result in scaling_results:
        if 'error' in result:
            print(f"{result['method']:<15} ERROR: {result['error']}")
            continue
            
        method = result['method']
        classes = result['unique_classes']
        dist = str(result['class_distribution'])[:18]
        max_prob = f"{result['max_prob_confidence']:.3f}"
        prob_var = f"{result['prob_variance']:.3f}"
        data_range = f"[{result['data_range'][0]:.2f}, {result['data_range'][1]:.2f}]"
        
        print(f"{method:<15} {classes:<8} {dist:<20} {max_prob:<12} {prob_var:<12} {data_range}")
        
        # Score this method (higher is better)
        score = 0
        # Prefer methods with class diversity
        if classes > 1:
            score += 3
        # Prefer balanced probabilities (not too confident, not too uncertain)
        if 0.6 <= result['max_prob_confidence'] <= 0.9:
            score += 2
        # Prefer some probability variance (indicates the model is responding to input differences)
        if result['prob_variance'] > 0.01:
            score += 1
        # Penalize extreme data ranges
        data_min, data_max = result['data_range']
        if -10 <= data_min <= 10 and -10 <= data_max <= 100:
            score += 1
            
        if score > best_score:
            best_score = score
            best_method = result
    
    # Recommendations
    print("\n" + "="*70)
    print("SCALING RECOMMENDATIONS:")
    print("="*70)
    
    if best_method and best_score > 0:
        print(f"✓ RECOMMENDED SCALING: {best_method['method']}")
        print(f"  Reasoning:")
        print(f"  - Produces {best_method['unique_classes']} different classes")
        print(f"  - Average confidence: {best_method['max_prob_confidence']:.3f}")
        print(f"  - Probability variance: {best_method['prob_variance']:.3f}")
        print(f"  - Data range: [{best_method['data_range'][0]:.2f}, {best_method['data_range'][1]:.2f}]")
        
        if best_method['method'] != "No Scaling":
            print(f"\n⚠ Your model likely expects SCALED input data!")
            print(f"  Apply {best_method['method']} to your input data before prediction.")
        else:
            print(f"\n✓ Your model works with RAW (unscaled) input data.")
    else:
        print("⚠ Could not determine optimal scaling method.")
        print("  All methods produced similar or poor results.")
    
    # Detailed analysis for best method
    if best_method and 'probabilities' in best_method and best_method['probabilities'] is not None:
        print(f"\nDETAILED PREDICTIONS WITH {best_method['method'].upper()}:")
        print("-" * 50)
        for i in range(len(test_data)):
            pred = best_method['predictions'][i]
            probs = best_method['probabilities'][i]
            print(f"Test Case {i+1}: Class {pred} (Probabilities: {probs})")
    
    return best_method

def create_scaling_guide():
    """Provide a comprehensive guide on when and how to scale data"""
    print("\n" + "="*70)
    print("SCALING GUIDE - HOW TO KNOW IF DATA SHOULD BE SCALED")
    print("="*70)
    
    print("""
SIGNS YOUR MODEL NEEDS SCALED INPUT DATA:
----------------------------------------
1. 🔍 ALL PREDICTIONS ARE THE SAME CLASS
   - Model always predicts class 0 or always predicts class 1
   - No variation in predictions despite different input values

2. 🔍 VERY HIGH OR LOW CONFIDENCE SCORES
   - All probabilities are > 0.95 (overconfident)
   - All probabilities are around 0.5 (no confidence)

3. 🔍 MODEL TYPE INDICATORS
   - Neural Networks: Almost always need scaling
   - SVM: Usually need scaling
   - Tree-based (XGBoost, Random Forest): Often work without scaling
   - Linear models: Usually need scaling

4. 🔍 FEATURE SCALE DIFFERENCES
   - Some features are 0-1 (percentages)
   - Others are 100-1000 (lab values)
   - Mixed units (mg/dL, mmol/L, etc.)

COMMON SCALING METHODS:
----------------------
📊 StandardScaler (Z-score normalization):
   - Mean = 0, Standard Deviation = 1
   - Use when: Features have different scales but normal distribution
   - Formula: (value - mean) / std_dev

📊 MinMaxScaler:
   - Scale to range [0, 1]
   - Use when: You want bounded values between 0 and 1
   - Formula: (value - min) / (max - min)

📊 RobustScaler:
   - Uses median and interquartile range
   - Use when: Data has outliers
   - Less sensitive to extreme values

HOW TO IMPLEMENT SCALING:
------------------------
1. 💾 SAVE THE SCALER with your model during training
2. 🔄 APPLY THE SAME SCALER to new prediction data
3. ⚠️  NEVER fit a new scaler on prediction data

EXAMPLE CODE:
-------------```python
# During training:
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
# Save both model and scaler
joblib.dump(model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')

# During prediction:
scaler = joblib.load('scaler.pkl')
model = joblib.load('model.pkl')
X_new_scaled = scaler.transform(X_new)  # Don't use fit_transform!
predictions = model.predict(X_new_scaled)
```

TROUBLESHOOTING:
---------------
❌ If scaled predictions are worse than unscaled:
   - Model was trained on unscaled data
   - Use raw values

❌ If no scaling method works well:
   - Check feature names and order
   - Verify data quality (no NaN, infinite values)
   - Check if model expects different features

✅ If scaled predictions show more variety:
   - Model was trained on scaled data
   - Use the best scaling method consistently
""")

def main():
    """Main test function"""
    print("HEMOGLOBIN CLASSIFICATION MODEL TEST SUITE")
    print("="*60)
    print("NOTE: This model is an XGBClassifier, not a regression model.")
    print("It predicts hemoglobin categories/classes, not continuous values.")
    print("="*60)
    
    try:
        # Load the model
        print("1. Loading Hemoglobin Classification Model...")
        model = load_hb_model()
        
        # Display model information
        print("\n2. Analyzing Model...")
        test_model_info(model)
        
        # Create test data
        print("\n3. Creating Test Data...")
        test_data = create_test_data()
        print(f"✓ Created {len(test_data)} test samples")
        print(f"✓ Features: {list(test_data.columns)}")
        
        # Test predictions
        print("\n4. Testing Classification Predictions...")
        predictions = test_model_predictions(model, test_data)
        
        # Run automatic scaling detection
        print("\n5. Analyzing Scaling Requirements...")
        best_scaling_method = detect_scaling_requirements(model, test_data)
        
        # Show scaling guide
        print("\n6. Scaling Guide...")
        create_scaling_guide()
        
        # If predictions are all the same class, run additional diagnostic tests
        if len(np.unique(predictions)) == 1:
            print("\n7. Additional Diagnostic Tests...")
            print("⚠ All predictions are the same class! Running additional tests...")
            test_feature_order_hypothesis(model, test_data)
        
        print("\n" + "="*60)
        print("✓ CLASSIFICATION TESTS COMPLETED!")
        print("="*60)
        print("\nINTERPRETATION:")
        print("- Class 0: Likely indicates 'Normal' or 'Low Risk' hemoglobin status")
        print("- Class 1: Likely indicates 'Abnormal' or 'High Risk' hemoglobin status")
        print("- Check training data documentation for exact class definitions")
        
        return True
        
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}")
        print("="*60)
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
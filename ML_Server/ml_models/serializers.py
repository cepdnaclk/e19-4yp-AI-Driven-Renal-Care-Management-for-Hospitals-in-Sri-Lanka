from rest_framework import serializers


class DryWeightPredictionSerializer(serializers.Serializer):
    """
    Serializer for dry weight prediction input data
    """
    patient_id = serializers.CharField(max_length=20, help_text="Patient ID in format RHD_THP_XXX")
    age = serializers.IntegerField(min_value=0, max_value=120, help_text="Patient age")
    gender = serializers.CharField(max_length=10, help_text="Patient gender (Male/Female)")
    height = serializers.FloatField(min_value=50, max_value=250, help_text="Height in cm")
    weight = serializers.FloatField(min_value=20, max_value=300, help_text="Current weight in kg")
    systolic_bp = serializers.FloatField(min_value=60, max_value=250, help_text="Systolic blood pressure")
    diastolic_bp = serializers.FloatField(min_value=40, max_value=150, help_text="Diastolic blood pressure")
    pre_dialysis_weight = serializers.FloatField(min_value=20, max_value=300, help_text="Pre-dialysis weight")
    post_dialysis_weight = serializers.FloatField(min_value=20, max_value=300, help_text="Post-dialysis weight")
    ultrafiltration_volume = serializers.FloatField(min_value=0, max_value=10, help_text="Ultrafiltration volume in L")
    dialysis_duration = serializers.FloatField(min_value=1, max_value=8, help_text="Dialysis duration in hours")

    def validate_age(self, value):
        if value < 0 or value > 120:
            raise serializers.ValidationError(f"Age value {value} years is out of range. Expected range: 0-120 years")
        return value
    
    def validate_height(self, value):
        if value < 50 or value > 250:
            raise serializers.ValidationError(f"Height value {value} cm is out of range. Expected range: 50-250 cm")
        return value
    
    def validate_weight(self, value):
        if value < 20 or value > 300:
            raise serializers.ValidationError(f"Weight value {value} kg is out of range. Expected range: 20-300 kg")
        return value
    
    def validate_systolic_bp(self, value):
        if value < 60 or value > 250:
            raise serializers.ValidationError(f"Systolic blood pressure value {value} mmHg is out of range. Expected range: 60-250 mmHg")
        return value
    
    def validate_diastolic_bp(self, value):
        if value < 40 or value > 150:
            raise serializers.ValidationError(f"Diastolic blood pressure value {value} mmHg is out of range. Expected range: 40-150 mmHg")
        return value
    
    def validate_pre_dialysis_weight(self, value):
        if value < 20 or value > 300:
            raise serializers.ValidationError(f"Pre-dialysis weight value {value} kg is out of range. Expected range: 20-300 kg")
        return value
    
    def validate_post_dialysis_weight(self, value):
        if value < 20 or value > 300:
            raise serializers.ValidationError(f"Post-dialysis weight value {value} kg is out of range. Expected range: 20-300 kg")
        return value
    
    def validate_ultrafiltration_volume(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError(f"Ultrafiltration volume value {value} L is out of range. Expected range: 0-10 L")
        return value
    
    def validate_dialysis_duration(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError(f"Dialysis duration value {value} hours is out of range. Expected range: 1-8 hours")
        return value


class DryWeightPredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for dry weight change prediction response
    """
    patient_id = serializers.CharField()
    dry_weight_change_predicted = serializers.BooleanField()
    prediction_status = serializers.CharField()  # "Change Expected" or "Stable"
    change_probability = serializers.FloatField()
    confidence_score = serializers.FloatField()
    model_version = serializers.CharField()
    prediction_date = serializers.DateTimeField()


class URRPredictionSerializer(serializers.Serializer):
    """
    Serializer for URR (Urea Reduction Ratio) prediction input data
    """
    patient_id = serializers.CharField(max_length=20, help_text="Patient ID in format RHD_THP_XXX")
    pre_dialysis_urea = serializers.FloatField(min_value=5, max_value=200, help_text="Pre-dialysis urea level")
    dialysis_duration = serializers.FloatField(min_value=1, max_value=8, help_text="Dialysis duration in hours")
    blood_flow_rate = serializers.FloatField(min_value=200, max_value=500, help_text="Blood flow rate ml/min")
    dialysate_flow_rate = serializers.FloatField(min_value=300, max_value=800, help_text="Dialysate flow rate ml/min")
    ultrafiltration_rate = serializers.FloatField(min_value=0, max_value=2000, help_text="Ultrafiltration rate ml/hr")
    access_type = serializers.CharField(max_length=20, help_text="Vascular access type")
    kt_v = serializers.FloatField(min_value=0.5, max_value=3.0, help_text="Kt/V ratio", required=False)

    def validate_pre_dialysis_urea(self, value):
        if value < 5 or value > 200:
            raise serializers.ValidationError(f"Pre-dialysis urea value {value} mmol/L is out of range. Expected range: 5-200 mmol/L")
        return value
    
    def validate_dialysis_duration(self, value):
        if value < 1 or value > 8:
            raise serializers.ValidationError(f"Dialysis duration value {value} hours is out of range. Expected range: 1-8 hours")
        return value
    
    def validate_blood_flow_rate(self, value):
        if value < 200 or value > 500:
            raise serializers.ValidationError(f"Blood flow rate value {value} ml/min is out of range. Expected range: 200-500 ml/min")
        return value
    
    def validate_dialysate_flow_rate(self, value):
        if value < 300 or value > 800:
            raise serializers.ValidationError(f"Dialysate flow rate value {value} ml/min is out of range. Expected range: 300-800 ml/min")
        return value
    
    def validate_ultrafiltration_rate(self, value):
        if value < 0 or value > 2000:
            raise serializers.ValidationError(f"Ultrafiltration rate value {value} ml/hr is out of range. Expected range: 0-2000 ml/hr")
        return value
    
    def validate_kt_v(self, value):
        if value is not None and (value < 0.5 or value > 3.0):
            raise serializers.ValidationError(f"Kt/V ratio value {value} is out of range. Expected range: 0.5-3.0")
        return value


class URRPredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for URR risk prediction response
    """
    patient_id = serializers.CharField()
    urr_risk_predicted = serializers.BooleanField()
    risk_status = serializers.CharField()  # "At Risk" or "Safe"
    adequacy_status = serializers.CharField()  # "Predicted Adequate" or "Predicted Inadequate"
    risk_probability = serializers.FloatField()
    confidence_score = serializers.FloatField()
    model_version = serializers.CharField()
    prediction_date = serializers.DateTimeField()


class HbPredictionSerializer(serializers.Serializer):
    """
    Serializer for Hemoglobin (Hb) prediction input data
    Based on the actual model features
    """
    patient_id = serializers.CharField(max_length=20, help_text="Patient ID in format RHD_THP_XXX")
    
    # Laboratory parameters
    albumin = serializers.FloatField(min_value=1, max_value=60, help_text="Albumin (g/L)")
    bu_post_hd = serializers.FloatField(min_value=5, max_value=50, help_text="BU - post HD (mmol/L)")
    bu_pre_hd = serializers.FloatField(min_value=10, max_value=100, help_text="BU - pre HD (mmol/L)")
    s_ca = serializers.FloatField(min_value=1.5, max_value=10, help_text="S Ca (mmol/L)")
    scr_post_hd = serializers.FloatField(min_value=0, max_value=1500, help_text="SCR- post HD (µmol/L)")
    scr_pre_hd = serializers.FloatField(min_value=0, max_value=2000, help_text="SCR- pre HD (µmol/L)")
    serum_k_post_hd = serializers.FloatField(min_value=0, max_value=7.0, help_text="Serum K Post-HD (mmol/L)")
    serum_k_pre_hd = serializers.FloatField(min_value=0, max_value=8.0, help_text="Serum K Pre-HD (mmol/L)")
    serum_na_pre_hd = serializers.FloatField(min_value=0, max_value=150, help_text="Serum Na Pre-HD (mmol/L)")
    ua = serializers.FloatField(min_value=3.0, max_value=15.0, help_text="UA (mg/dL)")  # change to mmol/L 
    hb_diff = serializers.FloatField(min_value=-5.0, max_value=5.0, help_text="Hb_diff (g/dL)")
    hb = serializers.FloatField(min_value=2, max_value=20, help_text="Current Hb (g/dL)")

    def validate_albumin(self, value):
        if value < 10 or value > 60:
            raise serializers.ValidationError(f"Albumin value {value} g/L is out of range. Expected range: 10-60 g/L")
        return value
    
    def validate_bu_post_hd(self, value):
        if value < 5 or value > 50:
            raise serializers.ValidationError(f"BU post-HD value {value} mmol/L is out of range. Expected range: 5-50 mmol/L")
        return value
    
    def validate_bu_pre_hd(self, value):
        if value < 10 or value > 100:
            raise serializers.ValidationError(f"BU pre-HD value {value} mmol/L is out of range. Expected range: 10-100 mmol/L")
        return value
    
    def validate_s_ca(self, value):
        if value < 1.5 or value > 3.5:
            raise serializers.ValidationError(f"Serum Calcium value {value} mmol/L is out of range. Expected range: 1.5-3.5 mmol/L")
        return value
    
    def validate_scr_post_hd(self, value):
        if value < 200 or value > 1500:
            raise serializers.ValidationError(f"Serum Creatinine post-HD value {value} µmol/L is out of range. Expected range: 200-1500 µmol/L")
        return value
    
    def validate_scr_pre_hd(self, value):
        if value < 300 or value > 2000:
            raise serializers.ValidationError(f"Serum Creatinine pre-HD value {value} µmol/L is out of range. Expected range: 300-2000 µmol/L")
        return value
    
    def validate_serum_k_post_hd(self, value):
        if value < 2.0 or value > 7.0:
            raise serializers.ValidationError(f"Serum Potassium post-HD value {value} mmol/L is out of range. Expected range: 2.0-7.0 mmol/L")
        return value
    
    def validate_serum_k_pre_hd(self, value):
        if value < 2.5 or value > 8.0:
            raise serializers.ValidationError(f"Serum Potassium pre-HD value {value} mmol/L is out of range. Expected range: 2.5-8.0 mmol/L")
        return value
    
    def validate_serum_na_pre_hd(self, value):
        if value < 130 or value > 150:
            raise serializers.ValidationError(f"Serum Sodium pre-HD value {value} mmol/L is out of range. Expected range: 130-150 mmol/L")
        return value
    
    def validate_ua(self, value):
        if value < 3.0 or value > 15.0:
            raise serializers.ValidationError(f"Uric Acid value {value} mg/dL is out of range. Expected range: 3.0-15.0 mg/dL")
        return value
    
    def validate_hb_diff(self, value):
        if value < -5.0 or value > 5.0:
            raise serializers.ValidationError(f"Hemoglobin difference value {value} g/dL is out of range. Expected range: -5.0 to 5.0 g/dL")
        return value
    
    def validate_hb(self, value):
        if value < 4 or value > 20:
            raise serializers.ValidationError(f"Current Hemoglobin value {value} g/dL is out of range. Expected range: 4-20 g/dL")
        return value


class HbPredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for Hb risk prediction response
    """
    patient_id = serializers.CharField()
    hb_risk_predicted = serializers.BooleanField()
    risk_status = serializers.CharField()  # "At Risk" or "Safe"
    hb_trend = serializers.CharField()  # Risk-based trend description
    current_hb = serializers.FloatField()
    target_hb_range = serializers.DictField()  # {min: 10, max: 12}
    risk_probability = serializers.FloatField()
    recommendations = serializers.ListField(
        child=serializers.CharField(),
        help_text="Clinical recommendations based on risk prediction"
    )
    confidence_score = serializers.FloatField()
    model_version = serializers.CharField()
    prediction_date = serializers.DateTimeField()


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer for error responses
    """
    error = serializers.CharField()
    message = serializers.CharField()
    details = serializers.DictField(required=False)

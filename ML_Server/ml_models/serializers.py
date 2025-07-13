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


class DryWeightPredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for dry weight prediction response
    """
    patient_id = serializers.CharField()
    predicted_dry_weight = serializers.FloatField()
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


class URRPredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for URR prediction response
    """
    patient_id = serializers.CharField()
    predicted_urr = serializers.FloatField()
    adequacy_status = serializers.CharField()  # Adequate/Inadequate based on URR > 65%
    confidence_score = serializers.FloatField()
    model_version = serializers.CharField()
    prediction_date = serializers.DateTimeField()


class HbPredictionSerializer(serializers.Serializer):
    """
    Serializer for Hemoglobin (Hb) prediction input data
    """
    patient_id = serializers.CharField(max_length=20, help_text="Patient ID in format RHD_THP_XXX")
    current_hb = serializers.FloatField(min_value=4, max_value=20, help_text="Current Hb level g/dL")
    ferritin = serializers.FloatField(min_value=5, max_value=2000, help_text="Ferritin level ng/mL")
    iron = serializers.FloatField(min_value=5, max_value=200, help_text="Serum iron μg/dL")
    transferrin_saturation = serializers.FloatField(min_value=5, max_value=100, help_text="TSAT %")
    epo_dose = serializers.FloatField(min_value=0, max_value=20000, help_text="EPO dose units/week", required=False)
    iron_supplement = serializers.BooleanField(help_text="Iron supplementation status", required=False)
    dialysis_adequacy = serializers.FloatField(min_value=0.5, max_value=3.0, help_text="Kt/V ratio", required=False)
    comorbidities = serializers.ListField(
        child=serializers.CharField(max_length=50),
        help_text="List of comorbidities",
        required=False
    )


class HbPredictionResponseSerializer(serializers.Serializer):
    """
    Serializer for Hb prediction response
    """
    patient_id = serializers.CharField()
    predicted_hb_next_month = serializers.FloatField()
    hb_trend = serializers.CharField()  # Increasing/Decreasing/Stable
    target_hb_range = serializers.DictField()  # {min: 10, max: 12}
    recommendations = serializers.ListField(
        child=serializers.CharField(),
        help_text="Clinical recommendations"
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

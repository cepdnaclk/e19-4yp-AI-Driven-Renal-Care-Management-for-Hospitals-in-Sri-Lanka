const { validationResult } = require('express-validator');
const AIPredictionService = require('../services/aiPredictionService');

/**
 * @desc    Predict Hemoglobin levels using patient's latest data
 * @route   GET /api/ai-predictions/predict/hb/:patientId
 * @access  Private
 */
const predictHemoglobin = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }


    // Get patient data and latest monthly investigation
    const patientDataResult = await AIPredictionService.getPatientDataForHbPrediction(patientId);

    
    if (!patientDataResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Patient data not found or incomplete'
      });
    }

    // Extract token from request headers
    const authToken = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required for ML server access'
      });
    }

    // Make prediction request to ML server using patient's actual data
    const predictionResult = await AIPredictionService.predictHemoglobin(patientDataResult.predictionData, authToken);

    res.json({
      success: true,
      message: 'Hemoglobin prediction completed successfully',
      patient: patientDataResult.patientInfo,
      prediction: predictionResult,
      requestedBy: req.user.id,
      requestedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hemoglobin prediction error:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Patient not found')) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        error: error.message
      });
    }
    
    if (error.message.includes('No monthly investigation data')) {
      return res.status(400).json({
        success: false,
        message: 'No investigation data available for prediction',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get hemoglobin prediction',
      error: error.message,
    });
  }
};

/**
 * @desc    Check ML server health status
 * @route   GET /api/ai-predictions/health
 * @access  Private
 */
const checkMLServerHealth = async (req, res) => {
  try {
    // Extract token from request headers
    const authToken = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required for ML server access'
      });
    }

    const healthStatus = await AIPredictionService.checkMLServerHealth(authToken);

    if (healthStatus.success) {
      res.json({
        success: true,
        message: 'ML server is online',
        status: healthStatus.status,
        serverInfo: healthStatus.serverResponse,
        checkedAt: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'ML server is offline',
        status: healthStatus.status,
        error: healthStatus.error,
        checkedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('ML server health check error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to check ML server status',
      error: error.message
    });
  }
};



module.exports = {
  predictHemoglobin,
  checkMLServerHealth,
  
};

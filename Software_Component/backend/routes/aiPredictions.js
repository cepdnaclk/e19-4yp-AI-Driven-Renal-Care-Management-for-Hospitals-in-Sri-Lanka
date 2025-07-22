const express = require('express');
const router = express.Router();
const AIPrediction = require('../models/AIPrediction');
const Patient = require('../models/Patient');
const DialysisSession = require('../models/DialysisSession');
const MonthlyInvestigation = require('../models/MonthlyInvestigation');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     AIPrediction:
 *       type: object
 *       required:
 *         - patient
 *         - predictionType
 *         - modelUsed
 *         - inputData
 *         - predictions
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the AI prediction
 *         patient:
 *           type: string
 *           description: The id of the patient
 *         predictionType:
 *           type: string
 *           enum: [dry_weight, hemoglobin, urr, mortality_risk, hospitalization_risk]
 *           description: The type of prediction
 *         modelUsed:
 *           type: string
 *           description: The AI model used for prediction
 *         inputData:
 *           type: object
 *           description: The input data used for prediction
 *         predictions:
 *           type: object
 *           description: The prediction results
 *         confidence:
 *           type: number
 *           description: The confidence score of the prediction (0-1)
 *         accuracy:
 *           type: number
 *           description: The model accuracy for this prediction type
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *           description: AI-generated recommendations based on predictions
 *         riskFactors:
 *           type: array
 *           items:
 *             type: string
 *           description: Identified risk factors
 *         dataQuality:
 *           type: object
 *           properties:
 *             score:
 *               type: number
 *             issues:
 *               type: array
 *               items:
 *                 type: string
 *           description: Data quality assessment
 *         validatedBy:
 *           type: string
 *           description: The id of the doctor who validated the prediction
 *         validatedAt:
 *           type: string
 *           format: date-time
 *           description: When the prediction was validated
 *         status:
 *           type: string
 *           enum: [pending, validated, rejected, outdated]
 *           description: The validation status of the prediction
 *         notes:
 *           type: string
 *           description: Additional notes about the prediction
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/ai-predictions:
 *   get:
 *     summary: Get all AI predictions
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: predictionType
 *         schema:
 *           type: string
 *           enum: [dry_weight, hemoglobin, urr, mortality_risk, hospitalization_risk]
 *         description: Filter by prediction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, validated, rejected, outdated]
 *         description: Filter by validation status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: AI predictions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predictions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIPrediction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', auth.protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.patient) {
      query.patient = req.query.patient;
    }
    
    if (req.query.predictionType) {
      query.predictionType = req.query.predictionType;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const predictions = await AIPrediction.find(query)
      .populate('patient', 'name patientId')
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AIPrediction.countDocuments(query);

    res.json({
      predictions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/ai-predictions/{id}:
 *   get:
 *     summary: Get an AI prediction by ID
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The AI prediction ID
 *     responses:
 *       200:
 *         description: AI prediction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIPrediction'
 *       404:
 *         description: AI prediction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', auth.protect, async (req, res) => {
  try {
    const prediction = await AIPrediction.findById(req.params.id)
      .populate('patient', 'name patientId')
      .populate('validatedBy', 'name');

    if (!prediction) {
      return res.status(404).json({ message: 'AI prediction not found' });
    }

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/ai-predictions/generate:
 *   post:
 *     summary: Generate AI prediction for a patient
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - predictionType
 *             properties:
 *               patientId:
 *                 type: string
 *               predictionType:
 *                 type: string
 *                 enum: [dry_weight, hemoglobin, urr, mortality_risk, hospitalization_risk]
 *               modelUsed:
 *                 type: string
 *               includeRecommendations:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: AI prediction generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIPrediction'
 *       400:
 *         description: Invalid input or insufficient data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/generate', auth.protect, async (req, res) => {
  try {
    const { patientId, predictionType, modelUsed, includeRecommendations } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Gather patient data for prediction
    const patientData = await gatherPatientData(patientId);
    
    if (!patientData.hasEnoughData) {
      return res.status(400).json({ 
        message: 'Insufficient data for prediction',
        missingData: patientData.missingData
      });
    }

    // Generate AI prediction (mock implementation)
    const predictionResult = await generateAIPrediction(
      patientData,
      predictionType,
      modelUsed || 'default_model'
    );

    // Create prediction record
    const prediction = new AIPrediction({
      patient: patientId,
      predictionType,
      modelUsed: modelUsed || 'default_model',
      inputData: patientData.inputData,
      predictions: predictionResult.predictions,
      confidence: predictionResult.confidence,
      accuracy: predictionResult.accuracy,
      recommendations: includeRecommendations ? predictionResult.recommendations : [],
      riskFactors: predictionResult.riskFactors,
      dataQuality: patientData.dataQuality,
      status: 'pending'
    });

    await prediction.save();

    const populatedPrediction = await AIPrediction.findById(prediction._id)
      .populate('patient', 'name patientId');

    res.status(201).json(populatedPrediction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/ai-predictions/{id}/validate:
 *   patch:
 *     summary: Validate an AI prediction (doctors only)
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The AI prediction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [validated, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI prediction validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIPrediction'
 *       404:
 *         description: AI prediction not found
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/validate', auth.protect, async (req, res) => {
  try {
    // Only doctors can validate predictions
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prediction = await AIPrediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: 'AI prediction not found' });
    }

    const { status, notes } = req.body;

    if (!['validated', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedPrediction = await AIPrediction.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        validatedBy: req.user.id,
        validatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name patientId')
      .populate('validatedBy', 'name');

    res.json(updatedPrediction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/ai-predictions/patient/{patientId}:
 *   get:
 *     summary: Get AI predictions for a specific patient
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The patient ID
 *       - in: query
 *         name: predictionType
 *         schema:
 *           type: string
 *           enum: [dry_weight, hemoglobin, urr, mortality_risk, hospitalization_risk]
 *         description: Filter by prediction type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent predictions to return
 *     responses:
 *       200:
 *         description: Patient predictions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AIPrediction'
 *       404:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized
 */
router.get('/patient/:patientId', auth.protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Verify patient exists
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const query = { patient: req.params.patientId };
    
    if (req.query.predictionType) {
      query.predictionType = req.query.predictionType;
    }

    const predictions = await AIPrediction.find(query)
      .populate('validatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/ai-predictions/stats:
 *   get:
 *     summary: Get AI prediction statistics
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prediction statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPredictions:
 *                   type: integer
 *                 pendingValidation:
 *                   type: integer
 *                 validatedPredictions:
 *                   type: integer
 *                 rejectedPredictions:
 *                   type: integer
 *                 averageConfidence:
 *                   type: number
 *                 predictionsByType:
 *                   type: object
 *                 modelAccuracy:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', auth.protect, async (req, res) => {
  try {
    // Only doctors and admins can view stats
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalPredictions = await AIPrediction.countDocuments();
    const pendingValidation = await AIPrediction.countDocuments({ status: 'pending' });
    const validatedPredictions = await AIPrediction.countDocuments({ status: 'validated' });
    const rejectedPredictions = await AIPrediction.countDocuments({ status: 'rejected' });

    // Calculate average confidence
    const confidenceStats = await AIPrediction.aggregate([
      {
        $group: {
          _id: null,
          averageConfidence: { $avg: '$confidence' }
        }
      }
    ]);

    // Get predictions by type
    const predictionsByType = await AIPrediction.aggregate([
      {
        $group: {
          _id: '$predictionType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get model accuracy by type
    const modelAccuracy = await AIPrediction.aggregate([
      {
        $group: {
          _id: '$predictionType',
          averageAccuracy: { $avg: '$accuracy' }
        }
      }
    ]);

    res.json({
      totalPredictions,
      pendingValidation,
      validatedPredictions,
      rejectedPredictions,
      averageConfidence: confidenceStats[0]?.averageConfidence || 0,
      predictionsByType: predictionsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      modelAccuracy: modelAccuracy.reduce((acc, item) => {
        acc[item._id] = item.averageAccuracy;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
async function gatherPatientData(patientId) {
  try {
    const patient = await Patient.findById(patientId);
    const recentSessions = await DialysisSession.find({ patient: patientId })
      .sort({ date: -1 })
      .limit(10);
    const recentInvestigations = await MonthlyInvestigation.find({ patient: patientId })
      .sort({ date: -1 })
      .limit(6);

    const inputData = {
      patient: {
        age: patient.age,
        gender: patient.gender,
        weight: patient.weight,
        height: patient.height,
        diagnosis: patient.diagnosis,
        comorbidities: patient.comorbidities
      },
      recentSessions: recentSessions.map(session => ({
        preWeight: session.preWeight,
        postWeight: session.postWeight,
        duration: session.duration,
        urr: session.urr,
        bloodPressure: session.bloodPressure,
        complications: session.complications
      })),
      recentInvestigations: recentInvestigations.map(inv => ({
        hemoglobin: inv.hemoglobin,
        urr: inv.urr,
        urea: inv.urea,
        creatinine: inv.creatinine,
        albumin: inv.albumin,
        date: inv.date
      }))
    };

    // Check data quality
    const dataQuality = {
      score: 0.8, // Mock score
      issues: []
    };

    if (recentSessions.length < 3) {
      dataQuality.issues.push('Insufficient dialysis session data');
      dataQuality.score -= 0.2;
    }

    if (recentInvestigations.length < 2) {
      dataQuality.issues.push('Insufficient investigation data');
      dataQuality.score -= 0.2;
    }

    const hasEnoughData = recentSessions.length >= 1 && recentInvestigations.length >= 1;

    return {
      inputData,
      dataQuality,
      hasEnoughData,
      missingData: hasEnoughData ? [] : ['dialysis_sessions', 'investigations']
    };
  } catch (error) {
    throw new Error(`Failed to gather patient data: ${error.message}`);
  }
}

async function generateAIPrediction(patientData, predictionType, modelUsed) {
  // Mock AI prediction generation
  // In a real implementation, this would call your ML model API
  
  const predictions = {};
  const recommendations = [];
  const riskFactors = [];
  
  switch (predictionType) {
    case 'dry_weight':
      predictions.predictedDryWeight = 65.5;
      predictions.confidenceRange = [63.2, 67.8];
      recommendations.push('Monitor fluid intake closely');
      recommendations.push('Adjust dialysis duration if needed');
      break;
      
    case 'hemoglobin':
      predictions.predictedHemoglobin = 10.2;
      predictions.trend = 'declining';
      recommendations.push('Consider iron supplementation');
      recommendations.push('Monitor for bleeding sources');
      riskFactors.push('Low iron levels');
      break;
      
    case 'urr':
      predictions.predictedURR = 68.5;
      predictions.adequacy = 'adequate';
      recommendations.push('Maintain current dialysis parameters');
      break;
      
    case 'mortality_risk':
      predictions.riskScore = 0.15;
      predictions.riskLevel = 'moderate';
      riskFactors.push('Age factor');
      riskFactors.push('Comorbidities');
      recommendations.push('Increase monitoring frequency');
      break;
      
    case 'hospitalization_risk':
      predictions.riskScore = 0.25;
      predictions.riskLevel = 'high';
      predictions.timeFrame = '3 months';
      riskFactors.push('Recent complications');
      recommendations.push('Preventive care measures');
      break;
  }

  return {
    predictions,
    confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
    accuracy: Math.random() * 0.15 + 0.85, // 0.85 to 1.0
    recommendations,
    riskFactors
  };
}

module.exports = router;

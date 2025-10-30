const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { validateHbPrediction, validateWeightLogic, validatePatientIdParam } = require('../middleware/aiPredictionValidation');
const {
  predictHemoglobin,
  predictURR,
  checkMLServerHealth
} = require('../controllers/aiPredictionController');

const router = express.Router();

/**
 * @swagger
 * /api/ai-predictions/predict/hb/{patientId}:
 *   get:
 *     summary: Predict Hemoglobin levels using patient's latest monthly investigation data
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Hemoglobin prediction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 patient:
 *                   $ref: '#/components/schemas/PatientInfo'
 *                 inputData:
 *                   $ref: '#/components/schemas/HbPredictionInput'
 *                 prediction:
 *                   $ref: '#/components/schemas/HbPredictionResult'
 *                 requestedBy:
 *                   type: string
 *                 requestedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: No investigation data available for prediction
 *       404:
 *         description: Patient not found
 *       500:
 *         description: ML server error or internal server error
 *       503:
 *         description: ML server is unavailable
 */
router.get('/predict/hb/:patientId', protect, authorize('doctor', 'nurse'), validatePatientIdParam, predictHemoglobin);

/**
 * @swagger
 * /api/ai-predictions/predict/urr/{patientId}:
 *   get:
 *     summary: Predict URR risk using patient's latest monthly investigation data
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: URR prediction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 patient:
 *                   type: object
 *                 prediction:
 *                   type: object
 *       400:
 *         description: Missing required data or validation error
 *       503:
 *         description: ML server unavailable
 */
router.get('/predict/urr/:patientId', protect, authorize('doctor', 'nurse'), validatePatientIdParam, predictURR);

/**
 * @swagger
 * /api/ai-predictions/health:
 *   get:
 *     summary: Check ML server health status
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ML server is online and healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                 serverInfo:
 *                   type: object
 *                 checkedAt:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: ML server is offline or unavailable
 */
router.get('/health', protect, checkMLServerHealth);

/**
 * @swagger
 * /api/ai-predictions/predict/hb/schema:
 *   get:
 *     summary: Get Hemoglobin prediction input schema and requirements
 *     tags: [AI Predictions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prediction schema retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 schema:
 *                   $ref: '#/components/schemas/HbPredictionSchema'
 */

module.exports = router;
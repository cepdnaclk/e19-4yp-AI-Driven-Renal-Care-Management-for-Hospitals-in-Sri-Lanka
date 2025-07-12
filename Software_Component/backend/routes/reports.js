const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const DialysisSession = require('../models/DialysisSession');
const MonthlyInvestigation = require('../models/MonthlyInvestigation');
const ClinicalDecision = require('../models/ClinicalDecision');
const AIPrediction = require('../models/AIPrediction');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/reports/patient-summary:
 *   get:
 *     summary: Get patient summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period
 *     responses:
 *       200:
 *         description: Patient summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   type: object
 *                 reportPeriod:
 *                   type: object
 *                 sessions:
 *                   type: object
 *                 investigations:
 *                   type: object
 *                 decisions:
 *                   type: object
 *                 predictions:
 *                   type: object
 *                 trends:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.get('/patient-summary', auth.protect, async (req, res) => {
  try {
    const { patientId, startDate, endDate } = req.query;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Set default date range if not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    const dateFilter = {
      $gte: startDateObj,
      $lte: endDateObj
    };

    // Get sessions data
    const sessions = await DialysisSession.find({
      patient: patientId,
      date: dateFilter
    }).sort({ date: 1 });

    const sessionStats = {
      total: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      cancelled: sessions.filter(s => s.status === 'cancelled').length,
      averageURR: sessions.reduce((sum, s) => sum + (s.urr || 0), 0) / sessions.length || 0,
      averageDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length || 0
    };

    // Get investigations data
    const investigations = await MonthlyInvestigation.find({
      patient: patientId,
      date: dateFilter
    }).sort({ date: 1 });

    const investigationStats = {
      total: investigations.length,
      latestHemoglobin: investigations.length > 0 ? investigations[investigations.length - 1].hemoglobin : null,
      latestURR: investigations.length > 0 ? investigations[investigations.length - 1].urr : null,
      latestCreatinine: investigations.length > 0 ? investigations[investigations.length - 1].creatinine : null,
      trends: calculateTrends(investigations)
    };

    // Get decisions data
    const decisions = await ClinicalDecision.find({
      patient: patientId,
      createdAt: dateFilter
    }).sort({ createdAt: 1 });

    const decisionStats = {
      total: decisions.length,
      pending: decisions.filter(d => d.status === 'pending').length,
      implemented: decisions.filter(d => d.status === 'implemented').length,
      byType: decisions.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {})
    };

    // Get predictions data
    const predictions = await AIPrediction.find({
      patient: patientId,
      createdAt: dateFilter
    }).sort({ createdAt: 1 });

    const predictionStats = {
      total: predictions.length,
      validated: predictions.filter(p => p.status === 'validated').length,
      pending: predictions.filter(p => p.status === 'pending').length,
      byType: predictions.reduce((acc, p) => {
        acc[p.predictionType] = (acc[p.predictionType] || 0) + 1;
        return acc;
      }, {}),
      averageConfidence: predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length || 0
    };

    // Calculate trends
    const trends = {
      weightTrend: calculateWeightTrend(sessions),
      urrTrend: calculateURRTrend(sessions),
      hemoglobinTrend: calculateHemoglobinTrend(investigations)
    };

    const report = {
      patient: {
        id: patient._id,
        name: patient.name,
        patientId: patient.patientId,
        age: patient.age,
        gender: patient.gender,
        diagnosis: patient.diagnosis
      },
      reportPeriod: {
        startDate: startDateObj,
        endDate: endDateObj,
        days: Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24))
      },
      sessions: sessionStats,
      investigations: investigationStats,
      decisions: decisionStats,
      predictions: predictionStats,
      trends
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reports/dialysis-summary:
 *   get:
 *     summary: Get dialysis summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by specific patient
 *     responses:
 *       200:
 *         description: Dialysis summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportPeriod:
 *                   type: object
 *                 totalSessions:
 *                   type: integer
 *                 completedSessions:
 *                   type: integer
 *                 completionRate:
 *                   type: number
 *                 averageURR:
 *                   type: number
 *                 averageDuration:
 *                   type: number
 *                 sessionsByStatus:
 *                   type: object
 *                 adequacyDistribution:
 *                   type: object
 *                 complications:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/dialysis-summary', auth.protect, async (req, res) => {
  try {
    const { startDate, endDate, patientId } = req.query;

    // Set default date range if not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const query = {
      date: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    };

    if (patientId) {
      query.patient = patientId;
    }

    // Role-based access control
    if (req.user.role === 'doctor') {
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      query.patient = patientId ? patientId : { $in: doctorPatients };
    }

    const sessions = await DialysisSession.find(query).populate('patient', 'name patientId');

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const validSessions = sessions.filter(s => s.urr && s.duration);
    const averageURR = validSessions.reduce((sum, s) => sum + s.urr, 0) / validSessions.length || 0;
    const averageDuration = validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length || 0;

    const sessionsByStatus = sessions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});

    const adequacyDistribution = {
      adequate: sessions.filter(s => s.urr >= 65).length,
      inadequate: sessions.filter(s => s.urr < 65 && s.urr > 0).length,
      unknown: sessions.filter(s => !s.urr).length
    };

    const complications = sessions.reduce((acc, s) => {
      if (s.complications && s.complications.length > 0) {
        s.complications.forEach(comp => {
          acc[comp] = (acc[comp] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const report = {
      reportPeriod: {
        startDate: startDateObj,
        endDate: endDateObj,
        days: Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24))
      },
      totalSessions,
      completedSessions,
      completionRate: Math.round(completionRate * 100) / 100,
      averageURR: Math.round(averageURR * 100) / 100,
      averageDuration: Math.round(averageDuration * 100) / 100,
      sessionsByStatus,
      adequacyDistribution,
      complications
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reports/investigation-summary:
 *   get:
 *     summary: Get investigation summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by specific patient
 *     responses:
 *       200:
 *         description: Investigation summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportPeriod:
 *                   type: object
 *                 totalInvestigations:
 *                   type: integer
 *                 averageValues:
 *                   type: object
 *                 abnormalResults:
 *                   type: object
 *                 trends:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/investigation-summary', auth.protect, async (req, res) => {
  try {
    const { startDate, endDate, patientId } = req.query;

    // Set default date range if not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    const query = {
      date: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    };

    if (patientId) {
      query.patient = patientId;
    }

    // Role-based access control
    if (req.user.role === 'doctor') {
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      query.patient = patientId ? patientId : { $in: doctorPatients };
    }

    const investigations = await MonthlyInvestigation.find(query).populate('patient', 'name patientId');

    const totalInvestigations = investigations.length;

    // Calculate average values
    const averageValues = {
      hemoglobin: investigations.reduce((sum, inv) => sum + (inv.hemoglobin || 0), 0) / totalInvestigations || 0,
      urr: investigations.reduce((sum, inv) => sum + (inv.urr || 0), 0) / totalInvestigations || 0,
      urea: investigations.reduce((sum, inv) => sum + (inv.urea || 0), 0) / totalInvestigations || 0,
      creatinine: investigations.reduce((sum, inv) => sum + (inv.creatinine || 0), 0) / totalInvestigations || 0,
      albumin: investigations.reduce((sum, inv) => sum + (inv.albumin || 0), 0) / totalInvestigations || 0
    };

    // Define normal ranges
    const normalRanges = {
      hemoglobin: { min: 10, max: 16 },
      urr: { min: 65, max: 100 },
      urea: { min: 20, max: 50 },
      creatinine: { min: 0.5, max: 1.2 },
      albumin: { min: 3.5, max: 5.0 }
    };

    // Count abnormal results
    const abnormalResults = {};
    Object.keys(normalRanges).forEach(param => {
      const range = normalRanges[param];
      abnormalResults[param] = {
        low: investigations.filter(inv => inv[param] && inv[param] < range.min).length,
        high: investigations.filter(inv => inv[param] && inv[param] > range.max).length,
        total: investigations.filter(inv => inv[param] && (inv[param] < range.min || inv[param] > range.max)).length
      };
    });

    // Calculate trends (comparing first half vs second half of period)
    const midPoint = new Date((startDateObj.getTime() + endDateObj.getTime()) / 2);
    const firstHalf = investigations.filter(inv => inv.date < midPoint);
    const secondHalf = investigations.filter(inv => inv.date >= midPoint);

    const trends = {};
    Object.keys(averageValues).forEach(param => {
      const firstHalfAvg = firstHalf.reduce((sum, inv) => sum + (inv[param] || 0), 0) / firstHalf.length || 0;
      const secondHalfAvg = secondHalf.reduce((sum, inv) => sum + (inv[param] || 0), 0) / secondHalf.length || 0;
      
      trends[param] = {
        firstHalf: Math.round(firstHalfAvg * 100) / 100,
        secondHalf: Math.round(secondHalfAvg * 100) / 100,
        change: Math.round((secondHalfAvg - firstHalfAvg) * 100) / 100,
        percentChange: firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 10000) / 100 : 0
      };
    });

    const report = {
      reportPeriod: {
        startDate: startDateObj,
        endDate: endDateObj,
        days: Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24))
      },
      totalInvestigations,
      averageValues: Object.keys(averageValues).reduce((acc, key) => {
        acc[key] = Math.round(averageValues[key] * 100) / 100;
        return acc;
      }, {}),
      abnormalResults,
      trends
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reports/ai-predictions-summary:
 *   get:
 *     summary: Get AI predictions summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report period
 *       - in: query
 *         name: predictionType
 *         schema:
 *           type: string
 *           enum: [dry_weight, hemoglobin, urr, mortality_risk, hospitalization_risk]
 *         description: Filter by prediction type
 *     responses:
 *       200:
 *         description: AI predictions summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reportPeriod:
 *                   type: object
 *                 totalPredictions:
 *                   type: integer
 *                 predictionsByType:
 *                   type: object
 *                 predictionsByStatus:
 *                   type: object
 *                 modelPerformance:
 *                   type: object
 *                 validationStats:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/ai-predictions-summary', auth.protect, async (req, res) => {
  try {
    // Only doctors and admins can access this report
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate, predictionType } = req.query;

    // Set default date range if not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const query = {
      createdAt: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    };

    if (predictionType) {
      query.predictionType = predictionType;
    }

    const predictions = await AIPrediction.find(query).populate('patient', 'name patientId');

    const totalPredictions = predictions.length;

    const predictionsByType = predictions.reduce((acc, pred) => {
      acc[pred.predictionType] = (acc[pred.predictionType] || 0) + 1;
      return acc;
    }, {});

    const predictionsByStatus = predictions.reduce((acc, pred) => {
      acc[pred.status] = (acc[pred.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate model performance
    const modelPerformance = {};
    const modelGroups = predictions.reduce((acc, pred) => {
      const key = `${pred.predictionType}_${pred.modelUsed}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(pred);
      return acc;
    }, {});

    Object.keys(modelGroups).forEach(key => {
      const group = modelGroups[key];
      const avgConfidence = group.reduce((sum, pred) => sum + (pred.confidence || 0), 0) / group.length;
      const avgAccuracy = group.reduce((sum, pred) => sum + (pred.accuracy || 0), 0) / group.length;
      
      modelPerformance[key] = {
        totalPredictions: group.length,
        averageConfidence: Math.round(avgConfidence * 10000) / 100,
        averageAccuracy: Math.round(avgAccuracy * 10000) / 100,
        validated: group.filter(p => p.status === 'validated').length,
        rejected: group.filter(p => p.status === 'rejected').length
      };
    });

    // Validation statistics
    const validatedPredictions = predictions.filter(p => p.status === 'validated');
    const rejectedPredictions = predictions.filter(p => p.status === 'rejected');
    const pendingPredictions = predictions.filter(p => p.status === 'pending');

    const validationStats = {
      totalValidated: validatedPredictions.length,
      totalRejected: rejectedPredictions.length,
      totalPending: pendingPredictions.length,
      validationRate: totalPredictions > 0 ? Math.round((validatedPredictions.length / totalPredictions) * 10000) / 100 : 0,
      rejectionRate: totalPredictions > 0 ? Math.round((rejectedPredictions.length / totalPredictions) * 10000) / 100 : 0
    };

    const report = {
      reportPeriod: {
        startDate: startDateObj,
        endDate: endDateObj,
        days: Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24))
      },
      totalPredictions,
      predictionsByType,
      predictionsByStatus,
      modelPerformance,
      validationStats
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function calculateTrends(investigations) {
  if (investigations.length < 2) return {};

  const trends = {};
  const params = ['hemoglobin', 'urr', 'urea', 'creatinine', 'albumin'];

  params.forEach(param => {
    const values = investigations.map(inv => inv[param]).filter(val => val !== null && val !== undefined);
    if (values.length >= 2) {
      const first = values[0];
      const last = values[values.length - 1];
      const change = last - first;
      const percentChange = first > 0 ? (change / first) * 100 : 0;
      
      trends[param] = {
        change: Math.round(change * 100) / 100,
        percentChange: Math.round(percentChange * 100) / 100,
        direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
      };
    }
  });

  return trends;
}

function calculateWeightTrend(sessions) {
  if (sessions.length < 2) return null;

  const weights = sessions.map(s => s.preWeight).filter(w => w !== null && w !== undefined);
  if (weights.length >= 2) {
    const first = weights[0];
    const last = weights[weights.length - 1];
    const change = last - first;
    
    return {
      change: Math.round(change * 100) / 100,
      direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
    };
  }
  return null;
}

function calculateURRTrend(sessions) {
  if (sessions.length < 2) return null;

  const urrs = sessions.map(s => s.urr).filter(u => u !== null && u !== undefined);
  if (urrs.length >= 2) {
    const first = urrs[0];
    const last = urrs[urrs.length - 1];
    const change = last - first;
    
    return {
      change: Math.round(change * 100) / 100,
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
    };
  }
  return null;
}

function calculateHemoglobinTrend(investigations) {
  if (investigations.length < 2) return null;

  const hbs = investigations.map(inv => inv.hemoglobin).filter(hb => hb !== null && hb !== undefined);
  if (hbs.length >= 2) {
    const first = hbs[0];
    const last = hbs[hbs.length - 1];
    const change = last - first;
    
    return {
      change: Math.round(change * 100) / 100,
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
    };
  }
  return null;
}

module.exports = router;

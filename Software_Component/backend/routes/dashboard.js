const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const DialysisSession = require('../models/DialysisSession');
const MonthlyInvestigation = require('../models/MonthlyInvestigation');
const ClinicalDecision = require('../models/ClinicalDecision');
const AIPrediction = require('../models/AIPrediction');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     new:
 *                       type: integer
 *                 sessions:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     today:
 *                       type: integer
 *                     thisWeek:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                 investigations:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     thisMonth:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                 decisions:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     urgent:
 *                       type: integer
 *                 predictions:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     validated:
 *                       type: integer
 *                 notifications:
 *                   type: object
 *                   properties:
 *                     unread:
 *                       type: integer
 *                     urgent:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/overview', auth.protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Build queries based on user role
    const patientQuery = {};
    const sessionQuery = {};
    const investigationQuery = {};
    const decisionQuery = {};

    if (req.user.role === 'doctor') {
      // Doctors see data for their patients
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      patientQuery._id = { $in: doctorPatients };
      sessionQuery.patient = { $in: doctorPatients };
      investigationQuery.patient = { $in: doctorPatients };
      decisionQuery.doctorId = req.user.id;
    }

    // Patient statistics
    const totalPatients = await Patient.countDocuments(patientQuery);
    const activePatients = await Patient.countDocuments({
      ...patientQuery,
      status: 'active'
    });
    const newPatients = await Patient.countDocuments({
      ...patientQuery,
      createdAt: { $gte: thisMonth }
    });

    // Session statistics
    const totalSessions = await DialysisSession.countDocuments(sessionQuery);
    const todaySessions = await DialysisSession.countDocuments({
      ...sessionQuery,
      date: { $gte: today }
    });
    const thisWeekSessions = await DialysisSession.countDocuments({
      ...sessionQuery,
      date: { $gte: thisWeek }
    });
    const completedSessions = await DialysisSession.countDocuments({
      ...sessionQuery,
      status: 'completed'
    });

    // Investigation statistics
    const totalInvestigations = await MonthlyInvestigation.countDocuments(investigationQuery);
    const thisMonthInvestigations = await MonthlyInvestigation.countDocuments({
      ...investigationQuery,
      date: { $gte: thisMonth }
    });

    // Decision statistics
    const totalDecisions = await ClinicalDecision.countDocuments(decisionQuery);
    const pendingDecisions = await ClinicalDecision.countDocuments({
      ...decisionQuery,
      status: 'pending'
    });
    const urgentDecisions = await ClinicalDecision.countDocuments({
      ...decisionQuery,
      priority: 'urgent'
    });

    // Prediction statistics
    const totalPredictions = await AIPrediction.countDocuments();
    const pendingPredictions = await AIPrediction.countDocuments({ status: 'pending' });
    const validatedPredictions = await AIPrediction.countDocuments({ status: 'validated' });

    // Notification statistics
    const unreadNotifications = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });
    const urgentNotifications = await Notification.countDocuments({
      userId: req.user.id,
      priority: 'urgent',
      read: false
    });

    const overview = {
      patients: {
        total: totalPatients,
        active: activePatients,
        new: newPatients
      },
      sessions: {
        total: totalSessions,
        today: todaySessions,
        thisWeek: thisWeekSessions,
        completed: completedSessions
      },
      investigations: {
        total: totalInvestigations,
        thisMonth: thisMonthInvestigations
      },
      decisions: {
        total: totalDecisions,
        pending: pendingDecisions,
        urgent: urgentDecisions
      },
      predictions: {
        total: totalPredictions,
        pending: pendingPredictions,
        validated: validatedPredictions
      },
      notifications: {
        unread: unreadNotifications,
        urgent: urgentNotifications
      }
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity for dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recentSessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 recentInvestigations:
 *                   type: array
 *                   items:
 *                     type: object
 *                 recentDecisions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 recentPredictions:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/recent-activity', auth.protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Build queries based on user role
    const sessionQuery = {};
    const investigationQuery = {};
    const decisionQuery = {};

    if (req.user.role === 'doctor') {
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      sessionQuery.patient = { $in: doctorPatients };
      investigationQuery.patient = { $in: doctorPatients };
      decisionQuery.doctorId = req.user.id;
    }

    // Get recent sessions
    const recentSessions = await DialysisSession.find(sessionQuery)
      .populate('patient', 'name patientId')
      .sort({ date: -1 })
      .limit(limit);

    // Get recent investigations
    const recentInvestigations = await MonthlyInvestigation.find(investigationQuery)
      .populate('patient', 'name patientId')
      .sort({ date: -1 })
      .limit(limit);

    // Get recent decisions
    const recentDecisions = await ClinicalDecision.find(decisionQuery)
      .populate('patient', 'name patientId')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent predictions
    const recentPredictions = await AIPrediction.find()
      .populate('patient', 'name patientId')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      recentSessions,
      recentInvestigations,
      recentDecisions,
      recentPredictions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/charts:
 *   get:
 *     summary: Get chart data for dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7days, 30days, 90days, 1year]
 *           default: 30days
 *         description: Time period for chart data
 *     responses:
 *       200:
 *         description: Chart data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionsTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: integer
 *                 investigationsTrend:
 *                   type: array
 *                   items:
 *                     type: object
 *                 decisionsByType:
 *                   type: object
 *                 predictionAccuracy:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/charts', auth.protect, async (req, res) => {
  try {
    const period = req.query.period || '30days';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Build queries based on user role
    const sessionQuery = { date: { $gte: startDate, $lte: endDate } };
    const investigationQuery = { date: { $gte: startDate, $lte: endDate } };
    const decisionQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    if (req.user.role === 'doctor') {
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      sessionQuery.patient = { $in: doctorPatients };
      investigationQuery.patient = { $in: doctorPatients };
      decisionQuery.doctorId = req.user.id;
    }

    // Sessions trend
    const sessionsTrend = await DialysisSession.aggregate([
      { $match: sessionQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Investigations trend
    const investigationsTrend = await MonthlyInvestigation.aggregate([
      { $match: investigationQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Decisions by type
    const decisionsByType = await ClinicalDecision.aggregate([
      { $match: decisionQuery },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Prediction accuracy by type
    const predictionAccuracy = await AIPrediction.aggregate([
      {
        $group: {
          _id: "$predictionType",
          averageAccuracy: { $avg: "$accuracy" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      sessionsTrend,
      investigationsTrend,
      decisionsByType: decisionsByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      predictionAccuracy: predictionAccuracy.reduce((acc, item) => {
        acc[item._id] = {
          accuracy: item.averageAccuracy,
          count: item.count
        };
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/alerts:
 *   get:
 *     summary: Get dashboard alerts and warnings
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard alerts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criticalAlerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: object
 *                 reminders:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/alerts', auth.protect, async (req, res) => {
  try {
    const criticalAlerts = [];
    const warnings = [];
    const reminders = [];

    // Build queries based on user role
    const patientQuery = {};
    const sessionQuery = {};
    const decisionQuery = {};

    if (req.user.role === 'doctor') {
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      patientQuery._id = { $in: doctorPatients };
      sessionQuery.patient = { $in: doctorPatients };
      decisionQuery.doctorId = req.user.id;
    }

    // Check for patients with no recent sessions
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const patientsWithoutRecentSessions = await Patient.aggregate([
      { $match: { ...patientQuery, status: 'active' } },
      {
        $lookup: {
          from: 'dialysissessions',
          localField: '_id',
          foreignField: 'patient',
          as: 'recentSessions',
          pipeline: [
            { $match: { date: { $gte: twoWeeksAgo } } },
            { $limit: 1 }
          ]
        }
      },
      { $match: { 'recentSessions.0': { $exists: false } } },
      { $limit: 5 }
    ]);

    patientsWithoutRecentSessions.forEach(patient => {
      warnings.push({
        type: 'missing_sessions',
        message: `Patient ${patient.name} has no dialysis sessions in the last 2 weeks`,
        patientId: patient._id,
        severity: 'high'
      });
    });

    // Check for urgent clinical decisions
    const urgentDecisions = await ClinicalDecision.find({
      ...decisionQuery,
      priority: 'urgent',
      status: 'pending'
    })
      .populate('patient', 'name patientId')
      .limit(5);

    urgentDecisions.forEach(decision => {
      criticalAlerts.push({
        type: 'urgent_decision',
        message: `Urgent clinical decision pending for ${decision.patient.name}`,
        decisionId: decision._id,
        patientId: decision.patient._id,
        severity: 'critical'
      });
    });

    // Check for pending AI predictions that need validation
    const pendingPredictions = await AIPrediction.find({
      status: 'pending',
      createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 24 hours
    })
      .populate('patient', 'name patientId')
      .limit(5);

    pendingPredictions.forEach(prediction => {
      reminders.push({
        type: 'prediction_validation',
        message: `AI prediction for ${prediction.patient.name} needs validation`,
        predictionId: prediction._id,
        patientId: prediction.patient._id,
        severity: 'medium'
      });
    });

    // Check for patients with concerning investigation results
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const concerningInvestigations = await MonthlyInvestigation.find({
      date: { $gte: oneMonthAgo },
      $or: [
        { hemoglobin: { $lt: 7 } }, // Low hemoglobin
        { urr: { $lt: 65 } }, // Low URR
        { creatinine: { $gt: 10 } } // High creatinine
      ]
    })
      .populate('patient', 'name patientId')
      .limit(5);

    concerningInvestigations.forEach(investigation => {
      let issue = '';
      if (investigation.hemoglobin < 7) issue = 'Low hemoglobin';
      else if (investigation.urr < 65) issue = 'Low URR';
      else if (investigation.creatinine > 10) issue = 'High creatinine';

      warnings.push({
        type: 'concerning_investigation',
        message: `${issue} detected for ${investigation.patient.name}`,
        investigationId: investigation._id,
        patientId: investigation.patient._id,
        severity: 'high'
      });
    });

    res.json({
      criticalAlerts,
      warnings,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/dashboard/quick-stats:
 *   get:
 *     summary: Get quick statistics for dashboard widgets
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quick statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todaysSessions:
 *                   type: integer
 *                 pendingDecisions:
 *                   type: integer
 *                 unreadNotifications:
 *                   type: integer
 *                 activePatients:
 *                   type: integer
 *                 thisWeekSessions:
 *                   type: integer
 *                 averageURR:
 *                   type: number
 *                 completionRate:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/quick-stats', auth.protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setDate(1);

    // Build queries based on user role
    const patientQuery = {};
    const sessionQuery = {};
    const decisionQuery = {};

    if (req.user.role === 'doctor') {
      const doctorPatients = await Patient.find({ assignedDoctor: req.user.id }).distinct('_id');
      patientQuery._id = { $in: doctorPatients };
      sessionQuery.patient = { $in: doctorPatients };
      decisionQuery.doctorId = req.user.id;
    }

    const todaysSessions = await DialysisSession.countDocuments({
      ...sessionQuery,
      date: { $gte: today }
    });

    const pendingDecisions = await ClinicalDecision.countDocuments({
      ...decisionQuery,
      status: 'pending'
    });

    const unreadNotifications = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });

    const activePatients = await Patient.countDocuments({
      ...patientQuery,
      status: 'active'
    });

    const thisWeekSessions = await DialysisSession.countDocuments({
      ...sessionQuery,
      date: { $gte: thisWeek }
    });

    // Calculate average URR for this month
    const urrStats = await DialysisSession.aggregate([
      { $match: { ...sessionQuery, date: { $gte: thisMonth }, urr: { $exists: true } } },
      {
        $group: {
          _id: null,
          averageURR: { $avg: '$urr' }
        }
      }
    ]);

    // Calculate completion rate
    const totalSessions = await DialysisSession.countDocuments(sessionQuery);
    const completedSessions = await DialysisSession.countDocuments({
      ...sessionQuery,
      status: 'completed'
    });

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    res.json({
      todaysSessions,
      pendingDecisions,
      unreadNotifications,
      activePatients,
      thisWeekSessions,
      averageURR: urrStats[0]?.averageURR || 0,
      completionRate: Math.round(completionRate * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

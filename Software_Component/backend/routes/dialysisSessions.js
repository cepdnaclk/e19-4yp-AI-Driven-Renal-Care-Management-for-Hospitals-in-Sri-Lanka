const express = require('express');
const { body, validationResult } = require('express-validator');
const DialysisSession = require('../models/DialysisSession');
const Patient = require('../models/Patient');
const { protect, authorize, checkPatientAssignment } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all dialysis sessions for a patient
// @route   GET /api/dialysis-sessions/:patientId
// @access  Private
router.get('/:patientId', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    let query = { patient: patient._id };

    // Role-based filtering
    // if (req.user.role === 'doctor') {
    //   // Check if doctor is assigned to this patient
    //   if (patient.assignedDoctor.toString() !== req.user.id) {
    //     return res.status(403).json({
    //       success: false,
    //       message: 'Not authorized to access this patient\'s sessions'
    //     });
    //   }
    // } else if (req.user.role === 'nurse') {
    //   query.nurse = req.user.id;
    // }

    // Date filtering
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const sessions = await DialysisSession.find(query)
      .populate('nurse', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DialysisSession.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Format response
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      sessionId: session.sessionId,
      patientId: session.patient,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      status: session.status,
      preDialysis: session.preDialysis,
      postDialysis: session.postDialysis,
      dialysisParameters: session.dialysisParameters,
      adequacyParameters: session.adequacyParameters,
      vascularAccess: session.vascularAccess,
      complications: session.complications,
      qualityIndicators: session.qualityIndicators,
      nurse: session.nurse,
      doctor: session.doctor,
      notes: session.notes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));

    res.json({
      success: true,
      sessions: formattedSessions,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get dialysis session by ID
// @route   GET /api/dialysis-sessions/:patientId/:id
// @access  Private
router.get('/:patientId/:id', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId, id } = req.params;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Find session using sessionId
    const session = await DialysisSession.findOne({ sessionId: id, patient: patient._id })
      .populate('nurse', 'name email phoneNumber')
      .populate('doctor', 'name email phoneNumber specialization')
      .populate('aiPredictions.type', 'prediction confidence');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Dialysis session not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'doctor') {
      if (patient.assignedDoctor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this session'
        });
      }
    } else if (req.user.role === 'nurse' && session.nurse._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this session'
      });
    }

    // Format response
    const formattedSession = {
      id: session._id,
      sessionId: session.sessionId,
      patientId: session.patient,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      status: session.status,
      preDialysis: session.preDialysis,
      postDialysis: session.postDialysis,
      dialysisParameters: session.dialysisParameters,
      adequacyParameters: session.adequacyParameters,
      vascularAccess: session.vascularAccess,
      complications: session.complications,
      qualityIndicators: session.qualityIndicators,
      aiPredictions: session.aiPredictions,
      nurse: session.nurse,
      doctor: session.doctor,
      notes: session.notes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };

    res.json({
      success: true,
      session: formattedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new dialysis session
// @route   POST /api/dialysis-sessions/:patientId
// @access  Private/Nurse
router.post('/:patientId', protect, authorize('nurse', 'doctor'), [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
  body('preDialysis.weight').isNumeric().withMessage('Valid pre-dialysis weight is required'),
  body('preDialysis.bloodPressure.systolic').isInt({ min: 50, max: 300 }).withMessage('Valid systolic BP is required'),
  body('preDialysis.bloodPressure.diastolic').isInt({ min: 30, max: 200 }).withMessage('Valid diastolic BP is required'),
  body('preDialysis.heartRate').isInt({ min: 30, max: 200 }).withMessage('Valid heart rate is required'),
  body('preDialysis.temperature').isFloat({ min: 30, max: 45 }).withMessage('Valid temperature is required'),
  body('dialysisParameters.ufGoal').isFloat({ min: 0, max: 5 }).withMessage('Valid UF goal is required'),
  body('vascularAccess.type').isIn(['AVF', 'AVG', 'CENTRAL_CATHETER', 'PERITONEAL_CATHETER']).withMessage('Valid access type is required'),
  body('vascularAccess.site').notEmpty().withMessage('Access site is required')
], async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Set session data
    const sessionData = {
      ...req.body,
      patient: patient._id,
      nurse: req.user.id,
      doctor: patient.assignedDoctor
    };

    const session = await DialysisSession.create(sessionData);

    // Populate the response
    const populatedSession = await DialysisSession.findById(session._id)
      .populate('nurse', 'name email')
      .populate('doctor', 'name email');

    // Format response
    const formattedSession = {
      id: populatedSession._id,
      sessionId: populatedSession.sessionId,
      patientId: populatedSession.patient,
      date: populatedSession.date,
      startTime: populatedSession.startTime,
      endTime: populatedSession.endTime,
      duration: populatedSession.duration,
      status: populatedSession.status,
      preDialysis: populatedSession.preDialysis,
      postDialysis: populatedSession.postDialysis,
      dialysisParameters: populatedSession.dialysisParameters,
      adequacyParameters: populatedSession.adequacyParameters,
      vascularAccess: populatedSession.vascularAccess,
      complications: populatedSession.complications,
      qualityIndicators: populatedSession.qualityIndicators,
      nurse: populatedSession.nurse,
      doctor: populatedSession.doctor,
      notes: populatedSession.notes,
      createdAt: populatedSession.createdAt,
      updatedAt: populatedSession.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Dialysis session created successfully',
      session: formattedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update dialysis session
// @route   PUT /api/dialysis-sessions/:patientId/:id
// @access  Private
router.put('/:patientId/:id', protect, authorize('doctor', 'nurse'), [
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required')
], async (req, res) => {
  try {
    const { patientId, id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Find and update session using sessionId
    const session = await DialysisSession.findOneAndUpdate(
      { sessionId: id, patient: patient._id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('nurse', 'name email')
     .populate('doctor', 'name email');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Dialysis session not found'
      });
    }

    // Check permissions
    if (req.user.role === 'nurse' && session.nurse._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    // Format response
    const formattedSession = {
      id: session._id,
      sessionId: session.sessionId,
      patientId: session.patient,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      status: session.status,
      preDialysis: session.preDialysis,
      postDialysis: session.postDialysis,
      dialysisParameters: session.dialysisParameters,
      adequacyParameters: session.adequacyParameters,
      vascularAccess: session.vascularAccess,
      complications: session.complications,
      qualityIndicators: session.qualityIndicators,
      nurse: session.nurse,
      doctor: session.doctor,
      notes: session.notes,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };

    res.json({
      success: true,
      message: 'Dialysis session updated successfully',
      session: formattedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Complete dialysis session
// @route   PUT /api/dialysis-sessions/:patientId/:id/complete
// @access  Private/Nurse
router.put('/:patientId/:id/complete', protect, authorize('nurse', 'doctor'), [
  body('postDialysis.weight').isNumeric().withMessage('Post-dialysis weight is required'),
  body('postDialysis.bloodPressure.systolic').isInt({ min: 50, max: 300 }).withMessage('Valid systolic BP is required'),
  body('postDialysis.bloodPressure.diastolic').isInt({ min: 30, max: 200 }).withMessage('Valid diastolic BP is required'),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required')
], async (req, res) => {
  try {
    const { patientId, id } = req.params;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Find session using sessionId
    const session = await DialysisSession.findOne({ sessionId: id, patient: patient._id });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Dialysis session not found'
      });
    }

    // Update session with completion data
    const updateData = {
      ...req.body,
      status: 'COMPLETED',
      'qualityIndicators.sessionCompleted': true
    };

    // Calculate adequacy parameters if provided
    if (req.body.adequacyParameters) {
      updateData.adequacyParameters = req.body.adequacyParameters;
      updateData['qualityIndicators.prescriptionAchieved'] = 
        req.body.adequacyParameters.ktv >= 1.2 && req.body.adequacyParameters.urr >= 65;
    }

    const updatedSession = await DialysisSession.findOneAndUpdate(
      { sessionId: id, patient: patient._id },
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('nurse', 'name email');

    // Format response
    const formattedSession = {
      id: updatedSession._id,
      sessionId: updatedSession.sessionId,
      patientId: updatedSession.patient,
      date: updatedSession.date,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      duration: updatedSession.duration,
      status: updatedSession.status,
      preDialysis: updatedSession.preDialysis,
      postDialysis: updatedSession.postDialysis,
      dialysisParameters: updatedSession.dialysisParameters,
      adequacyParameters: updatedSession.adequacyParameters,
      vascularAccess: updatedSession.vascularAccess,
      complications: updatedSession.complications,
      qualityIndicators: updatedSession.qualityIndicators,
      nurse: updatedSession.nurse,
      doctor: updatedSession.doctor,
      notes: updatedSession.notes,
      createdAt: updatedSession.createdAt,
      updatedAt: updatedSession.updatedAt
    };

    res.json({
      success: true,
      message: 'Dialysis session completed successfully',
      session: formattedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete dialysis session
// @route   DELETE /api/dialysis-sessions/:patientId/:id
// @access  Private (Doctor/Nurse)
router.delete('/:patientId/:id', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId, id } = req.params;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Find and delete session using sessionId
    const session = await DialysisSession.findOneAndDelete({ sessionId: id, patient: patient._id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Dialysis session not found'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Dialysis session deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get dialysis session statistics
// @route   GET /api/dialysis-sessions/stats/overview
// @access  Private
router.get('/stats/overview', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    let matchCondition = {};

    // Role-based filtering
    if (req.user.role === 'doctor') {
      const patients = await Patient.find({ assignedDoctor: req.user.id }).select('_id');
      const patientIds = patients.map(p => p._id);
      matchCondition.patient = { $in: patientIds };
    } else if (req.user.role === 'nurse') {
      matchCondition.nurse = req.user.id;
    }

    const totalSessions = await DialysisSession.countDocuments(matchCondition);
    const completedSessions = await DialysisSession.countDocuments({ 
      ...matchCondition, 
      status: 'COMPLETED' 
    });

    const sessionsByStatus = await DialysisSession.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average session metrics
    const avgMetrics = await DialysisSession.aggregate([
      { $match: { ...matchCondition, status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' },
          avgUfAchieved: { $avg: '$dialysisParameters.ufAchieved' },
          avgKtv: { $avg: '$adequacyParameters.ktv' },
          avgUrr: { $avg: '$adequacyParameters.urr' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        sessionsByStatus,
        averageMetrics: avgMetrics[0] || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

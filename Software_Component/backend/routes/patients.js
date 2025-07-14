const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const { protect, authorize, checkPatientAssignment } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Only allow doctor and nurse to view patient data
    if (req.user.role !== 'doctor' && req.user.role !== 'nurse') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only doctors and nurses can view patients'
      });
    }

    const query = {};

    const patients = await Patient.find(query)
      .select('id patientId name gender dateOfBirth bloodType contactNumber assignedDoctor')
      .populate('assignedDoctor', 'name')
      .populate('assignedNurse', 'name')
      .sort({ createdAt: -1 });

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      count: patients.length,
      total,
      patients
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
router.get('/:id', protect, checkPatientAssignment, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'name email phoneNumber specialization')
      .populate('assignedNurse', 'name email phoneNumber')
      .populate('notes.addedBy', 'name role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private/Nurse/Doctor/Admin
router.post('/', protect, authorize('nurse', 'doctor', 'admin'), [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('name').notEmpty().withMessage('Patient name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood type is required'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('assignedDoctor').isMongoId().withMessage('Valid assigned doctor is required'),
  body('medicalHistory.renalDiagnosis').notEmpty().withMessage('Renal diagnosis is required'),
  body('dialysisInfo.startDate').isISO8601().withMessage('Valid dialysis start date is required'),
  body('dialysisInfo.accessType').isIn(['AVF', 'AVG', 'CENTRAL_CATHETER', 'PERITONEAL_CATHETER']).withMessage('Valid access type is required'),
  body('dialysisInfo.dryWeight').isNumeric().withMessage('Valid dry weight is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if patient ID already exists
    const existingPatient = await Patient.findOne({ patientId: req.body.patientId });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID already exists'
      });
    }

    const patient = await Patient.create(req.body);

    await patient.populate('assignedDoctor', 'name email');
    if (patient.assignedNurse) {
      await patient.populate('assignedNurse', 'name email');
    }

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
router.put('/:id', protect, checkPatientAssignment, [
  body('name').optional().notEmpty().withMessage('Patient name cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('assignedDoctor', 'name email')
     .populate('assignedNurse', 'name email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Soft delete - change status to inactive
    patient.status = 'INACTIVE';
    await patient.save();

    res.json({
      success: true,
      message: 'Patient deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Add note to patient
// @route   POST /api/patients/:id/notes
// @access  Private
router.post('/:id/notes', protect, checkPatientAssignment, [
  body('content').notEmpty().withMessage('Note content is required'),
  body('type').optional().isIn(['GENERAL', 'MEDICAL', 'ADMINISTRATIVE']).withMessage('Invalid note type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const note = {
      content: req.body.content,
      type: req.body.type || 'GENERAL',
      addedBy: req.user.id,
      addedAt: new Date()
    };

    patient.notes.push(note);
    await patient.save();

    await patient.populate('notes.addedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      note: patient.notes[patient.notes.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get patient statistics
// @route   GET /api/patients/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    let matchCondition = {};

    // Role-based filtering
    if (req.user.role === 'doctor') {
      matchCondition.assignedDoctor = req.user.id;
    } else if (req.user.role === 'nurse') {
      matchCondition.assignedNurse = req.user.id;
    }

    const totalPatients = await Patient.countDocuments(matchCondition);
    const activePatients = await Patient.countDocuments({ ...matchCondition, status: 'ACTIVE' });
    
    const patientsByDialysisType = await Patient.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$dialysisInfo.dialysisType',
          count: { $sum: 1 }
        }
      }
    ]);

    const patientsByGender = await Patient.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const ageDistribution = await Patient.aggregate([
      { $match: matchCondition },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 30] }, then: 'Under 30' },
                { case: { $lt: ['$age', 50] }, then: '30-49' },
                { case: { $lt: ['$age', 70] }, then: '50-69' },
                { case: { $gte: ['$age', 70] }, then: '70+' }
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalPatients,
        activePatients,
        patientsByDialysisType,
        patientsByGender,
        ageDistribution
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

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
router.get('/search/query', protect, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let baseQuery = {};

    // Role-based filtering
    if (req.user.role === 'doctor') {
      baseQuery.assignedDoctor = req.user.id;
    } else if (req.user.role === 'nurse') {
      baseQuery.assignedNurse = req.user.id;
    }

    const patients = await Patient.find({
      ...baseQuery,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } },
        { 'medicalHistory.renalDiagnosis': { $regex: q, $options: 'i' } }
      ]
    })
    .select('patientId name age gender medicalHistory.renalDiagnosis status')
    .limit(20);

    res.json({
      success: true,
      count: patients.length,
      patients
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

const express = require('express');
const router = express.Router();
const MonthlyInvestigation = require('../models/MonthlyInvestigation');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     MonthlyInvestigation:
 *       type: object
 *       required:
 *         - patient
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the monthly investigation
 *         patientId:
 *           type: string
 *           description: The id of the patient
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the investigation
 *         scrPreHD:
 *           type: number
 *           description: SCR pre HD
 *         scrPostHD:
 *           type: number
 *           description: SCR post HD
 *         bu_pre_hd:
 *           type: number
 *           description: BU pre HD (Blood Urea pre-dialysis)
 *         bu_post_hd:
 *           type: number
 *           description: BU post HD (Blood Urea post-dialysis)
 *         hb:
 *           type: number
 *           description: Hemoglobin
 *         serumNaPreHD:
 *           type: number
 *           description: Serum Na Pre-HD
 *         serumNaPostHD:
 *           type: number
 *           description: Serum Na Post-HD
 *         serumKPreHD:
 *           type: number
 *           description: Serum K Pre-HD
 *         serumKPostHD:
 *           type: number
 *           description: Serum K Post-HD
 *         sCa:
 *           type: number
 *           description: S Ca (Serum Calcium)
 *         sPhosphate:
 *           type: number
 *           description: S Phosphate
 *         albumin:
 *           type: number
 *           description: Albumin
 *         ua:
 *           type: number
 *           description: UA (Uric Acid)
 *         hco:
 *           type: number
 *           description: HCO (Bicarbonate)
 *         al:
 *           type: number
 *           description: AL (Alkaline Phosphatase)
 *         hbA1C:
 *           type: number
 *           description: HbA1C
 *         pth:
 *           type: number
 *           description: PTH (Parathyroid Hormone)
 *         vitD:
 *           type: number
 *           description: Vit D (Vitamin D)
 *         serumIron:
 *           type: number
 *           description: Serum iron (umol/l)
 *         serumFerritin:
 *           type: number
 *           description: Serum ferritin (ng/ml)
 *         notes:
 *           type: string
 *           description: Additional notes about the investigation
 *         status:
 *           type: string
 *           description: Investigation status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @desc    Get all monthly investigations for a patient
 * @route   GET /api/monthly-investigations/:patientId
 * @access  Private
 */
router.get('/:patientId', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Build query
    const query = { patient: patient._id };
    
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

    // Get investigations with pagination
    const investigations = await MonthlyInvestigation.find(query)
      .populate('laboratoryInfo.requestedBy', 'name')
      .populate('laboratoryInfo.performedBy', 'name')
      .populate('laboratoryInfo.reportedBy', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MonthlyInvestigation.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Format response
    const formattedInvestigations = investigations.map(inv => ({
      id: inv._id,
      investigationId: inv.investigationId,
      patientId: inv.patient,
      date: inv.date,
      scrPreHD: inv.scrPreHD,
      scrPostHD: inv.scrPostHD,
      bu_pre_hd: inv.bu_pre_hd,
      bu_post_hd: inv.bu_post_hd,
      hb: inv.hb,
      serumNaPreHD: inv.serumNaPreHD,
      serumNaPostHD: inv.serumNaPostHD,
      serumKPreHD: inv.serumKPreHD,
      serumKPostHD: inv.serumKPostHD,
      sCa: inv.sCa,
      sPhosphate: inv.sPhosphate,
      albumin: inv.albumin,
      ua: inv.ua,
      hco: inv.hco,
      al: inv.al,
      hbA1C: inv.hbA1C,
      pth: inv.pth,
      vitD: inv.vitD,
      serumIron: inv.serumIron,
      serumFerritin: inv.serumFerritin,
      additionalTests: inv.additionalTests,
      laboratoryInfo: inv.laboratoryInfo,
      notes: inv.notes,
      status: inv.status,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt
    }));

    res.json({
      investigations: formattedInvestigations,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Create a new monthly investigation for a patient
 * @route   POST /api/monthly-investigations/:patientId
 * @access  Private (Doctor/Nurse)
 */
router.post('/:patientId', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Set patient ID and laboratory info
    const investigationData = {
      ...req.body,
      patient: patient._id,
      laboratoryInfo: {
        ...req.body.laboratoryInfo,
        requestedBy: req.user.id
      }
    };

    const investigation = new MonthlyInvestigation(investigationData);
    await investigation.save();

    // Populate the response
    const populatedInvestigation = await MonthlyInvestigation.findById(investigation._id)
      .populate('laboratoryInfo.requestedBy', 'name')
      .populate('laboratoryInfo.performedBy', 'name')
      .populate('laboratoryInfo.reportedBy', 'name');

    // Format response
    const formattedInvestigation = {
      id: populatedInvestigation._id,
      investigationId: populatedInvestigation.investigationId,
      patientId: populatedInvestigation.patient,
      date: populatedInvestigation.date,
      scrPreHD: populatedInvestigation.scrPreHD,
      scrPostHD: populatedInvestigation.scrPostHD,
      bu_pre_hd: populatedInvestigation.bu_pre_hd,
      bu_post_hd: populatedInvestigation.bu_post_hd,
      hb: populatedInvestigation.hb,
      serumNaPreHD: populatedInvestigation.serumNaPreHD,
      serumNaPostHD: populatedInvestigation.serumNaPostHD,
      serumKPreHD: populatedInvestigation.serumKPreHD,
      serumKPostHD: populatedInvestigation.serumKPostHD,
      sCa: populatedInvestigation.sCa,
      sPhosphate: populatedInvestigation.sPhosphate,
      albumin: populatedInvestigation.albumin,
      ua: populatedInvestigation.ua,
      hco: populatedInvestigation.hco,
      al: populatedInvestigation.al,
      hbA1C: populatedInvestigation.hbA1C,
      pth: populatedInvestigation.pth,
      vitD: populatedInvestigation.vitD,
      serumIron: populatedInvestigation.serumIron,
      serumFerritin: populatedInvestigation.serumFerritin,
      additionalTests: populatedInvestigation.additionalTests,
      laboratoryInfo: populatedInvestigation.laboratoryInfo,
      notes: populatedInvestigation.notes,
      status: populatedInvestigation.status,
      createdAt: populatedInvestigation.createdAt,
      updatedAt: populatedInvestigation.updatedAt
    };

    res.status(201).json(formattedInvestigation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @desc    Get a specific monthly investigation
 * @route   GET /api/monthly-investigations/:patientId/:id
 * @access  Private
 */
router.get('/:patientId/:id', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId, id } = req.params;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find investigation
    const investigation = await MonthlyInvestigation.findOne({ investigationId: id, patient: patient._id })
      .populate('laboratoryInfo.requestedBy', 'name')
      .populate('laboratoryInfo.performedBy', 'name')
      .populate('laboratoryInfo.reportedBy', 'name');

    if (!investigation) {
      return res.status(404).json({ message: 'Monthly investigation not found' });
    }

    // Format response
    const formattedInvestigation = {
      id: investigation._id,
      investigationId: investigation.investigationId,
      patientId: investigation.patient,
      date: investigation.date,
      scrPreHD: investigation.scrPreHD,
      scrPostHD: investigation.scrPostHD,
      bu_pre_hd: investigation.bu_pre_hd,
      bu_post_hd: investigation.bu_post_hd,
      hb: investigation.hb,
      serumNaPreHD: investigation.serumNaPreHD,
      serumNaPostHD: investigation.serumNaPostHD,
      serumKPreHD: investigation.serumKPreHD,
      serumKPostHD: investigation.serumKPostHD,
      sCa: investigation.sCa,
      sPhosphate: investigation.sPhosphate,
      albumin: investigation.albumin,
      ua: investigation.ua,
      hco: investigation.hco,
      al: investigation.al,
      hbA1C: investigation.hbA1C,
      pth: investigation.pth,
      vitD: investigation.vitD,
      serumIron: investigation.serumIron,
      serumFerritin: investigation.serumFerritin,
      additionalTests: investigation.additionalTests,
      laboratoryInfo: investigation.laboratoryInfo,
      notes: investigation.notes,
      status: investigation.status,
      createdAt: investigation.createdAt,
      updatedAt: investigation.updatedAt
    };

    res.json(formattedInvestigation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Update a monthly investigation
 * @route   PUT /api/monthly-investigations/:patientId/:id
 * @access  Private (Doctor/Nurse)
 */
router.put('/:patientId/:id', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId, id } = req.params;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find and update investigation
    const investigation = await MonthlyInvestigation.findOneAndUpdate(
      { investigationId: id, patient: patient._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('laboratoryInfo.requestedBy', 'name')
      .populate('laboratoryInfo.performedBy', 'name')
      .populate('laboratoryInfo.reportedBy', 'name');

    if (!investigation) {
      return res.status(404).json({ message: 'Monthly investigation not found' });
    }

    // Format response
    const formattedInvestigation = {
      id: investigation._id,
      investigationId: investigation.investigationId,
      patientId: investigation.patient,
      date: investigation.date,
      scrPreHD: investigation.scrPreHD,
      scrPostHD: investigation.scrPostHD,
      bu_pre_hd: investigation.bu_pre_hd,
      bu_post_hd: investigation.bu_post_hd,
      hb: investigation.hb,
      serumNaPreHD: investigation.serumNaPreHD,
      serumNaPostHD: investigation.serumNaPostHD,
      serumKPreHD: investigation.serumKPreHD,
      serumKPostHD: investigation.serumKPostHD,
      sCa: investigation.sCa,
      sPhosphate: investigation.sPhosphate,
      albumin: investigation.albumin,
      ua: investigation.ua,
      hco: investigation.hco,
      al: investigation.al,
      hbA1C: investigation.hbA1C,
      pth: investigation.pth,
      vitD: investigation.vitD,
      serumIron: investigation.serumIron,
      serumFerritin: investigation.serumFerritin,
      additionalTests: investigation.additionalTests,
      laboratoryInfo: investigation.laboratoryInfo,
      notes: investigation.notes,
      status: investigation.status,
      createdAt: investigation.createdAt,
      updatedAt: investigation.updatedAt
    };

    res.json(formattedInvestigation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @desc    Delete a monthly investigation
 * @route   DELETE /api/monthly-investigations/:patientId/:id
 * @access  Private (Doctor/Nurse)
 */
router.delete('/:patientId/:id', protect, authorize('doctor', 'nurse'), async (req, res) => {
  try {
    const { patientId, id } = req.params;

    // Verify patient exists using hospital patient ID
    const patient = await Patient.findOne({ patientId: patientId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find and delete investigation
    const investigation = await MonthlyInvestigation.findOneAndDelete({ investigationId: id, patient: patient._id });

    if (!investigation) {
      return res.status(404).json({ message: 'Monthly investigation not found' });
    }

    res.status(200).json({ message: 'Monthly investigation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

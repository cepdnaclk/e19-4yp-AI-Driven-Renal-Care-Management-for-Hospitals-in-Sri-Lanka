const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isValidPatientId } = require('../utils/validation');

// Middleware to check if user is authenticated and has appropriate role
const authenticateUser = (req, res, next) => {
  // For now, skip authentication - you can implement this later
  req.user = { role: 'doctor' }; // Mock user for testing
  next();
};

// Get Hemoglobin (Hb) trend analysis for a patient
router.get('/hb/:patientId', authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Validate patient ID format
    if (!isValidPatientId(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format. Expected format: RHD_THP_XXX'
      });
    }
    
    console.log(`📊 Fetching Hb trends for patient: ${patientId}`);
    
    // Get database connection
    const db = mongoose.connection.db;
    
    // Check if patient exists using direct database query
    const patientsCollection = db.collection('patients');
    const patient = await patientsCollection.findOne({ patientId: patientId });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    console.log(`✅ Patient found: ${patient.name}`);
    
    // Get monthly investigations data using direct database query
    const monthlyInvestigationsCollection = db.collection('monthlyinvestigations');
    
    // Find all Hb records for this patient, sorted by date
    const hbRecords = await monthlyInvestigationsCollection
      .find({
        patientId: patientId,
        'investigations.hb': { $exists: true, $ne: null }
      })
      .sort({ investigationDate: 1 })
      .toArray();
    
    console.log(`📋 Found ${hbRecords.length} Hb records for patient ${patientId}`);
    
    if (hbRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Hemoglobin data found for this patient'
      });
    }
    
    // Process the data for trend analysis
    const trendData = hbRecords.map(record => {
      const hbValue = record.investigations && record.investigations.hb 
        ? parseFloat(record.investigations.hb) 
        : null;
      
      return {
        date: record.investigationDate,
        value: hbValue,
        month: new Date(record.investigationDate).toISOString().substring(0, 7) // YYYY-MM format
      };
    }).filter(item => item.value !== null && !isNaN(item.value));
    
    if (trendData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid Hemoglobin values found for this patient'
      });
    }
    
    // Calculate trend statistics
    const values = trendData.map(item => item.value);
    const latest = values[values.length - 1];
    const earliest = values[0];
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate trend direction (comparing latest vs average)
    let trendDirection = 'stable';
    const threshold = 0.5; // 0.5 g/dL threshold for trend detection
    
    if (latest > average + threshold) {
      trendDirection = 'increasing';
    } else if (latest < average - threshold) {
      trendDirection = 'decreasing';
    }
    
    // Prepare response
    const response = {
      success: true,
      data: {
        patientId: patientId,
        patientName: patient.name,
        parameter: 'Hemoglobin (Hb)',
        unit: 'g/dL',
        recordCount: trendData.length,
        dateRange: {
          from: trendData[0].date,
          to: trendData[trendData.length - 1].date
        },
        statistics: {
          latest: latest,
          earliest: earliest,
          average: parseFloat(average.toFixed(2)),
          minimum: min,
          maximum: max,
          trend: trendDirection
        },
        trendData: trendData,
        clinicalInterpretation: {
          normalRange: '12.0-15.5 g/dL',
          currentStatus: latest < 12.0 ? 'Low' : latest > 15.5 ? 'High' : 'Normal',
          recommendations: latest < 12.0 
            ? ['Monitor closely', 'Consider iron supplementation', 'Evaluate for bleeding']
            : latest > 15.5 
            ? ['Monitor for polycythemia', 'Check EPO levels']
            : ['Continue current management']
        }
      }
    };
    
    console.log(`✅ Hb trend analysis completed for ${patientId}`);
    console.log(`   Latest value: ${latest} g/dL`);
    console.log(`   Trend: ${trendDirection}`);
    console.log(`   Records: ${trendData.length}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error in Hb trend analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching Hb trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint to check if the trends API is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Trends API is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/trends/hb/:patientId - Get Hemoglobin trend analysis'
    ]
  });
});

module.exports = router;

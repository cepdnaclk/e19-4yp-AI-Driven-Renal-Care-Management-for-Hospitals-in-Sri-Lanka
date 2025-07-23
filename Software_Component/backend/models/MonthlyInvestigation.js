const mongoose = require('mongoose');

const monthlyInvestigationSchema = new mongoose.Schema({
  investigationId: {
    type: String,
    required: false,
    uppercase: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Investigation date is required']
  },
  
  // Laboratory Parameters
  scrPreHD: {
    type: Number,
    min: 0,
    max: 20,
    required: false
  },
  scrPostHD: {
    type: Number,
    min: 0,
    max: 20,
    required: false
  },
  bu_pre_hd: {
    type: Number,
    min: 0,
    max: 200,
    required: false
  },
  bu_post_hd: {
    type: Number,
    min: 0,
    max: 200,
    required: false
  },
  hb: {
    type: Number,
    min: 0,
    max: 25,
    required: false
  },
  serumNaPreHD: {
    type: Number,
    min: 120,
    max: 160,
    required: false
  },
  serumNaPostHD: {
    type: Number,
    min: 120,
    max: 160,
    required: false
  },
  serumKPreHD: {
    type: Number,
    min: 2.0,
    max: 8.0,
    required: false
  },
  serumKPostHD: {
    type: Number,
    min: 2.0,
    max: 8.0,
    required: false
  },
  sCa: {
    type: Number,
    min: 5,
    max: 15,
    required: false
  },
  sPhosphate: {
    type: Number,
    min: 0,
    max: 10,
    required: false
  },
  albumin: {
    type: Number,
    min: 1.0,
    max: 6.0,
    required: false
  },
  ua: {
    type: Number,
    min: 0,
    max: 15,
    required: false
  },
  hco: {
    type: Number,
    min: 10,
    max: 35,
    required: false
  },
  al: {
    type: Number,
    min: 0,
    max: 500,
    required: false
  },
  hbA1C: {
    type: Number,
    min: 4.0,
    max: 15.0,
    required: false
  },
  pth: {
    type: Number,
    min: 0,
    max: 2000,
    required: false
  },
  vitD: {
    type: Number,
    min: 0,
    max: 200,
    required: false
  },
  serumIron: {
    type: Number,
    min: 0,
    max: 300,
    required: false
  },
  serumFerritin: {
    type: Number,
    min: 0,
    max: 5000,
    required: false
  },
  
  // Additional Tests (optional)
  additionalTests: [{
    testName: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    unit: String,
    normalRange: String,
    flag: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'LOW', 'CRITICAL']
    }
  }],
  
  // Laboratory Information
  laboratoryInfo: {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    testingMethod: String
  },
  
  // Notes and Comments
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Status
  status: {
    type: String,
    enum: ['ORDERED', 'COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
    default: 'ORDERED'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
monthlyInvestigationSchema.index({ patient: 1, investigationId: 1 }, { unique: true }); // Unique per patient
monthlyInvestigationSchema.index({ patient: 1 });
monthlyInvestigationSchema.index({ date: 1 });
monthlyInvestigationSchema.index({ 'laboratoryInfo.requestedBy': 1 });
monthlyInvestigationSchema.index({ status: 1 });
monthlyInvestigationSchema.index({ patient: 1, date: -1 });

// Generate investigation ID
monthlyInvestigationSchema.pre('save', async function(next) {
  if (!this.investigationId) {
    try {
      // Count existing investigations for this patient and add 1
      const investigationCount = await this.constructor.countDocuments({ patient: this.patient });
      this.investigationId = String(investigationCount + 1);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('MonthlyInvestigation', monthlyInvestigationSchema);

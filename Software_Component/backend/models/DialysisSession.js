const mongoose = require('mongoose');

const dialysisSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: false,
    uppercase: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  // Date of the HD session
  date: {
    type: Date,
    required: [true, 'Session date is required']
  },
  
  // Total duration of the HD session (in minutes)
  hdDuration: {
    type: Number,
    required: [true, 'HD duration is required'],
    min: 0
  },
  
  // Dry weight target decided by the consultant at the beginning of the HD therapy
  dryWeight: {
    type: Number,
    required: [true, 'Dry weight is required'],
    min: 0
  },
  
  // Dry weight before HD session
  preHDDryWeight: {
    type: Number,
    required: [true, 'Pre HD dry weight is required'],
    min: 0
  },
  
  // Dry weight after HD session
  postHDDryWeight: {
    type: Number,
    required: [true, 'Post HD dry weight is required'],
    min: 0
  },
  
  // Prescribed ultrafiltration
  puf: {
    type: Number,
    required: [true, 'Prescribed ultrafiltration (PUF) is required'],
    min: 0
  },
  
  // Achieved ultrafiltration
  auf: {
    type: Number,
    required: [true, 'Achieved ultrafiltration (AUF) is required'],
    min: 0
  },
  
  // Blood pressure at the last hour of the HD session (SYS/DYS)
  bloodPressure: {
    systolic: {
      type: Number,
      required: [true, 'Systolic blood pressure is required'],
      min: 50,
      max: 300
    },
    diastolic: {
      type: Number,
      required: [true, 'Diastolic blood pressure is required'],
      min: 30,
      max: 200
    }
  },
  
  // Blood flow rate at the last hour of the HD session
  bfr: {
    type: Number,
    required: [true, 'Blood flow rate (BFR) is required'],
    min: 0
  },
  
  // Transmembrane Pressure at the last hour of the HD session
  tmp: {
    type: Number,
    required: [true, 'Transmembrane pressure (TMP) is required'],
    min: 0
  },
  
  // Arterial pressure at the last hour of the HD session
  ap: {
    type: Number,
    required: [true, 'Arterial pressure (AP) is required'],
    //min: 0
  },
  
  // Venous Pressure at the last hour of the HD session
  vp: {
    type: Number,
    required: [true, 'Venous pressure (VP) is required'],
    min: 0
  },
  
  // Optional fields for additional information
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'TERMINATED'],
    default: 'SCHEDULED'
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
dialysisSessionSchema.index({ patient: 1, sessionId: 1 }, { unique: true }); // Unique per patient
dialysisSessionSchema.index({ patient: 1 });
dialysisSessionSchema.index({ date: 1 });
dialysisSessionSchema.index({ nurse: 1 });
dialysisSessionSchema.index({ doctor: 1 });
dialysisSessionSchema.index({ status: 1 });
dialysisSessionSchema.index({ patient: 1, date: -1 });

// Generate session ID if not provided
dialysisSessionSchema.pre('save', async function(next) {
  if (!this.sessionId) {
    try {
      // Count existing sessions for this patient and add 1
      const sessionCount = await this.constructor.countDocuments({ patient: this.patient });
      this.sessionId = String(sessionCount + 1);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('DialysisSession', dialysisSessionSchema);
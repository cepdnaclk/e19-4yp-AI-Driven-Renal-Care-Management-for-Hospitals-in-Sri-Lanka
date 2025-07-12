const mongoose = require('mongoose');

const medicalProblemSchema = new mongoose.Schema({
  problem: {
    type: String,
    required: true,
    trim: true
  },
  diagnosedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED', 'MANAGED'],
    default: 'ACTIVE'
  }
}, { _id: false });



const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  contactNumber: {
    type: String,
    required: false,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  emergencyContact: {
    name: {
      type: String,
      required: false
    },
    relationship: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    email: String
  },
  medicalHistory: {
    renalDiagnosis: {
      type: String,
      required: false,
      trim: true
    },

    medicalProblems: [medicalProblemSchema],
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['MILD', 'MODERATE', 'SEVERE'],
        default: 'MILD'
      },
      reaction: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      prescribedBy: String,
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['ACTIVE', 'DISCONTINUED', 'COMPLETED'],
        default: 'ACTIVE'
      }
    }]
  },
  
  dialysisInfo: {
    dialysisType: {
      type: String,
      enum: ['HEMODIALYSIS', 'PERITONEAL_DIALYSIS'],
      default: 'HEMODIALYSIS'
    },
    startDate: {
      type: Date,
      required: false
    },
    frequency: {
      type: String,
      enum: ['THRICE_WEEKLY', 'TWICE_WEEKLY', 'DAILY'],
      default: 'THRICE_WEEKLY'
    },
    accessType: {
      type: String,
      enum: ['AVF', 'AVG', 'CENTRAL_CATHETER', 'PERITONEAL_CATHETER'],
      required: false
    },
    accessSite: String,
    dryWeight: {
      type: Number,
      required: false,
      min: 0
    },
    targetUfr: {
      type: Number,
      min: 0
    }
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DISCHARGED', 'DECEASED'],
    default: 'ACTIVE'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['GENERAL', 'MEDICAL', 'ADMINISTRATIVE'],
      default: 'GENERAL'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for patient age
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
});

// Virtual for full address
patientSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Indexes for performance
patientSchema.index({ patientId: 1 });
patientSchema.index({ name: 1 });
patientSchema.index({ assignedDoctor: 1 });
patientSchema.index({ assignedNurse: 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ 'dialysisInfo.dialysisType': 1 });

// Update lastUpdated before saving
patientSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Patient', patientSchema);

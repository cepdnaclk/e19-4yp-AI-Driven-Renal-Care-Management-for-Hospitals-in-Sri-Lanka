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
    required: [true, 'Blood type is required']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
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
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String
  },
  medicalHistory: {
    renalDiagnosis: {
      type: String,
      required: true,
      trim: true
    },
    aetiology: {
      type: String,
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
  transplantInfo: {
    workUpStatus: {
      type: String,
      enum: ['NOT_EVALUATED', 'IN_PROGRESS', 'COMPLETED', 'CONTRAINDICATED'],
      default: 'NOT_EVALUATED'
    },
    transplantDate: Date,
    donorType: {
      type: String,
      enum: ['LIVING_RELATED', 'LIVING_UNRELATED', 'DECEASED', 'NONE'],
      default: 'NONE'
    },
    rejectionEpisodes: [{
      date: Date,
      severity: String,
      treatment: String,
      outcome: String
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
      required: true
    },
    frequency: {
      type: String,
      enum: ['THRICE_WEEKLY', 'TWICE_WEEKLY', 'DAILY'],
      default: 'THRICE_WEEKLY'
    },
    accessType: {
      type: String,
      enum: ['AVF', 'AVG', 'CENTRAL_CATHETER', 'PERITONEAL_CATHETER'],
      required: true
    },
    accessSite: String,
    dryWeight: {
      type: Number,
      required: true,
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
    required: true
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

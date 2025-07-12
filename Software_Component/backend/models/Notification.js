const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: false,
    unique: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS', 'REMINDER'],
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  category: {
    type: String,
    enum: [
      'PATIENT_ALERT',
      'SYSTEM_ALERT',
      'AI_PREDICTION',
      'LAB_RESULT',
      'MEDICATION_ALERT',
      'APPOINTMENT_REMINDER',
      'DIALYSIS_ALERT',
      'EQUIPMENT_ALERT',
      'ADMINISTRATIVE'
    ],
    required: true
  },
  
  // Recipients
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: Date,
    dismissed: {
      type: Boolean,
      default: false
    },
    dismissedAt: Date
  }],
  
  // Broadcast settings
  broadcast: {
    toBroadcast: {
      type: Boolean,
      default: false
    },
    toRoles: [{
      type: String,
      enum: ['nurse', 'doctor', 'admin']
    }],
    toDepartments: [String],
    toShifts: [{
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'NIGHT']
    }]
  },
  
  // Related entities
  relatedEntities: {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    dialysisSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DialysisSession'
    },
    monthlyInvestigation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthlyInvestigation'
    },
    clinicalDecision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClinicalDecision'
    },
    aiPrediction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIPrediction'
    }
  },
  
  // Notification content
  data: {
    actionRequired: {
      type: Boolean,
      default: false
    },
    actionType: {
      type: String,
      enum: ['REVIEW', 'APPROVE', 'CONTACT', 'SCHEDULE', 'INVESTIGATE', 'ESCALATE']
    },
    actionUrl: String,
    actionButton: String,
    
    // For critical alerts
    criticalInfo: {
      isCritical: {
        type: Boolean,
        default: false
      },
      escalationLevel: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
      },
      escalationPath: [String],
      maxEscalationTime: Number, // in minutes
      autoEscalate: {
        type: Boolean,
        default: false
      }
    },
    
    // For AI predictions
    aiPrediction: {
      confidence: {
        type: Number,
        min: 0,
        max: 100
      },
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      },
      recommendations: [String],
      dataPoints: [String]
    },
    
    // For lab results
    labResult: {
      parameter: String,
      value: mongoose.Schema.Types.Mixed,
      normalRange: String,
      flag: {
        type: String,
        enum: ['NORMAL', 'HIGH', 'LOW', 'CRITICAL']
      },
      previousValue: mongoose.Schema.Types.Mixed,
      trend: {
        type: String,
        enum: ['IMPROVING', 'STABLE', 'DETERIORATING']
      }
    },
    
    // For medication alerts
    medicationAlert: {
      medicationName: String,
      alertType: {
        type: String,
        enum: ['INTERACTION', 'ALLERGY', 'DOSE_ADJUSTMENT', 'DISCONTINUE', 'MONITORING']
      },
      severity: {
        type: String,
        enum: ['MINOR', 'MODERATE', 'MAJOR', 'CONTRAINDICATED']
      },
      description: String,
      recommendations: [String]
    },
    
    // For appointment reminders
    appointmentReminder: {
      appointmentDate: Date,
      appointmentType: String,
      provider: String,
      location: String,
      instructions: String
    }
  },
  
  // Delivery settings
  delivery: {
    channels: [{
      type: String,
      enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      deliveryAttempts: {
        type: Number,
        default: 0
      },
      lastAttempt: Date,
      failureReason: String
    }],
    
    // Scheduling
    scheduled: {
      type: Boolean,
      default: false
    },
    scheduledFor: Date,
    recurring: {
      type: Boolean,
      default: false
    },
    recurrencePattern: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
    },
    recurrenceEnd: Date,
    
    // Retry settings
    retrySettings: {
      maxRetries: {
        type: Number,
        default: 3
      },
      retryInterval: {
        type: Number,
        default: 15 // minutes
      },
      currentRetries: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Expiration
  expiration: {
    expiresAt: Date,
    autoExpire: {
      type: Boolean,
      default: true
    },
    expireAfter: {
      type: Number,
      default: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
  },
  
  // Tracking
  tracking: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    source: {
      type: String,
      enum: ['MANUAL', 'SYSTEM', 'AI', 'SCHEDULED', 'TRIGGER'],
      default: 'MANUAL'
    },
    trigger: {
      type: String,
      enum: ['THRESHOLD', 'RULE', 'SCHEDULE', 'EVENT', 'USER_ACTION']
    },
    parentNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    },
    childNotifications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'ACKNOWLEDGED', 'DISMISSED', 'EXPIRED', 'FAILED'],
    default: 'PENDING'
  },
  
  // Metrics
  metrics: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    readCount: {
      type: Number,
      default: 0
    },
    acknowledgedCount: {
      type: Number,
      default: 0
    },
    dismissedCount: {
      type: Number,
      default: 0
    },
    readRate: {
      type: Number,
      default: 0
    },
    acknowledgedRate: {
      type: Number,
      default: 0
    },
    averageResponseTime: Number, // in minutes
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Audit
  audit: {
    actions: [{
      action: {
        type: String,
        enum: ['CREATED', 'SENT', 'READ', 'ACKNOWLEDGED', 'DISMISSED', 'ESCALATED', 'EXPIRED']
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      performedAt: {
        type: Date,
        default: Date.now
      },
      details: String
    }],
    lastModified: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ 'recipients.user': 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ 'recipients.user': 1, 'recipients.read': 1 });
notificationSchema.index({ 'relatedEntities.patient': 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'expiration.expiresAt': 1 });

// Generate notification ID
notificationSchema.pre('save', function(next) {
  if (!this.notificationId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.notificationId = `N${dateStr}${random}`;
  }
  next();
});

// Update metrics before saving
notificationSchema.pre('save', function(next) {
  if (this.recipients && this.recipients.length > 0) {
    this.metrics.totalRecipients = this.recipients.length;
    this.metrics.readCount = this.recipients.filter(r => r.read).length;
    this.metrics.acknowledgedCount = this.recipients.filter(r => r.acknowledged).length;
    this.metrics.dismissedCount = this.recipients.filter(r => r.dismissed).length;
    
    this.metrics.readRate = this.metrics.totalRecipients > 0 
      ? (this.metrics.readCount / this.metrics.totalRecipients) * 100 
      : 0;
    
    this.metrics.acknowledgedRate = this.metrics.totalRecipients > 0 
      ? (this.metrics.acknowledgedCount / this.metrics.totalRecipients) * 100 
      : 0;
  }
  next();
});

// TTL index for auto-expiration
notificationSchema.index({ 'expiration.expiresAt': 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);

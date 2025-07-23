const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');
const DialysisSession = require('../models/DialysisSession');
const MonthlyInvestigation = require('../models/MonthlyInvestigation');
const ClinicalDecision = require('../models/ClinicalDecision');
const AIPrediction = require('../models/AIPrediction');
const Notification = require('../models/Notification');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/renal-care-db';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected successfully to: ${mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await DialysisSession.deleteMany({});
    await MonthlyInvestigation.deleteMany({});
    await ClinicalDecision.deleteMany({});
    await AIPrediction.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@renalcare.com',
      password: 'Admin123!',
      role: 'admin',
      isActive: true
    });
    await adminUser.save();

    // Create doctor users
    const doctor1 = new User({
      name: 'Dr. Samantha Perera',
      email: 'samantha@renalcare.com',
      password: 'Doctor123!',
      role: 'doctor',
      isActive: true,
      specialization: 'Nephrology',
      licenseNumber: 'SL-DOC-001'
    });
    await doctor1.save();

    const doctor2 = new User({
      name: 'Dr. Rajesh Fernando',
      email: 'rajesh@renalcare.com',
      password: 'Doctor123!',
      role: 'doctor',
      isActive: true,
      specialization: 'Nephrology',
      licenseNumber: 'SL-DOC-002'
    });
    await doctor2.save();

    // Create nurse users
    const nurse1 = new User({
      name: 'Nurse Priya Silva',
      email: 'priya@renalcare.com',
      password: 'Nurse123!',
      role: 'nurse',
      isActive: true,
      department: 'Dialysis Unit'
    });
    await nurse1.save();

    const nurse2 = new User({
      name: 'Nurse Kumari Jayasinghe',
      email: 'kumari@renalcare.com',
      password: 'Nurse123!',
      role: 'nurse',
      isActive: true,
      department: 'Dialysis Unit'
    });
    await nurse2.save();

    console.log('Created users');

    // Create patients
    const patients = [
      {
        name: 'Nimal Wijesekera',
        patientId: 'RHD_THP_001',
        dateOfBirth: new Date('1979-05-15'),
        gender: 'Male',
        contactNumber: '+94771234567',
        address: {
          street: '123 Galle Road',
          city: 'Colombo',
          state: 'Western Province',
          zipCode: '00300',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Kamala Wijesekera',
          phone: '+94777654321',
          relationship: 'spouse'
        },
        medicalHistory: {
          renalDiagnosis: 'Chronic Kidney Disease Stage 5',
          aetiology: 'Diabetic Nephropathy',
          medicalProblems: [
            { problem: 'Diabetes Mellitus', diagnosedDate: new Date('2015-01-01'), status: 'ACTIVE' },
            { problem: 'Hypertension', diagnosedDate: new Date('2016-03-15'), status: 'ACTIVE' }
          ]
        },
        dialysisInfo: {
          dialysisType: 'HEMODIALYSIS',
          startDate: new Date('2020-01-15'),
          frequency: 'THRICE_WEEKLY',
          accessType: 'AVF',
          accessSite: 'Left Radiocephalic',
          dryWeight: 68.5,
          targetUfr: 800
        },
        bloodType: 'O+',
        assignedDoctor: doctor1._id,
        status: 'ACTIVE'
      },
      {
        name: 'Kamala Senarath',
        patientId: 'RHD_THP_002',
        dateOfBirth: new Date('1972-08-22'),
        gender: 'Female',
        contactNumber: '+94712345678',
        address: {
          street: '456 Kandy Road',
          city: 'Kandy',
          state: 'Central Province',
          zipCode: '20000',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Bandula Senarath',
          phone: '+94778765432',
          relationship: 'spouse'
        },
        medicalHistory: {
          renalDiagnosis: 'End Stage Renal Disease',
          aetiology: 'Hypertensive Nephropathy',
          medicalProblems: [
            { problem: 'Hypertension', diagnosedDate: new Date('2010-05-01'), status: 'ACTIVE' },
            { problem: 'Anemia', diagnosedDate: new Date('2019-03-15'), status: 'ACTIVE' }
          ]
        },
        dialysisInfo: {
          dialysisType: 'HEMODIALYSIS',
          startDate: new Date('2019-06-01'),
          frequency: 'THRICE_WEEKLY',
          accessType: 'AVF',
          accessSite: 'Right Brachiocephalic',
          dryWeight: 55.0,
          targetUfr: 1000
        },
        bloodType: 'A+',
        assignedDoctor: doctor1._id,
        status: 'ACTIVE'
      },
      {
        name: 'Sunil Perera',
        patientId: 'RHD_THP_003',
        dateOfBirth: new Date('1986-12-10'),
        gender: 'Male',
        contactNumber: '+94723456789',
        address: {
          street: '789 Negombo Road',
          city: 'Negombo',
          state: 'Western Province',
          zipCode: '11500',
          country: 'Sri Lanka'
        },
        emergencyContact: {
          name: 'Manel Perera',
          phone: '+94789876543',
          relationship: 'spouse'
        },
        medicalHistory: {
          renalDiagnosis: 'Chronic Kidney Disease Stage 4',
          aetiology: 'Diabetic Nephropathy',
          medicalProblems: [
            { problem: 'Diabetes Mellitus', diagnosedDate: new Date('2020-01-01'), status: 'ACTIVE' }
          ]
        },
        dialysisInfo: {
          dialysisType: 'HEMODIALYSIS',
          startDate: new Date('2023-03-01'),
          frequency: 'THRICE_WEEKLY',
          accessType: 'CENTRAL_CATHETER',
          accessSite: 'Right Internal Jugular',
          dryWeight: 72.0,
          targetUfr: 1200
        },
        bloodType: 'B+',
        assignedDoctor: doctor2._id,
        status: 'ACTIVE'
      }
    ];

    const createdPatients = await Patient.insertMany(patients);
    console.log('Created patients');

    // Create dialysis sessions with simplified data
    const sessions = [];
    const currentDate = new Date();
    let sessionCounter = 1;
    
    for (let i = 0; i < 30; i++) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() - i);
      
      createdPatients.forEach((patient, index) => {
        if (i % 2 === index % 2) { // Alternate sessions for different patients
          const dryWeight = patient.dialysisInfo.dryWeight;
          const preWeight = dryWeight + 2 + Math.random() * 2; // 2-4 kg above dry weight
          const postWeight = dryWeight + Math.random() * 0.5; // Close to dry weight
          const prescribedUF = (preWeight - dryWeight) * 1000; // in ml
          const achievedUF = prescribedUF * (0.95 + Math.random() * 0.1); // 95-105% of prescribed
          
          sessions.push({
            patient: patient._id,
            date: sessionDate,
            
            // HD Session Parameters
            hdDuration: 240 + Math.random() * 60 - 30, // 210-270 minutes
            dryWeight: dryWeight,
            preHDDryWeight: preWeight,
            postHDDryWeight: postWeight,
            puf: prescribedUF, // Prescribed ultrafiltration in ml
            auf: achievedUF, // Achieved ultrafiltration in ml
            
            // Blood pressure at the last hour of HD session
            bloodPressure: {
              systolic: 120 + Math.random() * 30,
              diastolic: 80 + Math.random() * 15
            },
            
            // Session parameters at last hour
            bfr: 300 + Math.random() * 100, // Blood flow rate (ml/min)
            tmp: 100 + Math.random() * 150, // Transmembrane pressure (mmHg)
            ap: -200 + Math.random() * 100, // Arterial pressure (mmHg, negative)
            vp: 150 + Math.random() * 100, // Venous pressure (mmHg)
            
            // Staff and status
            nurse: nurse1._id,
            doctor: patient.assignedDoctor,
            status: Math.random() > 0.1 ? 'COMPLETED' : 'CANCELLED',
            
            notes: 'Routine dialysis session completed successfully'
          });
          
          sessionCounter++;
        }
      });
    }

    // Create sessions one by one to trigger pre-save hooks
    for (const sessionData of sessions) {
      const session = new DialysisSession(sessionData);
      await session.save();
    }
    console.log('Created dialysis sessions');

    // Create monthly investigations with simplified data
    const investigations = [];
    
    for (let i = 0; i < 12; i++) { // 12 months of data
      const investigationDate = new Date(currentDate);
      investigationDate.setMonth(investigationDate.getMonth() - i);
      
      createdPatients.forEach((patient, patientIndex) => {
        investigations.push({
          patient: patient._id,
          date: investigationDate,
          
          // Laboratory Parameters based on your requirements
          scrPreHD: 8 + Math.random() * 4, // SCR pre HD
          scrPostHD: 4 + Math.random() * 2, // SCR post HD  
          bu_pre_hd: 60 + Math.random() * 40, // BU pre HD (Blood Urea pre-dialysis)
          bu_post_hd: 30 + Math.random() * 20, // BU post HD (Blood Urea post-dialysis)
          hb: 9 + patientIndex + Math.random() * 3 - 1.5, // Hemoglobin
          serumNaPreHD: 138 + Math.random() * 6 - 3, // Serum Na Pre-HD
          serumNaPostHD: 140 + Math.random() * 4 - 2, // Serum Na Post-HD
          serumKPreHD: 4.5 + Math.random() * 1.5 - 0.75, // Serum K Pre-HD
          serumKPostHD: 3.5 + Math.random() * 1, // Serum K Post-HD
          sCa: 9.2 + Math.random() * 1.6 - 0.8, // S Ca (Serum Calcium)
          sPhosphate: 4.5 + Math.random() * 2, // S Phosphate
          albumin: 3.5 + Math.random() * 1, // Albumin
          ua: 6 + Math.random() * 3, // UA (Uric Acid)
          hco: 22 + Math.random() * 6 - 3, // HCO (Bicarbonate)
          al: 100 + Math.random() * 100, // AL (Alkaline Phosphatase)
          hbA1C: 6.5 + Math.random() * 2, // HbA1C
          pth: 300 + Math.random() * 500, // PTH (Parathyroid Hormone)
          vitD: 25 + Math.random() * 30, // Vit D (Vitamin D)
          serumIron: 80 + Math.random() * 60, // Serum iron (umol/l)
          serumFerritin: 200 + Math.random() * 300, // Serum ferritin (ng/ml)
          
          // Laboratory Information
          laboratoryInfo: {
            requestedBy: patient.assignedDoctor,
            performedBy: nurse1._id,
            reportedBy: patient.assignedDoctor,
            testingMethod: 'Automated Clinical Chemistry'
          },
          
          notes: `Monthly investigation for ${patient.name}. Patient stable with good compliance to treatment.`,
          status: 'COMPLETED'
        });
      });
    }

    // Create investigations one by one to trigger pre-save hooks
    for (const investigationData of investigations) {
      const investigation = new MonthlyInvestigation(investigationData);
      await investigation.save();
    }
    console.log('Created monthly investigations');

    // Create clinical decisions
    const decisions = [];
    let decisionCounter = 1;
    
    createdPatients.forEach(patient => {
      decisions.push({
        patient: patient._id,
        doctor: patient.assignedDoctor,
        date: new Date(),
        
        clinicalAssessment: {
          chiefComplaint: 'Routine dialysis follow-up',
          historyOfPresentIllness: 'Patient reports feeling well with good appetite and energy levels',
          physicalExamination: {
            generalAppearance: 'Well-appearing, no acute distress',
            vitalSigns: {
              bloodPressure: '140/90',
              heartRate: 78,
              temperature: 36.8,
              respiratoryRate: 18,
              oxygenSaturation: 98
            },
            cardiovascular: 'Regular rate and rhythm, no murmurs',
            vascularAccess: 'AVF with good thrill and bruit'
          }
        },
        
        diagnosis: {
          primary: 'ESRD on maintenance hemodialysis',
          secondary: ['Anemia of chronic kidney disease', 'Mineral bone disorder']
        },
        
        treatmentPlan: {
          medications: [
            {
              name: 'Erythropoietin',
              dosage: '4000 units',
              frequency: 'thrice weekly',
              route: 'PO',
              indication: 'Anemia management'
            }
          ],
          dialysisPrescription: {
            frequency: 'THRICE_WEEKLY',
            duration: 240,
            bloodFlowRate: 350,
            dialysateFlowRate: 600,
            ufGoal: 1.0,
            dryWeight: patient.dialysisInfo.dryWeight
          }
        },
        
        followUp: {
          nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          appointmentType: 'ROUTINE'
        },
        
        status: 'DRAFT',
        notes: 'Patient stable on current regimen'
      });
      
      decisionCounter++;
      
      decisions.push({
        patient: patient._id,
        doctor: patient.assignedDoctor,
        date: new Date(),
        
        clinicalAssessment: {
          chiefComplaint: 'Inadequate dialysis clearance',
          historyOfPresentIllness: 'Recent URR results below target of 65%'
        },
        
        diagnosis: {
          primary: 'Inadequate dialysis clearance',
          secondary: ['ESRD on maintenance hemodialysis']
        },
        
        treatmentPlan: {
          dialysisPrescription: {
            frequency: 'THRICE_WEEKLY',
            duration: 270, // Increased by 30 minutes
            bloodFlowRate: 400,
            dialysateFlowRate: 600,
            ufGoal: 1.0,
            dryWeight: patient.dialysisInfo.dryWeight
          }
        },
        
        followUp: {
          nextAppointment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          appointmentType: 'FOLLOW_UP'
        },
        
        status: 'APPROVED',
        notes: 'Dialysis time increased to improve clearance'
      });
      
      decisionCounter++;
    });

    // Create clinical decisions individually to trigger pre-save hooks
    for (const decisionData of decisions) {
      const decision = new ClinicalDecision(decisionData);
      await decision.save();
    }
    console.log('Created clinical decisions');

    // Create AI predictions
    const predictions = [];
    
    createdPatients.forEach(patient => {
      predictions.push({
        patient: patient._id,
        predictionType: 'HYPOTENSION_RISK',
        
        prediction: {
          outcome: 'High risk of hypotension during next dialysis session',
          probability: 75,
          confidence: 85,
          severity: 'HIGH',
          timeframe: 'HOURS'
        },
        
        model: {
          name: 'HypotensionPredictor',
          version: 'v1.0',
          type: 'XGBOOST',
          accuracy: 92
        },
        
        inputData: {
          clinicalParameters: {
            demographics: {
              age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
              gender: patient.gender,
              diabetic: patient.medicalHistory.medicalProblems.some(p => p.problem.includes('Diabetes')),
              hypertensive: patient.medicalHistory.medicalProblems.some(p => p.problem.includes('Hypertension'))
            },
            dialysisHistory: {
              vintageMonths: Math.floor((Date.now() - patient.dialysisInfo.startDate) / (1000 * 60 * 60 * 24 * 30)),
              accessType: patient.dialysisInfo.accessType,
              frequencyPerWeek: 3
            }
          }
        },
        
        recommendations: [
          {
            category: 'MONITORING',
            action: 'Monitor blood pressure every 15 minutes during dialysis',
            priority: 'HIGH',
            urgency: 'IMMEDIATE'
          },
          {
            category: 'DIALYSIS',
            action: 'Reduce ultrafiltration rate if blood pressure drops',
            priority: 'MEDIUM',
            urgency: 'WITHIN_HOURS'
          }
        ],
        
        status: 'GENERATED'
      });
      
      predictions.push({
        patient: patient._id,
        predictionType: 'ANEMIA_RISK',
        
        prediction: {
          outcome: 'Hemoglobin level likely to improve with current treatment',
          probability: 78,
          confidence: 88,
          severity: 'MODERATE',
          timeframe: 'WEEKS'
        },
        
        model: {
          name: 'AnemiaPredictor',
          version: 'v1.0',
          type: 'RANDOM_FOREST',
          accuracy: 88
        },
        
        inputData: {
          clinicalParameters: {
            demographics: {
              age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
              gender: patient.gender
            }
          }
        },
        
        recommendations: [
          {
            category: 'MEDICATION',
            action: 'Continue current EPO regimen',
            priority: 'MEDIUM',
            urgency: 'ROUTINE'
          }
        ],
        
        status: 'REVIEWED',
        workflow: {
          reviewedBy: patient.assignedDoctor,
          reviewedAt: new Date()
        }
      });
    });

    // Create AI predictions individually to trigger pre-save hooks
    for (const predictionData of predictions) {
      const prediction = new AIPrediction(predictionData);
      await prediction.save();
    }
    console.log('Created AI predictions');

    // Create notifications
    const notifications = [];
    
    [doctor1, doctor2].forEach(doctor => {
      notifications.push({
        title: 'Urgent Patient Review Required',
        message: 'Patient showing concerning lab results',
        type: 'WARNING',
        category: 'PATIENT_ALERT',
        priority: 'HIGH',
        recipients: [{
          user: doctor._id,
          read: false
        }]
      });
      
      notifications.push({
        title: 'AI Prediction Ready',
        message: 'New AI prediction available for validation',
        type: 'INFO',
        category: 'AI_PREDICTION',
        priority: 'MEDIUM',
        recipients: [{
          user: doctor._id,
          read: false
        }]
      });
    });

    [nurse1, nurse2].forEach(nurse => {
      notifications.push({
        title: 'Dialysis Session Reminder',
        message: 'Upcoming dialysis session in 30 minutes',
        type: 'REMINDER',
        category: 'DIALYSIS_ALERT',
        priority: 'HIGH',
        recipients: [{
          user: nurse._id,
          read: false
        }]
      });
    });

    // Create notifications individually to trigger pre-save hooks
    for (const notificationData of notifications) {
      const notification = new Notification(notificationData);
      await notification.save();
    }
    console.log('Created notifications');

    console.log('Database seeded successfully!');
    
    // Print login credentials
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@renalcare.com / Admin123!');
    console.log('Doctor 1: samantha@renalcare.com / Doctor123!');
    console.log('Doctor 2: rajesh@renalcare.com / Doctor123!');
    console.log('Nurse 1: priya@renalcare.com / Nurse123!');
    console.log('Nurse 2: kumari@renalcare.com / Nurse123!');
    console.log('========================\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

runSeed();

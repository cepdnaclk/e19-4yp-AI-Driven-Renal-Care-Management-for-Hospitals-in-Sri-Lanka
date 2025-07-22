// Role enum
export enum Role {
  NURSE = 'nurse',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Patient interface
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  contactNumber: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  assignedDoctor: string;
  registrationDate: string;
}

export interface PatientNew {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  contactNumber: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string;
  assignedDoctor: string;
  registrationDate: string;
}

export interface PatientCatalogue {
  id: string
  patientId: string
  name: string
  age?: number
  gender: string
  bloodType: string
  contactNumber: string
  assignedDoctor?: {
    name: string
  }
}

// Dialysis Session interface
export interface DialysisSession {
  id: string;
  sessionId: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  preDialysis: {
    weight: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
  };
  postDialysis: {
    weight: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
  };
  dialysisParameters: {
    ufGoal: number;
    ufAchieved: number;
    bloodFlow: number;
    dialysateFlow: number;
  };
  adequacyParameters: {
    ktv: number;
    urr: number;
  };
  vascularAccess: {
    type: string;
    site: string;
  };
  complications: string[];
  qualityIndicators: {
    sessionCompleted: boolean;
    prescriptionAchieved: boolean;
  };
  nurse: {
    _id: string;
    name: string;
    email: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Monthly Investigation interface
export interface MonthlyInvestigation {
  id: string;
  patientId: string;
  date: string;
  hemoglobin: number;
  hematocrit: number;
  whiteBloodCellCount: number;
  plateletCount: number;
  sodium: number;
  potassium: number;
  chloride: number;
  bicarbonate: number;
  bun: number;
  creatinine: number;
  glucose: number;
  calcium: number;
  phosphorus: number;
  albumin: number;
  totalProtein: number;
  alt: number;
  ast: number;
  alkalinePhosphatase: number;
  notes: string;
  nurseId: string;
}

// Clinical Decision interface
export interface ClinicalDecision {
  id: string;
  patientId: string;
  date: string;
  notes: string;
  prescription: string;
  followUpDate: string;
  doctorId: string;
  aiSuggestions: string[];
  aiSuggestionsAcknowledged: boolean;
  aiSuggestionsOverridden: boolean;
  aiOverrideReason?: string;
}

// Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'critical';
  relatedPatientId?: string;
}

// AI Prediction interface
export interface AIPrediction {
  id: string;
  patientId: string;
  date: string;
  predictionType: string;
  prediction: string;
  confidence: number;
  suggestedAction: string;
  dataPoints: any[];
}

// Trend Data interface
export interface TrendData {
  date: string;
  value: number;
}

// Trend Analysis interface
export interface TrendAnalysis {
  patientId: string;
  parameter: string;
  data: TrendData[];
  trend: 'increasing' | 'decreasing' | 'stable';
  normalRange?: {
    min: number;
    max: number;
  };
}

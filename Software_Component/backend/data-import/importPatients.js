const xlsx = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import models
const Patient = require('../models/Patient');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not Found');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Test the connection
    const db = mongoose.connection.db;
    await db.admin().ping();
    console.log('🏓 Database ping successful');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Please check:');
    console.error('   - MongoDB URI in .env file');
    console.error('   - Database server is running');
    console.error('   - Network connectivity');
    console.error('   - Authentication credentials');
    process.exit(1);
  }
};

// Function to parse date from various formats
const parseDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a number (Excel serial date), convert it
  if (typeof dateValue === 'number') {
    // Excel serial date starts from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    return date;
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    // First try DD/MM/YYYY format
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    // Try other common formats
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return null;
};

// Function to generate patient names based on Subject ID
const generatePatientName = (subjectId) => {
  const sriLankanFirstNames = [
    'Nimal', 'Kamala', 'Sunil', 'Malini', 'Ravi', 'Priya', 'Ajith', 'Sandya',
    'Chandra', 'Dilani', 'Rohan', 'Shirani', 'Upul', 'Niluka', 'Gayan', 'Thilaka'
  ];
  
  const sriLankanLastNames = [
    'Perera', 'Silva', 'Fernando', 'Jayasinghe', 'Rajapaksa', 'Wijesekera', 
    'Gunasekara', 'Senarath', 'Bandara', 'Mendis', 'Wickramasinghe', 'Gunawardana'
  ];
  
  const hash = subjectId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const firstName = sriLankanFirstNames[hash % sriLankanFirstNames.length];
  const lastName = sriLankanLastNames[(hash * 7) % sriLankanLastNames.length];
  
  return `${firstName} ${lastName}`;
};

// Function to map dialysis access types
const mapDialysisAccess = (accessType) => {
  if (!accessType) return null;
  
  const access = accessType.toLowerCase();
  if (access.includes('fistula') || access.includes('avf')) return 'AVF';
  if (access.includes('graft') || access.includes('avg')) return 'AVG';
  if (access.includes('catheter')) return 'CENTRAL_CATHETER';
  if (access.includes('peritoneal')) return 'PERITONEAL_CATHETER';
  
  return null; // Unknown access type
};

// Function to map gender
const mapGender = (sex) => {
  if (!sex) return null;
  
  const gender = sex.toLowerCase();
  if (gender === 'm' || gender === 'male') return 'Male';
  if (gender === 'f' || gender === 'female') return 'Female';
  
  return null;
};

// Function to import patient data from Excel using direct database operations
const importPatientData = async (filePath) => {
  try {
    console.log('📁 Reading Excel file:', filePath);
    
    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${jsonData.length} records in Excel file`);
    
    if (jsonData.length === 0) {
      console.log('⚠️  No data found in Excel file');
      return { total: 0, imported: 0, errors: 0, importedPatients: [], errorDetails: [] };
    }
    
    // Log available columns
    const columns = Object.keys(jsonData[0]);
    console.log('📋 Available columns:', columns);
    
    // Get database connection for direct operations
    const db = mongoose.connection.db;
    const patientsCollection = db.collection('patients');
    
    const importedPatients = [];
    const errors = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Extract data from Excel row
        const subjectId = row['Subject ID'];
        const dobValue = row['DOB'];
        const sex = row['Sex'];
        const primaryRenalDiagnosis = row['Primary renal diagnosis'];
        const dialysisAccess = row['Dialysis access'];
        
        // Skip if essential data is missing
        if (!subjectId) {
          errors.push(`Row ${i + 1}: Missing Subject ID`);
          continue;
        }
        
        // Parse date of birth
        const dateOfBirth = parseDate(dobValue);
        if (!dateOfBirth) {
          errors.push(`Row ${i + 1} (${subjectId}): Invalid or missing date of birth`);
          continue;
        }
        
        // Map gender
        const gender = mapGender(sex);
        if (!gender) {
          errors.push(`Row ${i + 1} (${subjectId}): Invalid or missing gender`);
          continue;
        }
        
        // Generate patient name
        const patientName = generatePatientName(subjectId);
        
        // Check if patient already exists using direct database query
        const existingPatient = await patientsCollection.findOne({ patientId: subjectId });
        
        if (existingPatient) {
          console.log(`⚠️  Patient ${subjectId} already exists, skipping...`);
          continue;
        }
        
        // Create patient document matching the schema exactly
        const patientDocument = {
          // Required fields
          patientId: subjectId,
          name: patientName,
          dateOfBirth: dateOfBirth,
          gender: gender,
          
          // Optional fields - set to null if not available
          bloodType: null,
          contactNumber: null,
          
          // Address object - all fields optional
          address: {
            street: null,
            city: null,
            state: null,
            zipCode: null,
            country: 'Sri Lanka' // Default value from schema
          },
          
          // Emergency contact - all fields optional
          emergencyContact: {
            name: null,
            relationship: null,
            phone: null,
            email: null
          },
          
          // Medical history
          medicalHistory: {
            renalDiagnosis: primaryRenalDiagnosis || null,
            medicalProblems: [],
            allergies: [],
            medications: []
          },
          
          // Dialysis info
          dialysisInfo: {
            dialysisType: 'HEMODIALYSIS', // Default value
            startDate: null,
            frequency: 'THRICE_WEEKLY', // Default value
            accessType: mapDialysisAccess(dialysisAccess),
            accessSite: null,
            dryWeight: null,
            targetUfr: null
          },
          
          // References - optional
          assignedDoctor: null,
          assignedNurse: null,
          
          // Status and dates
          status: 'ACTIVE', // Default value
          registrationDate: new Date(),
          lastUpdated: new Date(),
          
          // Notes array
          notes: [],
          
          // Timestamps (will be added by schema)
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert using direct database operation
        const result = await patientsCollection.insertOne(patientDocument);
        
        if (result.insertedId) {
          importedPatients.push({
            subjectId: subjectId,
            patientId: subjectId,
            name: patientName,
            status: 'imported'
          });
          
          console.log(`✅ Imported patient: ${subjectId} - ${patientName}`);
        } else {
          errors.push(`Row ${i + 1} (${subjectId}): Failed to insert into database`);
        }
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
        console.error(`❌ Error importing row ${i + 1}:`, error.message);
      }
    }
    
    // Summary report
    console.log('\n📈 Import Summary:');
    console.log(`Total records processed: ${jsonData.length}`);
    console.log(`Successfully imported: ${importedPatients.length}`);
    console.log(`Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return {
      total: jsonData.length,
      imported: importedPatients.length,
      errors: errors.length,
      importedPatients: importedPatients,
      errorDetails: errors
    };
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  }
};

// Main execution function
const main = async () => {
  try {
    console.log('🚀 Starting patient data import...');
    
    // Connect to database
    await connectDB();
    
    // Define Excel file path
    const excelFilePath = path.join(__dirname, 'patient-data.xlsx');
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(excelFilePath)) {
      console.error('❌ Excel file not found:', excelFilePath);
      console.error('💡 Please ensure the file "patient-data.xlsx" exists in the data-import folder');
      process.exit(1);
    }
    
    // Import data
    const result = await importPatientData(excelFilePath);
    
    console.log('\n🎉 Import completed successfully!');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
};

// Export functions for use in other scripts
module.exports = {
  importPatientData,
  parseDate,
  generatePatientName,
  mapDialysisAccess,
  mapGender,
  connectDB
};

// Run if called directly
if (require.main === module) {
  main();
}

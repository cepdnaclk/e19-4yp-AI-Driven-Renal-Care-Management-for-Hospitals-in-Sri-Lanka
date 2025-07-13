const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
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
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Test the direct database approach for trends
const testTrendsAPI = async () => {
  try {
    console.log('🚀 Testing Trends API with direct database operations...');
    
    // Connect to database
    await connectDB();
    
    // Get database connection
    const db = mongoose.connection.db;
    
    // Test 1: Check if we can access patients collection
    console.log('\n👤 Testing patient data access...');
    const patientsCollection = db.collection('patients');
    
    // Get all patient IDs
    const patients = await patientsCollection.find({}, { projection: { patientId: 1, name: 1 } }).toArray();
    console.log(`✅ Found ${patients.length} patients in database`);
    
    if (patients.length > 0) {
      console.log('📋 Sample patients:');
      patients.slice(0, 3).forEach(p => {
        console.log(`   - ${p.patientId}: ${p.name}`);
      });
    }
    
    // Test 2: Check monthly investigations data
    console.log('\n🧪 Testing monthly investigations data...');
    const monthlyInvestigationsCollection = db.collection('monthlyinvestigations');
    
    const investigationCount = await monthlyInvestigationsCollection.countDocuments();
    console.log(`✅ Found ${investigationCount} monthly investigation records`);
    
    // Get a sample investigation record
    const sampleInvestigation = await monthlyInvestigationsCollection.findOne({});
    if (sampleInvestigation) {
      console.log('📋 Sample investigation record:');
      console.log(`   Patient ID: ${sampleInvestigation.patientId}`);
      console.log(`   Date: ${sampleInvestigation.investigationDate}`);
      console.log(`   Investigations:`, Object.keys(sampleInvestigation.investigations || {}));
    }
    
    // Test 3: Test Hb data specifically
    console.log('\n🩸 Testing Hemoglobin data access...');
    
    // Find records with Hb data
    const hbRecords = await monthlyInvestigationsCollection
      .find({ 'investigations.hb': { $exists: true, $ne: null } })
      .limit(5)
      .toArray();
    
    console.log(`✅ Found ${hbRecords.length} records with Hb data`);
    
    if (hbRecords.length > 0) {
      console.log('📋 Sample Hb records:');
      hbRecords.forEach(record => {
        console.log(`   - ${record.patientId}: Hb = ${record.investigations.hb} g/dL (${record.investigationDate})`);
      });
      
      // Test 4: Simulate trend analysis for a specific patient
      console.log('\n📊 Testing trend analysis for a specific patient...');
      
      const testPatientId = hbRecords[0].patientId;
      console.log(`   Using patient: ${testPatientId}`);
      
      // Get all Hb records for this patient
      const patientHbRecords = await monthlyInvestigationsCollection
        .find({
          patientId: testPatientId,
          'investigations.hb': { $exists: true, $ne: null }
        })
        .sort({ investigationDate: 1 })
        .toArray();
      
      console.log(`✅ Found ${patientHbRecords.length} Hb records for ${testPatientId}`);
      
      if (patientHbRecords.length > 0) {
        const hbValues = patientHbRecords.map(r => parseFloat(r.investigations.hb));
        const average = hbValues.reduce((sum, val) => sum + val, 0) / hbValues.length;
        const latest = hbValues[hbValues.length - 1];
        const earliest = hbValues[0];
        
        console.log('📈 Trend Analysis Results:');
        console.log(`   Records: ${patientHbRecords.length}`);
        console.log(`   Latest: ${latest} g/dL`);
        console.log(`   Earliest: ${earliest} g/dL`);
        console.log(`   Average: ${average.toFixed(2)} g/dL`);
        console.log(`   Range: ${Math.min(...hbValues)} - ${Math.max(...hbValues)} g/dL`);
        
        // Check if patient exists
        const patient = await patientsCollection.findOne({ patientId: testPatientId });
        if (patient) {
          console.log(`   Patient: ${patient.name}`);
          console.log('✅ Complete trend analysis simulation successful!');
        }
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Trends API test failed:', error.message);
    console.error('🔍 Error details:', error);
    return false;
  }
};

// Main test function
const runTest = async () => {
  try {
    const result = await testTrendsAPI();
    
    if (result) {
      console.log('\n🎉 All tests passed!');
      console.log('💡 The trends API should work with direct database operations.');
      console.log('📋 Next steps:');
      console.log('   1. Replace the existing trends route with direct database operations');
      console.log('   2. Test the actual API endpoint');
      console.log('   3. The trends API should now work despite the Mongoose buffering issues');
    } else {
      console.log('\n❌ Tests failed. Please check the database connection and data structure.');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the test
if (require.main === module) {
  runTest();
}

module.exports = {
  testTrendsAPI,
  runTest
};

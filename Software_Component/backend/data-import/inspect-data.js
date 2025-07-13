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

// Inspect the actual data structure
const inspectData = async () => {
  try {
    console.log('🔍 Inspecting actual data structure...');
    
    // Connect to database
    await connectDB();
    
    // Get database connection
    const db = mongoose.connection.db;
    
    // Inspect patients collection
    console.log('\n👤 Inspecting patients collection...');
    const patientsCollection = db.collection('patients');
    
    const samplePatient = await patientsCollection.findOne({});
    if (samplePatient) {
      console.log('📋 Sample patient structure:');
      console.log(JSON.stringify(samplePatient, null, 2));
    }
    
    // Inspect monthly investigations collection
    console.log('\n🧪 Inspecting monthly investigations collection...');
    const monthlyInvestigationsCollection = db.collection('monthlyinvestigations');
    
    const sampleInvestigation = await monthlyInvestigationsCollection.findOne({});
    if (sampleInvestigation) {
      console.log('📋 Sample investigation structure:');
      console.log(JSON.stringify(sampleInvestigation, null, 2));
    }
    
    // Get all unique field names from investigations
    console.log('\n🔍 Getting all unique field names from investigations...');
    const allInvestigations = await monthlyInvestigationsCollection.find({}).limit(10).toArray();
    
    const allFields = new Set();
    allInvestigations.forEach(inv => {
      if (inv.investigations) {
        Object.keys(inv.investigations).forEach(key => allFields.add(key));
      }
      // Also check top-level fields
      Object.keys(inv).forEach(key => allFields.add(key));
    });
    
    console.log('📊 All unique fields found:');
    console.log(Array.from(allFields).sort());
    
    // Look for any field that might contain Hb data
    console.log('\n🩸 Looking for Hb-related fields...');
    const hbRelatedFields = Array.from(allFields).filter(field => 
      field.toLowerCase().includes('hb') || 
      field.toLowerCase().includes('hemoglobin') ||
      field.toLowerCase().includes('haemoglobin')
    );
    
    console.log('🔍 Hb-related fields found:', hbRelatedFields);
    
    // Look for investigation records with any blood-related parameters
    console.log('\n🔬 Looking for any blood parameter data...');
    const bloodParams = ['hb', 'hemoglobin', 'haemoglobin', 'creatinine', 'urea', 'potassium', 'sodium'];
    
    for (const param of bloodParams) {
      const count = await monthlyInvestigationsCollection.countDocuments({
        [`investigations.${param}`]: { $exists: true }
      });
      if (count > 0) {
        console.log(`   ${param}: ${count} records`);
      }
    }
    
    // Check if data is stored in a different format
    console.log('\n📊 Checking for data in different formats...');
    
    // Check if there are any non-null investigation values
    const investigationsWithData = await monthlyInvestigationsCollection.find({
      investigations: { $ne: null, $exists: true }
    }).limit(5).toArray();
    
    console.log(`📋 Found ${investigationsWithData.length} records with investigations data`);
    
    investigationsWithData.forEach((inv, index) => {
      console.log(`   Record ${index + 1}:`, inv.investigations);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Data inspection failed:', error.message);
    console.error('🔍 Error details:', error);
    return false;
  }
};

// Main function
const runInspection = async () => {
  try {
    const result = await inspectData();
    
    if (result) {
      console.log('\n🎉 Data inspection completed!');
      console.log('💡 Use the above information to understand the actual data structure.');
    } else {
      console.log('\n❌ Data inspection failed.');
    }
    
  } catch (error) {
    console.error('❌ Inspection execution failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the inspection
if (require.main === module) {
  runInspection();
}

module.exports = {
  inspectData,
  runInspection
};

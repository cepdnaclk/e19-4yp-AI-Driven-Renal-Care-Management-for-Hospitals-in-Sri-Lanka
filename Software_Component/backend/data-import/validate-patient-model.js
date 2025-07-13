const mongoose = require('mongoose');

// Import the Patient model to check for issues
const Patient = require('../models/Patient');

// Function to validate the Patient model
const validatePatientModel = () => {
  console.log('🔍 Validating Patient model...');
  
  const schema = Patient.schema;
  const paths = schema.paths;
  const indexes = schema.indexes();
  
  console.log('\n📋 Model Analysis:');
  
  // Check required fields
  console.log('\n✅ Required fields:');
  const requiredFields = [];
  Object.keys(paths).forEach(path => {
    if (paths[path].isRequired) {
      requiredFields.push(path);
    }
  });
  console.log(requiredFields.length ? requiredFields : 'None explicitly required');
  
  // Check indexes
  console.log('\n📊 Indexes:');
  indexes.forEach((index, i) => {
    console.log(`   ${i + 1}. ${JSON.stringify(index[0])} - ${JSON.stringify(index[1] || {})}`);
  });
  
  // Check for potential issues
  console.log('\n🔍 Potential Issues:');
  
  // Issue 1: Missing 'aetiology' field but it might be referenced elsewhere
  if (!paths['medicalHistory.aetiology']) {
    console.log('⚠️  Missing medicalHistory.aetiology field (might be referenced in other parts)');
  }
  
  // Issue 2: Missing 'transplantInfo' field entirely
  if (!paths['transplantInfo']) {
    console.log('⚠️  Missing transplantInfo field (might be referenced in other parts)');
  }
  
  // Issue 3: Check if accessType is required but dialysisInfo might not exist
  if (paths['dialysisInfo.accessType'] && paths['dialysisInfo.accessType'].isRequired) {
    console.log('⚠️  dialysisInfo.accessType is required, but dialysisInfo itself might not be required');
  }
  
  // Issue 4: Check indexes on optional fields
  const indexWarnings = [];
  indexes.forEach(index => {
    const indexPath = Object.keys(index[0])[0];
    if (indexPath && paths[indexPath] && !paths[indexPath].isRequired) {
      indexWarnings.push(`Index on optional field: ${indexPath}`);
    }
  });
  
  if (indexWarnings.length > 0) {
    console.log('ℹ️  Indexes on optional fields (this is okay):');
    indexWarnings.forEach(warning => console.log(`     - ${warning}`));
  }
  
  // Issue 5: Check for any undefined references
  console.log('\n🔍 Checking for undefined field references...');
  
  const allFieldPaths = Object.keys(paths);
  console.log(`📊 Total fields defined: ${allFieldPaths.length}`);
  
  // Check if all indexed fields exist
  console.log('\n✅ Index validation:');
  let indexIssues = 0;
  
  indexes.forEach((index, i) => {
    const indexPath = Object.keys(index[0])[0];
    if (indexPath && !paths[indexPath]) {
      console.log(`❌ Index ${i + 1} references undefined field: ${indexPath}`);
      indexIssues++;
    } else {
      console.log(`✅ Index ${i + 1} on ${indexPath}: Valid`);
    }
  });
  
  if (indexIssues === 0) {
    console.log('🎉 All indexes are valid!');
  }
  
  return indexIssues === 0;
};

// Function to test creating a minimal patient
const testMinimalPatient = async () => {
  console.log('\n🧪 Testing minimal patient creation...');
  
  try {
    // Create a minimal patient with only required fields
    const minimalPatient = new Patient({
      patientId: 'TEST_MINIMAL_001',
      name: 'Test Minimal Patient',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Male',
      dialysisInfo: {
        accessType: 'AVF'  // This is still required
      }
    });
    
    // Validate the model (don't save to avoid database issues)
    const validationError = minimalPatient.validateSync();
    
    if (validationError) {
      console.log('❌ Validation failed:');
      Object.keys(validationError.errors).forEach(field => {
        console.log(`   - ${field}: ${validationError.errors[field].message}`);
      });
      return false;
    } else {
      console.log('✅ Minimal patient validation passed');
      console.log('📋 Patient data:');
      console.log(`   ID: ${minimalPatient.patientId}`);
      console.log(`   Name: ${minimalPatient.name}`);
      console.log(`   DOB: ${minimalPatient.dateOfBirth}`);
      console.log(`   Gender: ${minimalPatient.gender}`);
      console.log(`   Access Type: ${minimalPatient.dialysisInfo.accessType}`);
      return true;
    }
    
  } catch (error) {
    console.log('❌ Error creating minimal patient:', error.message);
    return false;
  }
};

// Main validation function
const runValidation = async () => {
  try {
    console.log('🚀 Starting Patient model validation...');
    
    // Validate model structure
    const modelValid = validatePatientModel();
    
    // Test minimal patient creation
    const testValid = await testMinimalPatient();
    
    // Summary
    console.log('\n📈 Validation Summary:');
    console.log(`   Model structure: ${modelValid ? '✅ Valid' : '❌ Issues found'}`);
    console.log(`   Minimal patient test: ${testValid ? '✅ Passed' : '❌ Failed'}`);
    
    if (modelValid && testValid) {
      console.log('\n🎉 Patient model is valid and ready to use!');
    } else {
      console.log('\n⚠️  Patient model has some issues that should be addressed.');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
};

// Run the validation
if (require.main === module) {
  runValidation();
}

module.exports = {
  validatePatientModel,
  testMinimalPatient,
  runValidation
};

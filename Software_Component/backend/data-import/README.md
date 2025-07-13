# Data Import Scripts

This folder contains scripts for importing data from Excel files into the database.

## Files

- `importPatients.js` - Script to import patient data from Excel files
- `package.json` - Dependencies for data import scripts
- `patient-data.xlsx` - Place your Excel file here

## Setup

1. Install dependencies:
```bash
npm install
```

2. Place your Excel file in this folder and name it `patient-data.xlsx`

3. Make sure your `.env` file is properly configured with MongoDB connection string

## Usage

### Import Patient Data

```bash
node importPatients.js
```

## Excel File Format

The Excel file should have the following columns:
- `Subject ID` - Unique identifier (e.g., RHD_THP_001)
- `DOB` - Date of Birth in DD/MM/YYYY format
- `Sex` - Gender (M/F)
- `Primary renal diagnosis` - Primary renal condition
- `Dialysis access` - Type of dialysis access

## Generated Data

The script will generate the following data for each patient:
- `patientId` - Keeps original format as RHD_THP_XXX
- `firstName` and `lastName` - Generated based on Subject ID
- `phone` and `email` - Random generated
- `address` - Default Sri Lankan address
- `assignedDoctor` - First available doctor in database

## Error Handling

The script will:
- Skip rows with missing essential data
- Report invalid date formats
- Avoid duplicate imports
- Provide detailed error reporting

## Output

The script provides:
- Real-time progress updates
- Import summary with counts
- List of imported patients
- Error details for failed imports

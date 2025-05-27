

import pandas as pd

# Load the Excel file
file_path = "AI in Renal Care_13_05_2025_Anzed.xlsx"  # Replace with your actual file path
xls = pd.ExcelFile(file_path)
df = xls.parse('HD sessions 2024')  # Adjust if the sheet name is different


records = []
current_session = None

# Iterate through rows
for _, row in df.iterrows():
    session_marker = row[0]
    param_name = row[1]

    # If this row starts a new session
    if isinstance(session_marker, str) and session_marker.strip().lower().startswith("session"):
        current_session = session_marker  # Set session number
        # still process this row (do NOT continue)
    
    # Skip if no parameter name
    if pd.isna(param_name):
        continue

    # Record values for all subjects
    for col_idx in range(2, len(row)):
        subject_id = df.columns[col_idx]
        value = row[col_idx]

        if pd.notna(value):
            records.append({
                "Subject_ID": subject_id,
                "Session_No": current_session,
                "Parameter": param_name,
                "Value": value
            })

# Convert to DataFrame
long_df = pd.DataFrame(records)

# Pivot into wide format
wide_df = long_df.pivot_table(
    index=["Subject_ID", "Session_No"],
    columns="Parameter",
    values="Value",
    aggfunc="first"
).reset_index()

# Move 'Date' if present
if "Date" in wide_df.columns:
    wide_df["Date"] = pd.to_datetime(wide_df["Date"], dayfirst=True, errors='coerce')

    cols = list(wide_df.columns)
    cols.insert(2, cols.pop(cols.index("Date")))
    wide_df = wide_df[cols]

# Ensure 'BP (mmHg)' exists
if "BP (mmHg)" in wide_df.columns:
    # Fix: Use proper named groups
    bp_split = wide_df["BP (mmHg)"].astype(str).str.extract(r'(?P<SYS>[0-9]+)\/(?P<DIA>[0-9]+)')

    # Convert to numeric (optional but recommended)
    wide_df["SYS (mmHg)"] = pd.to_numeric(bp_split["SYS"], errors="coerce")
    wide_df["DIA (mmHg)"] = pd.to_numeric(bp_split["DIA"], errors="coerce")

    # Optional: Drop the original BP column
    # wide_df.drop(columns=["BP (mmHg)"], inplace=True)

# Save result
output_path = "restructured_dialysis_sessions_with_date.xlsx"
wide_df.to_excel(output_path, index=False)
print(f"✅ Saved: {output_path}")

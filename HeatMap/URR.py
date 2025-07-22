import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

# Load the Excel file
try:
    df = pd.read_excel('cleaned_monthly_investigations_alive.xlsx', sheet_name='Sheet1')
except FileNotFoundError:
    print("Error: 'cleaned_monthly_investigations.xlsx' not found in the working directory.")
    exit(1)

# Calculate URR: ((BU pre HD - BU post HD) × 100) / BU pre HD
df['URR (%)'] = ((df['BU - pre HD'] - df['BU - post HD']) * 100) / df['BU - pre HD']

# save the URR data to a new Excel file
df.to_excel('urr_data.xlsx', index=False)

# Ensure 'Month' is in datetime format and extract month-year for columns
df['Month'] = pd.to_datetime(df['Month'])
df['Month-Year'] = df['Month'].dt.strftime('%Y-%m')

# Pivot the URR data to create a patient vs. month matrix
pivot_df = df.pivot(index='Subject_ID', columns='Month-Year', values='URR (%)')

# Define risk threshold
risk_threshold = 65.0

# Create a custom colormap: red for <65%, green for ≥65%
colors = ['red', 'lightgreen']
n_bins = 100
cmap = sns.blend_palette(colors, n_colors=n_bins)

# Function to annotate values <65% in red
def annotate_heatmap(data, **kwargs):
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            value = data.iloc[i, j]
            if pd.notnull(value):
                color = 'white' if value < risk_threshold else 'black'
                plt.text(j + 0.5, i + 0.5, f'{value:.1f}',
                         ha='center', va='center', color=color)

# Create the heatmap
plt.figure(figsize=(12, 10))
sns.heatmap(pivot_df, cmap=cmap, center=risk_threshold,
            annot=False, fmt='.1f', cbar_kws={'label': 'URR (%)'},
            vmin=0, vmax=100)  # Set min/max for colormap scaling
plt.gca().collections[0].colorbar.set_label('URR (%)', size=12)

# Apply custom annotations
annotate_heatmap(pivot_df)

# Customize plot
plt.title('Urea Reduction Ratio (URR) by Patient and Month', fontsize=14)
plt.xlabel('Month', fontsize=12)
plt.ylabel('Patient ID', fontsize=12)
plt.xticks(rotation=45, ha='right')
plt.tight_layout()

# Calculate percentage of values below risk threshold (<65%)
total_values = pivot_df.size
below_risk = pivot_df[pivot_df < risk_threshold].count().sum()
percentage_below = (below_risk / total_values) * 100
print(f"Percentage of URR values below 65%: {percentage_below:.2f}%")

# Save and show the plot
plt.savefig('urr_heatmap.png', dpi=300, bbox_inches='tight')
plt.show()
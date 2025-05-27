import pandas as pd

# Load your table (assuming you have loaded it as df from Excel or manually)
# Example: df = pd.read_excel("investigations.xlsx")
df= pd.read_excel("AI in Renal Care_13_05_2025_Anzed.xlsx", sheet_name="Monthly Investigations 2024")

print(df.shape)


df.columns = df.columns.str.strip()  # Remove leading/trailing spaces

df['Month'] = df['Month'].ffill()

#convert the Month column to datetime
df['Month'] = pd.to_datetime(df['Month'], format='%b-%y')

#show first 50 rows
print(df)


# Step 1: Melt the dataframe into long format
df_long = df.melt(id_vars=['Month', 'blood'], var_name='Subject_ID', value_name='Value')

#print(df_long.head(50))

# Step 2: Pivot to wide format
df_wide = df_long.pivot(index=['Subject_ID', 'Month'], columns='blood', values='Value')



# Step 3: Flatten the MultiIndex columns (optional but good practice)
df_wide.columns.name = None
df_wide = df_wide.reset_index()

print(df_wide.columns.tolist())
print(df_wide.head(100))

#save the wide format dataframe to a csv file
df_wide.to_csv("wide_format_investigations.csv", index=False)

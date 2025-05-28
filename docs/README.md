---
layout: home
permalink: index.html

# Please update this with your repository name and title
repository-name: eYY-4yp-project-template
title:
---

# Project Title

#### Team

- E/19/095, E.M.L.K. Edirisinghe, [email](mailto:e19095@eng.pdn.ac.lk)
- E/19/170, K.N.N. Jayawardhana, [email](mailto:e19170@eng.pdn.ac.lk)
- E/19/306, M.M.P.N. Rajakaruna, [email](mailto:e19306@eng.pdn.ac.lk)

#### Supervisors

- Dr. Upul Jayasinghe

#### Table of contents

1. [Abstract](#abstract)
2. [Related works](#related-works)
3. [Methodology](#methodology)
4. [Experiment Setup and Implementation](#experiment-setup-and-implementation)
5. [Results and Analysis](#results-and-analysis)
7. [Conclusion](#conclusion)
8. [Publications](#publications)
9. [Links](#links)

---

## Abstract
<p> Chronic Kidney Disease (CKD) is a growing health burden, with hemodialysis being a critical intervention for patients with end-stage renal disease. Effective management of hemodialysis patients requires continuous monitoring to address complications such as acute kidney injury, hypotension, arteriovenous (AV) fistula obstruction, infections, and cardiovascular stress. A comprehensive approach is essential, including personalized treatments such as anemia management, strict control of comorbid conditions like intradialytic hypotension and diabetes, and pharmacological optimization, including the precise dosing of erythropoiesis-stimulating agents (ESAs). Additionally, lifestyle modifications play a crucial role in improving patient status. </p>

<p> This project aims to develop an <b>AI-powered patient management system for the Renal Care Unit at Teaching Hospital Peradeniya. </b> By integrating AI and ML, the system will enable real-time monitoring, predictive analytics, and clinical decision support, enhancing treatment outcomes. Furthermore, the system will include software for recording medical parameters such as lab reports and hemodialysis-specific data. This digital approach will reduce paper usage in the ward and facilitate easy access to patient data, improving overall efficiency in patient management. </p>

<img src='https://github.com/user-attachments/assets/dc5b1669-8d62-49a1-b514-16a9689174b2' width=300 />
<p><i>Figure 1.1: Chronic kidney disease (CKD) prevalence rates across the most affected districts in Sri Lanka, 2009–2016. <a href='https://doi.org/10.1016/j.scitotenv.2019.133767'>https://doi.org/10.1016/j.scitotenv.2019.133767</a></i></p>

## Related works
- Project Proposal: https://drive.google.com/file/d/1mGDrJs-V_gSJg8q4qCwjG41z0nMPyLlk/view?usp=sharing
- Literature Review: https://drive.google.com/file/d/1lSuoPDBZSQUCuIswwqZkcL0fXzvE-obs/view?usp=sharing
- 
## Methodology
## Methodology

### a) System Overview

The proposed system is an **AI-driven expert system** developed to assist clinicians in the real-time monitoring, diagnosis, and personalized treatment of hemodialysis patients at the Renal Care Unit of Teaching Hospital Peradeniya. The architecture of the system consists of several core components:

- **Data Integration Layer**  
  Aggregates and pre-processes patient data from multiple sources including Electronic Health Records (EHRs), dialysis machine logs, laboratory reports, and demographic records.

- **Machine Learning Engine**  
  Implements multiple supervised learning models including:
  - Random Forest (RF)
  - XGBoost (XGB)
  - Support Vector Machine (SVM)
  - Artificial Neural Network (ANN)  
  An ensemble method may be adopted to combine the strengths of individual models.

- **Inference Engine**  
  Applies trained ML models to new data in real time, identifying early warning signs of complications (e.g., anemia, intradialytic hypotension) and recommending appropriate interventions.

- **Knowledge Base**  
  Contains curated clinical guidelines, historical patient records, and best practices specific to dialysis care.

- **User Interface**  
  Built with **React.js**, providing an intuitive dashboard for clinicians to:
  - Input patient data
  - View alerts and predictions
  - Receive personalized treatment suggestions

- **Backend Services**  
  Powered by **FastAPI** and **Express.js**, enabling efficient API handling, data validation, and real-time ML model inference.

- **MLOps Pipeline**  
  Includes Continuous Integration and Continuous Deployment (CI/CD) processes to support regular model retraining and updates using real-world streaming data.

---

### b) Experiment Setup and Implementation

#### Phase 1: Data Collection and Preprocessing

- **Study Setting**: Renal Care Unit, Teaching Hospital, Peradeniya
- **Inclusion Criteria**:
  - Adults (>18 years) undergoing regular hemodialysis
- **Exclusion Criteria**:
  - Pregnant/lactating women
  - Patients scheduled for renal transplant
- **Data Types**:
  - *Demographics*: Age, sex, address, income, education
  - *Clinical Vitals*: Blood pressure, heart rate, oxygen saturation, weight
  - *Lab Results*: Hemoglobin, creatinine, sodium, potassium, iron studies
  - *Dialysis Metrics*: Access flow rate, transmembrane pressure, KT/V
  - *Derived Values*: BMI, dry weight, urea reduction ratio
- **Data Handling**:
  - Manually extracted and digitized into structured formats (e.g., CSV, SQL)
  - Handled missing values, normalized continuous features, and encoded categorical data

#### Phase 2: Model Training and Evaluation

- **Data Split**: 80% for training, 20% for validation
- **Models Evaluated**:
  - Random Forest (robust and interpretable)
  - XGBoost (high performance on tabular data)
  - SVM (for binary classification tasks)
  - ANN (for modeling complex nonlinearities)
- **Evaluation Metrics**:
  - Accuracy
  - ROC-AUC
  - Precision & Recall
  - F1 Score
  - Sensitivity & Specificity
- **Libraries & Tools**:
  - Python, TensorFlow, Scikit-learn, Keras, XGBoost

#### Phase 3: System Development

- **Expert System**:
  - Integrated the selected ML model into a logic-based inference engine
  - Mapped clinical rules and alert thresholds into the knowledge base
- **Frontend**: Developed with React.js, includes dashboards, alerts, and patient data visualization
- **Backend**: APIs built with FastAPI and Express.js to handle inference and data communication
- **Database**: MySQL is used for storing structured patient records

#### Phase 4: Pilot Deployment and Feedback

- **Deployment Location**: Renal Care Unit servers or cloud (subject to privacy compliance)
- **Training Sessions**: Conducted with doctors, nurses, and IT staff
- **Pilot Study**: Run in a controlled clinical setting with real-time monitoring
- **Feedback Mechanism**:
  - Structured interviews and surveys
  - Evaluation based on usability, interpretability, system impact, and workflow integration


## Experiment Setup and Implementation
<img src='https://github.com/user-attachments/assets/99f30d88-679e-40b2-a729-e8c329afb1cc' />
<img src='https://github.com/user-attachments/assets/a792e6e1-ff8e-4d22-814d-e029bab5431b' />
<img src='https://github.com/user-attachments/assets/e834e6f7-88a8-4ece-84c6-100670d43595' />

## Results and Analysis

## Conclusion

## Publications
[//]: # "Note: Uncomment each once you uploaded the files to the repository"

<!-- 1. [Semester 7 report](./) -->
<!-- 2. [Semester 7 slides](./) -->
<!-- 3. [Semester 8 report](./) -->
<!-- 4. [Semester 8 slides](./) -->
<!-- 5. Author 1, Author 2 and Author 3 "Research paper title" (2021). [PDF](./). -->


## Links

- [Project Repository](https://github.com/cepdnaclk/repository-name)
- [Project Page](https://cepdnaclk.github.io/repository-name)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)



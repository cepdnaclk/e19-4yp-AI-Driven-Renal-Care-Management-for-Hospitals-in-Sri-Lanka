

# AI-Driven Renal Care Management – Teaching Hospital Peradeniya

#### Team

- E/19/095, E.M.L.K. Edirisinghe, [email](mailto:e19095@eng.pdn.ac.lk)
- E/19/170, K.N.N. Jayawardhana, [email](mailto:e19170@eng.pdn.ac.lk)
- E/19/306, M.M.P.N. Rajakaruna, [email](mailto=e19306@eng.pdn.ac.lk)

#### Supervisor

- Dr. Upul Jayasinghe

#### Table of Contents

- [AI-Driven Renal Care Management – Teaching Hospital Peradeniya](#ai-driven-renal-care-management--teaching-hospital-peradeniya)
      - [Team](#team)
      - [Supervisor](#supervisor)
      - [Table of Contents](#table-of-contents)
  - [Abstract](#abstract)
  - [Problem Statement](#problem-statement)
  - [Objectives](#objectives)
    - [General Objective](#general-objective)
    - [Specific Objectives](#specific-objectives)
  - [System Design](#system-design)
    - [🏗️ System Architecture](#️-system-architecture)
    - [🎯 Use Case Diagram](#-use-case-diagram)
    - [🧩 Workflow Diagram](#-workflow-diagram)
  - [Methodology](#methodology)
    - [Phase 1: Machine Learning Model](#phase-1-machine-learning-model)
    - [Phase 2: AI Expert System](#phase-2-ai-expert-system)
    - [Phase 3: Pilot Study](#phase-3-pilot-study)
  - [Technologies Used](#technologies-used)
  - [Ethics and Privacy](#ethics-and-privacy)
  - [Results and Analysis](#results-and-analysis)
  - [Documents](#documents)
  - [Conclusion](#conclusion)
  - [Publications](#publications)
  - [Links](#links)

---

## Abstract

<p>Chronic Kidney Disease (CKD) is a growing burden in Sri Lanka. This project aims to develop an <b>AI-powered expert system</b> to assist in the management of hemodialysis patients at the Teaching Hospital Peradeniya. The system provides real-time monitoring, predictive analytics, and clinical decision support. By digitizing medical records and integrating advanced AI tools, it aims to improve patient outcomes, reduce complications, and enhance treatment personalization.</p>

<img src='https://github.com/user-attachments/assets/dc5b1669-8d62-49a1-b514-16a9689174b2' width=300 />
<p><i>Figure 1.1: CKD prevalence rates in Sri Lanka (2009–2016). <a href='https://doi.org/10.1016/j.scitotenv.2019.133767'>Source</a></i></p>

---

## Problem Statement

Traditional dialysis monitoring is manual, reactive, and prone to delays in detecting complications. With limited medical infrastructure in Sri Lanka, the need for scalable, intelligent systems is high. This project introduces an AI-driven approach to enable proactive care, address model adaptability challenges, and improve clinical trust through explainable AI (XAI).

---

## Objectives

### General Objective
To develop and validate an AI expert system that enhances dialysis management through real-time monitoring and predictive support.

### Specific Objectives

- Develop an ensemble ML model using Random Forest, XGBoost, and ANN.
- Identify essential clinical and demographic data for accurate predictions.
- Compare the AI system with traditional care models in terms of outcomes.
- Build an integrated expert system with a user-friendly clinical dashboard.
- Pilot the system at Teaching Hospital Peradeniya and gather clinical feedback.

---

## System Design

### 🏗️ System Architecture
<img src="./docs/images/system architecture design.drawio.png" alt="System Architecture Design" width="600"/>
<p><i>Figure: System architecture showing data pipelines, model inference, and interface components.</i></p>

### 🎯 Use Case Diagram
<img src="./docs/images/usecase.drawio.png" alt="Use Case Diagram" width="300"/>
<p><i>Figure: Use case diagram highlighting interactions between clinicians, AI system, and patient records.</i></p>

### 🧩 Workflow Diagram
<img src="./docs/images/workflow.drawio.png" alt="Workflow Diagram" width="300"/>
<p><i>Figure: Overall workflow of the AI-driven renal care system.</i></p>

---

## Methodology

### Phase 1: Machine Learning Model
- Supervised learning with 80/20 train-validation split
- Algorithms: RF, XGBoost, SVM, ANN
- Metrics: ROC-AUC, Accuracy, Precision, F1 Score

### Phase 2: AI Expert System
- **Knowledge Base**: Dialysis protocols and clinical history
- **Inference Engine**: Real-time monitoring with alerts
- **UI**: Clinician dashboard for data input and insights

### Phase 3: Pilot Study
- Conducted at Teaching Hospital Peradeniya
- Staff training and usability evaluation
- Feedback loop for iterative improvement

---

## Technologies Used

- **Programming**: Python
- **ML Frameworks**: TensorFlow, Scikit-learn, XGBoost, Keras
- **Backend**: FastAPI, Express.js
- **Frontend**: React.js
- **Database**: MySQL
- **MLOps**: CI/CD for real-time model deployment and monitoring

---

## Ethics and Privacy

- Ethical clearance from Faculty of Medicine, University of Peradeniya
- Approvals from Ministry of Health and hospital administration
- Informed consent from all patients and staff
- Adherence to strict data privacy and security protocols

---

## Results and Analysis

*To be updated after pilot testing phase.*

---

## Documents

- 📄 [Project Proposal](https://drive.google.com/file/d/1mGDrJs-V_gSJg8q4qCwjG41z0nMPyLlk/view?usp=sharing)
- 📘 [Literature Review](https://drive.google.com/file/d/1lSuoPDBZSQUCuIswwqZkcL0fXzvE-obs/view?usp=sharing)

---

## Conclusion

This AI-powered system seeks to transform renal care by enabling real-time, data-driven decisions. The solution supports clinicians, enhances patient safety, and provides a sustainable digital transformation for dialysis units.

---

## Publications

<!-- Uncomment and add links after uploading to repo -->
<!-- 5. Author 1, Author 2 and Author 3 "Research paper title" (2025). [PDF](./). -->

---

## Links

- [Project Repository](https://github.com/cepdnaclk/e19-4yp-AI-Driven-Renal-Care-Management-for-Hospitals-in-Sri-Lanka)
- [Project Page](https://cepdnaclk.github.io/e19-4yp-AI-Driven-Renal-Care-Management-for-Hospitals-in-Sri-Lanka)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

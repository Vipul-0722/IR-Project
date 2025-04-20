# ✈️ Airlytics

A full-stack application that provides an interactive API and web interface to explore global airport data. The service is powered by Node.js or CAP, backed by MongoDB and Elasticsearch, and deployed on the SAP BTP Kyma Kubernetes cluster.

## 🌍 Live Demo

- **Frontend App URL:** [ui.api.d6d7c75.kyma.ondemand.com](ui.api.d6d7c75.kyma.ondemand.com)
- **API Base URL:** [api.api.d6d7c75.kyma.ondemand.com/api/docs](api.api.d6d7c75.kyma.ondemand.com/api/docs)
- **Swagger Documentation:** [api.api.d6d7c75.kyma.ondemand.com/api/docs](api.api.d6d7c75.kyma.ondemand.com/api/docs)

## 🎥 Video Demo

[Click here to watch the demo video](Assets/demo.mov)


---

## 🧱 Tech Stack

| Layer          | Technology           |
|----------------|----------------------|
| **Frontend**   | React (or other)     |
| **Backend**    | Node.js + Express and CAP   |
| **Database**   | MongoDB              |
| **Search Engine** | Elasticsearch     |
| **Caching**    | Redis                |
| **Cron Jobs**  | node-cron            |
| **Deployment** | SAP BTP (Kayma)   |


---

## 🔩 Components

| Component        | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| 👤 **User (UI)** | Front-facing interface for querying & viewing results                       |
| 🖥️ **Frontend**   | Built using React (or any modern JS framework)                             |
| 🔧 **Backend**    | Node.js + Express handles routing, API logic, and integration and CAP      |
| 🗃️ **MongoDB**     | Primary data store for airport records                                     |
| 🧠 **Elasticsearch** | Search engine for fast full-text search & autocomplete                   |
| 🔁 **Circuit Breaker** | Graceful fallback to Mongo when ES is down                            |
| 🧪 **Redis**      | Caches airport stats for performance                                       |
| ⏰ **Cron Job**    | Nightly sync job to update Elasticsearch with Mongo data                   |
| ☁️ **SAP BTP**     |  Deployment on kyma cluster using SAP Business Technology Platform          |

---
## ⚙️ Features

### Backend (Node.js + Express + MongoDB + Elasticsearch)
🚀 Features
- Load & display 29K+ airports from JSON/CSV into MongoDB

- Fast search & filtering using Elasticsearch

- Fallback to MongoDB using Circuit Breaker when ES is down

- Nightly sync job from MongoDB to Elasticsearch via Cron

- Derived fields like region (Country-State)

- Sorting & filtering by name, city, country, etc.

- Add airport at runtime via API

- Highlight rows in UI where elevation > 8000ft

- Caching stats/analytics in Redis

- Deployment on SAP BTP

### Frontend (React.js)
- Displays all airports in a table view
- Sortable and filterable by columns
- Highlights rows where elevation > 8000 ft

## 🔍 Data Analytics & Scripting Tasks

This application includes various analytical endpoints and background tasks that provide valuable insights on airport data.

### 🚀 Performance Features
- 🗂️ **Redis Caching**: Frequently accessed analytics results are cached in Redis to boost performance and reduce latency.
- 🕐 **Nightly Cron Job**: A scheduled task syncs data from **MongoDB** to **Elasticsearch** every night to ensure search results stay up to date.

### 📈 Scripting Tasks

1. **Calculate Average Elevation per Country**
   - Computes the average airport elevation grouped by country.
   - Helpful for geographic analysis and environmental studies.

2. **Find Airports Without IATA Codes**
   - Detects airports missing an IATA code.
   - Useful for data quality assurance and cleanup.

3. **Determine the 10 Most Common Time Zones**
   - Lists the most frequently occurring airport time zones.
   - Helps understand global distribution and timezone density.

Each of these is exposed via clean REST APIs and efficiently cached with Redis for production-grade speed.

---
## Deployment Digaram
![](./Assets/deployment.png)

---
## 📸 Screenshots

### 🏠 Home Page
![Home Page](./Assets/1.png)

### 🔍 Autocomplete Search 
![Search](./Assets/2.png)

### 🔍 Sort By filter 
![Search](./Assets/3.png)

### 🔍 Analytics - Average Elevation per Country
![Search](./Assets/4.png)

### 🔍 Analytics - Airports Without IATA Codes
![Search](./Assets/5.png)

### 🔍 Analytics - 10 Most Common Time Zones
![Search](./Assets/6.png)

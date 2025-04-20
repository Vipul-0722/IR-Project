# ✈️ Airlytics

A full-stack application that provides an interactive API and web interface to explore global airport data. The service is powered by Node.js or CAP, backed by MongoDB and Elasticsearch, and deployed on the SAP BTP Kyma Kubernetes cluster.

## 🌍 Live Demo

- **Frontend App URL:** [ui.api.d6d7c75.kyma.ondemand.com](ui.api.d6d7c75.kyma.ondemand.com)
- **API Base URL:** [api.api.d6d7c75.kyma.ondemand.com/api/docs](api.api.d6d7c75.kyma.ondemand.com/api/docs)
- **Swagger Documentation:** [api.api.d6d7c75.kyma.ondemand.com/api/docs](api.api.d6d7c75.kyma.ondemand.com/api/docs)

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


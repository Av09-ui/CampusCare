# CampusCare - System Architecture

## 1. Architecture Overview

CampusCare follows a modular multi-service architecture.

The system is divided into:

- Frontend
- Backend API
- AI Service
- PostgreSQL Database
- File/Evidence Storage
- Monitoring components

The architecture is designed to keep the application functionality separate from AI processing and infrastructure/DevOps components.

---

## 2. High-Level Architecture

```text
                    ┌──────────────────────┐
                    │       Student       │
                    └──────────┬───────────┘
                               │
                               │
                    ┌──────────▼───────────┐
                    │       Frontend       │
                    │     Web Interface    │
                    └──────────┬───────────┘
                               │
                               │ HTTP/REST
                               │
                    ┌──────────▼───────────┐
                    │     Backend API      │
                    │                      │
                    │ Authentication       │
                    │ Authorization        │
                    │ Complaints            │
                    │ Dashboard             │
                    │ Admin Operations      │
                    └──────┬────────┬───────┘
                           │        │
                 ┌─────────┘        └──────────┐
                 │                             │
                 ▼                             ▼
       ┌──────────────────┐          ┌──────────────────┐
       │    PostgreSQL    │          │    AI Service    │
       │                  │          │                  │
       │ Users            │          │ Categorization   │
       │ Complaints       │          │ Priority         │
       │ Support Records  │          │ Similarity       │
       │ Updates          │          │ Analysis         │
       │ Resolution Data  │          │                  │
       └──────────────────┘          └──────────────────┘
                 │
                 │
                 ▼
       ┌──────────────────┐
       │ Evidence Storage │
       │ Images / Videos  │
       │ Documents        │
       └──────────────────┘
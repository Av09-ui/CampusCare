# CampusCare - Database Design

## 1. Database Overview

CampusCare will use a relational database for persistent application data.

The planned database is PostgreSQL.

The database is responsible for storing structured application data and relationships between users, complaints, support records, comments, progress updates, and resolution records.

Uploaded files such as images, videos, and documents should be stored separately from the relational database, with appropriate metadata/reference information maintained in the database.

---

# 2. Core Entities

The initial database model contains the following major entities:

1. User
2. Complaint
3. Complaint Analysis
4. Complaint Support
5. Complaint Comment
6. Complaint Update
7. Evidence
8. Resolution

---

# 3. Entity Relationship Overview

```text
                    ┌──────────────┐
                    │     User     │
                    │              │
                    │ id           │
                    │ name         │
                    │ email        │
                    │ password     │
                    │ role         │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
          ┌──────────────┐    ┌───────────────┐
          │   Complaint  │    │    Support    │
          │              │    │               │
          │ id           │    │ student_id    │
          │ student_id   │    │ complaint_id  │
          │ description  │    └───────────────┘
          │ category     │
          │ priority     │
          │ status       │
          └──────┬───────┘
                 │
       ┌─────────┼──────────┬─────────────┐
       │         │          │             │
       ▼         ▼          ▼             ▼
   Analysis   Comments    Updates      Evidence
       │         │          │             │
       ▼         ▼          ▼             ▼
      AI       User       Admin/User     File
    Results   Context      Progress     Metadata
                              │
                              ▼
                         Resolution
# CampusCare - API Specification

## 1. API Overview

The CampusCare backend exposes a REST API used by the frontend and other application services.

The API is responsible for:

- Authentication
- User information
- Complaint management
- AI analysis integration
- Complaint support
- Comments
- Progress updates
- Resolution
- Search and filtering

The frontend communicates with the backend API.

The frontend must not directly access the database.

---

# 2. API Conventions

## Base URL

The development API will use a configurable base URL.

Example:

```text
http://localhost:<backend-port>/api
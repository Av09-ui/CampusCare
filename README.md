# CampusCare

AI-powered college complaint and support platform built as an Agile Software Development and DevOps mini-project.

## Overview

CampusCare is a complete web application that allows students to submit complaints, support existing complaints, and track their resolution. Administrators can manage complaints, assign them, update status, and mark them as resolved.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Backend    │────▶│  PostgreSQL │
│  (React)    │     │  (FastAPI)  │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  AI Service │
                    │  (Future)   │
                    └─────────────┘
```

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router v6 (routing)
- Axios (HTTP client)

### Backend
- FastAPI (Python web framework)
- SQLAlchemy 2.0 (ORM)
- PostgreSQL (database)
- Alembic (migrations)
- PyJWT (authentication)
- Argon2 (password hashing)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD) - planned
- Kubernetes - planned
- Terraform - planned
- Ansible - planned

## Project Structure

```
CampusCare/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── database.py     # Database configuration
│   │   ├── config.py       # Settings
│   │   └── main.py         # Application entry
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/            # API service
│   │   ├── components/     # UI components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docs/                   # Documentation
├── docker-compose.yml      # Local development
└── README.md
```

## Features

### Student Features
- ✅ Registration with college email
- ✅ Login/Logout with JWT authentication
- ✅ Create complaints with natural language
- ✅ View complaint dashboard with search/filter
- ✅ Support existing complaints ("I have this problem too")
- ✅ Add comments and evidence when supporting
- ✅ Track complaint status and progress
- ✅ View resolution information

### Admin Features
- ✅ View all complaints
- ✅ Assign complaints
- ✅ Update complaint status (Pending → Assigned → In Progress → Resolved → Closed)
- ✅ Add progress updates
- ✅ Resolve complaints with resolution details
- ✅ Bulk actions on multiple complaints
- ✅ Dashboard statistics

### AI Features (Planned)
- 🔄 Automatic complaint categorization
- 🔄 Priority assessment
- 🔄 Similar complaint detection

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd CampusCare

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

### Manual Development Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env if needed

# Start development server
npm run dev
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `GET /api/auth/me` - Get current user

#### Complaints
- `GET /api/complaints` - List complaints (with filters)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/{id}` - Get complaint details
- `POST /api/complaints/{id}/support` - Support complaint

#### Admin
- `POST /api/admin/complaints/{id}/assign` - Assign complaint
- `PATCH /api/admin/complaints/{id}/status` - Update status
- `POST /api/admin/complaints/{id}/progress` - Add progress update
- `POST /api/admin/complaints/{id}/resolve` - Resolve complaint

## Database Schema

### Core Tables
- **users** - User accounts (students, admins)
- **complaints** - Complaint records
- **complaint_analysis** - AI analysis results
- **complaint_supports** - Student support records
- **complaint_comments** - Comments on complaints
- **complaint_updates** - Progress updates
- **evidence** - File attachments
- **resolutions** - Complaint resolutions

## User Roles

| Action | Student | Admin |
|--------|---------|-------|
| Register | ✅ | ❌ |
| Login | ✅ | ✅ |
| View Dashboard | ✅ | ✅ |
| Create Complaint | ✅ | ❌ |
| Support Complaint | ✅ | ❌ |
| View Progress | ✅ | ✅ |
| Assign Complaint | ❌ | ✅ |
| Update Status | ❌ | ✅ |
| Add Progress | ❌ | ✅ |
| Resolve Complaint | ❌ | ✅ |

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm run test
```

### Code Quality

```bash
# Backend linting
cd backend
# Add your preferred linter

# Frontend linting
cd frontend
npm run lint
```

### Database Migrations

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## Deployment

### Docker Production Build

```bash
# Build all images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes (Planned)

```bash
# Apply manifests
kubectl apply -f k8s/
```

## Documentation

- [Requirements](docs/REQUIREMENTS.md)
- [Features](docs/FEATURES.md)
- [User Roles](docs/USER_ROLES.md)
- [User Workflows](docs/USER_WORKFLOWS.md)
- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API Specification](docs/api.md)
- [AI Integration](docs/ai.md)
- [Security](docs/security.md)
- [DevOps](docs/devops.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Status

This is an academic mini-project demonstrating:
- ✅ Complete backend with authentication
- ✅ Complete frontend with all core features
- ✅ Docker containerization
- 🔄 CI/CD pipeline
- 🔄 Kubernetes deployment
- 🔄 AI service integration
- 🔄 Monitoring setup
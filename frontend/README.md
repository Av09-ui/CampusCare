# CampusCare Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the CampusCare college complaint platform.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API service layer
│   ├── components/    # Reusable UI components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main app with routing
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles (Tailwind)
├── public/            # Static assets
├── index.html         # HTML template
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── Dockerfile
├── nginx.conf
└── .env               # Environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Docker

### Build Image

```bash
docker build -t campuscare-frontend .
```

### Run Container

```bash
docker run -p 3000:80 campuscare-frontend
```

## Features

- **Authentication**: Login, Register, JWT token management
- **Dashboard**: View, search, filter complaints
- **Complaint Detail**: View details, support complaints, progress updates
- **Admin Panel**: Bulk actions, status management, resolution
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Automatic dark mode support

## API Integration

The frontend communicates with the backend via REST API:
- Base URL: `VITE_API_URL` (default: `http://localhost:8000/api`)
- Authentication: Bearer token in Authorization header
- Automatic token refresh on 401 responses

## Components

### UI Components
- `Button` - Multiple variants and sizes
- `Input` / `Textarea` / `Select` - Form inputs with validation
- `Card` / `CardHeader` - Content containers
- `Badge` / `StatusBadge` / `PriorityBadge` - Status indicators
- `Modal` / `ConfirmModal` - Dialog components
- `Alert` - Notification messages
- `Navbar` - Navigation header
- `Layout` / `AuthLayout` - Page layouts

### Pages
- `Login` - User authentication
- `Register` - New user registration
- `Dashboard` - Main complaint listing with filters
- `ComplaintDetail` - Detailed complaint view with actions
- `AdminPanel` - Administrative complaint management

## Development Guidelines

1. **Type Safety**: Use TypeScript interfaces from `src/types/`
2. **API Calls**: Use the `api` service from `src/api/`
3. **State Management**: Use React hooks and context
4. **Styling**: Use Tailwind CSS utility classes
5. **Forms**: Use the `useForm` hook for form handling
6. **Routing**: Use React Router v6 with protected routes

## Testing

```bash
# Run tests (when implemented)
npm run test

# Run type checking
npm run typecheck

# Run linting
npm run lint
```
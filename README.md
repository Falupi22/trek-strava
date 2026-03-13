# BikeHealth 🚵

Bike Component Health Management System that analyzes your Strava cycling data to predict when bike components need maintenance or replacement.

## Features

- **Strava Integration**: Connect your Strava account to automatically sync cycling activities
- **Component Health Analysis**: Track wear on chains, cranks, derailleurs, brakes, and bearings
- **Wear Prediction**: Calculate component health based on distance, climbing, and descending
- **Mobile Responsive**: Works seamlessly on phones and tablets
- **Real-time Updates**: Background sync keeps your data current

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Fastify + Node.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand + TanStack Query
- **Deployment**: Docker + Railway

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Strava API credentials

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bikehealth
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Add your Strava API credentials
   # STRAVA_CLIENT_ID=your_client_id
   # STRAVA_CLIENT_SECRET=your_client_secret
   # STRAVA_REDIRECT_URI=http://localhost:3000/auth/strava/callback
   ```

3. **Start Development Environment**
   ```bash
   # Start all services (API, DB, Web, Worker)
   npm run dev

   # Or start individual services:
   npm run dev:api    # API server only
   npm run dev:web    # Frontend only
   ```

4. **Access the Application**
   - Frontend: http://localhost:5174
   - API: http://localhost:3000
   - Database: localhost:5432

### Production Deployment

The app is configured for deployment on Railway with separate services:

1. **Database**: PostgreSQL service
2. **API**: Node.js service with environment variables
3. **Web**: Static site service with `VITE_API_BASE_URL` pointing to API service

## Project Structure

```
bikehealth/
├── apps/
│   ├── api/              # Fastify backend API
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── server.ts # Main server file
│   │   │   └── worker.ts # Background sync worker
│   │   └── prisma/       # Database schema & migrations
│   └── web/              # React frontend
│       ├── src/
│       │   ├── api/      # API client
│       │   ├── pages/    # React pages
│       │   ├── components/ # Reusable components
│       │   └── stores/   # Zustand state management
│       └── vite.config.ts
├── packages/
│   └── shared/           # Shared types & utilities
├── docker-compose.yml    # Development environment
└── package.json          # Workspace configuration
```

## API Endpoints

### Authentication
- `GET /auth/strava` - Initiate Strava OAuth
- `GET /auth/strava/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/disconnect` - Disconnect Strava

### Bikes & Components
- `GET /api/bikes` - List user's bikes
- `POST /api/bikes` - Create/update bike setup
- `GET /api/bikes/:id/components` - Get component health data
- `POST /api/strava/sync` - Trigger manual data sync

## Database Schema

The app uses Prisma ORM with the following main entities:

- **User**: Strava-connected users
- **Bike**: User's bike configurations
- **Component**: Individual bike components with wear tracking
- **StravaToken**: OAuth tokens for API access
- **Activity**: Synced Strava activities

## Component Health Calculation

Component health is calculated based on:

- **Distance (km)**: Primary wear factor for most components
- **Climbing (m)**: Additional stress on drivetrain
- **Descending (m)**: Brake wear calculation

Each component type has specific wear thresholds and replacement recommendations.

## Development Commands

```bash
# Build all workspaces
npm run build

# Database operations (from apps/api)
npm run db:migrate    # Run migrations
npm run db:generate   # Generate Prisma client
npm run db:studio     # Open Prisma Studio
```

## Environment Variables

### API Service
- `STRAVA_CLIENT_ID` - Strava OAuth client ID
- `STRAVA_CLIENT_SECRET` - Strava OAuth client secret
- `STRAVA_REDIRECT_URI` - OAuth callback URL
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection for background jobs
- `CORS_ORIGIN` - Allowed frontend origins

### Web Service
- `VITE_API_BASE_URL` - Production API endpoint (e.g., `https://your-api.railway.app`)
- `VITE_API_URL` - Development proxy target (Docker only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues or questions, please check the code or create an issue in the repository.
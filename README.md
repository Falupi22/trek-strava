# CTC Bike Health

Bike component health management system powered by Strava. Connects to your Strava account, analyzes your cycling activity data, and predicts when bike components need maintenance or replacement.

**Status: Beta**

## How It Works

1. Connect your Strava account via OAuth
2. Set up your bike (brand, model, purchase date)
3. Mark any components you've already replaced
4. The app syncs your ride data and calculates wear on 6 component types

Component health is based on distance, climbing, and descending — each component type weighs these factors differently:

| Component | Wear Factors |
|-----------|-------------|
| Chain | Distance + Climbing |
| Crankset | Distance |
| Rear Derailleur | Distance + Climbing |
| Front Brake Pads | Descending |
| Rear Brake Pads | Descending |
| Bearings | Distance |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| State | Zustand (auth), TanStack Query (server state) |
| Backend | Fastify 4, TypeScript, Node.js 22 |
| Database | PostgreSQL 16, Prisma ORM |
| Infrastructure | Docker, Nginx, Railway |

## Project Structure

```
bikehealth/
├── apps/
│   ├── api/                    # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/         # auth, bikes, strava
│   │   │   ├── middleware/     # JWT auth guard
│   │   │   ├── server.ts       # App entry point
│   │   │   ├── worker.ts       # Cron jobs (sync, cache purge)
│   │   │   ├── strava.ts       # Strava API client
│   │   │   ├── sync.ts         # Activity aggregation
│   │   │   ├── encryption.ts   # AES-256-GCM token encryption
│   │   │   └── session.ts      # JWT signing/verification
│   │   └── prisma/
│   │       └── schema.prisma   # Database schema
│   └── web/                    # React SPA
│       ├── src/
│       │   ├── pages/          # Connect, Setup, Processing, Dashboard, Privacy, Terms
│       │   ├── components/     # DonutChart, UpdateModal, StravaAttribution
│       │   ├── api/            # API client helpers
│       │   └── stores/         # Zustand auth store
│       └── nginx.conf          # Production reverse proxy
├── packages/
│   └── shared/                 # Shared types + wear formula
├── docker-compose.yml          # Development environment
└── docker-compose.prod.yml     # Production environment
```

## Database Schema

```
User
├── stravaAthleteId (unique)
├── displayName, profileImageUrl
├── StravaToken (encrypted access + refresh tokens)
├── StravaSummary (aggregated km, climb, descent, activity count)
└── Bike[]
    └── BikeComponent[] (6 per bike, unique by type)
```

All relations cascade on delete — disconnecting deletes everything.

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/strava` | Redirect to Strava OAuth |
| GET | `/auth/strava/callback` | OAuth callback, creates user, signs JWT |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/disconnect` | Revoke token + delete all user data |

### Bikes & Components
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bikes` | List bikes |
| POST | `/api/bikes` | Create bike + seed 6 components |
| DELETE | `/api/bikes/:id` | Delete bike |
| GET | `/api/bikes/:id/components` | Components with calculated health scores |
| PATCH | `/api/components/:id` | Update component purchase date/brand |

### Strava
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/strava/summary` | Aggregated activity totals |
| POST | `/api/strava/sync` | Trigger manual sync |
| GET | `/api/strava/webhook` | Webhook verification |
| POST | `/api/strava/webhook` | Webhook events (activity create/delete, deauth) |

## Strava API Compliance

- **Data display**: Only shows data to the authenticated user it belongs to
- **Caching**: Aggregated summaries purged after 7 days (daily cron at 2 AM)
- **Deletion**: All user data deleted within 48 hours on disconnect or deauth
- **Deauthorization**: Webhook handles `athlete:delete` events from Strava
- **Activity deletion**: Webhook handles `activity:delete` with full resync
- **Security**: Tokens encrypted with AES-256-GCM, all traffic over HTTPS, 24h breach notification
- **Attribution**: "Powered by Strava" logo, "View on Strava" links styled per brand guidelines
- **Raw data**: Individual activities are never stored — only aggregated totals

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Strava API app at https://www.strava.com/settings/api

### Steps

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your Strava credentials and generate encryption keys:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Start all services
docker-compose up --build

# 3. Access
# Web:  http://localhost:5174
# API:  http://localhost:3000
```

### Services started by docker-compose

| Service | Description |
|---------|-------------|
| `db` | PostgreSQL 16 |
| `redis` | Redis 7 |
| `migrate` | Runs Prisma migrations (exits after) |
| `api` | Fastify with hot reload |
| `worker` | Cron jobs (sync + cache purge) |
| `web` | Vite dev server with API proxy |

### Useful commands

```bash
# Database
cd apps/api
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio

# Build all
npm run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRAVA_CLIENT_ID` | Yes | Strava OAuth client ID |
| `STRAVA_CLIENT_SECRET` | Yes | Strava OAuth client secret |
| `STRAVA_REDIRECT_URI` | Yes | OAuth callback URL |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ENCRYPTION_KEY` | Yes | 64-char hex key for AES-256-GCM |
| `SESSION_SECRET` | Yes | 64-char hex key for JWT signing |
| `CORS_ORIGIN` | Yes | Allowed frontend origin |
| `API_PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `LOG_LEVEL` | No | Logging level (default: debug/info) |
| `STRAVA_WEBHOOK_VERIFY_TOKEN` | No | Webhook verification token |
| `STRAVA_WEBHOOK_CALLBACK_URL` | No | Webhook endpoint URL |

## Production Deployment

Configured for Railway with separate services:

- **API + Worker**: Node.js service from `apps/api/Dockerfile`
- **Web**: Nginx serving built SPA from `apps/web/Dockerfile`
- **Database**: Railway-managed PostgreSQL

The web Nginx config proxies `/api` and `/auth` to the API service via the `API_UPSTREAM` environment variable.

## License

This project is private and proprietary.

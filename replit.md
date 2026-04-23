# Pure Air Guard - Mould Prevention App

## Overview

Full-stack mould prevention and indoor air quality monitoring application. Built with React + Vite frontend and Express API backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── pure-air-guard/     # React + Vite frontend app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Features

- **Dashboard**: Overview stats (rooms, alerts, avg humidity, temperature), mould risk level, room status sidebar
- **Rooms**: Add/edit/delete rooms, view risk levels, current readings
- **Readings**: Log sensor readings (humidity, temperature, CO2, VOC), filter by room
- **Alerts**: Active/resolved alerts with severity levels (warning/danger/critical)
- **Inspections**: Log and track mould inspections with findings and action items
- **Prevention Tips**: 12 curated mould prevention recommendations by category
- **Sensors/Bluetooth**: Placeholder for future BLE sensor connectivity

## API Routes

- `GET/POST /api/rooms` - Room management
- `GET/PUT/DELETE /api/rooms/:id` - Individual room CRUD
- `GET/POST /api/readings` - Sensor readings
- `GET /api/readings/latest` - Latest reading per room
- `GET /api/alerts` - Alerts (filter by status)
- `PUT /api/alerts/:id/resolve` - Resolve an alert
- `GET/POST /api/inspections` - Inspection logs
- `GET /api/recommendations` - Prevention tips
- `GET /api/dashboard/summary` - Dashboard stats

## Database Schema

- `rooms` - Room records with mould risk level
- `readings` - Humidity/temperature sensor readings with mould risk score
- `alerts` - Auto-generated alerts when readings exceed thresholds
- `inspections` - Manual inspection log entries

## Development

- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/pure-air-guard run dev`
- DB push: `pnpm --filter @workspace/db run push`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`

# RRF Smart Farming System

## Overview

A full-stack IoT web application that monitors farm conditions using an ESP32 device and displays real-time data on a web dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/smart-farming)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (Replit built-in)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Build**: esbuild (CJS bundle)

## Architecture

```
ESP32 → POST /api/sensor-data → Express API → PostgreSQL → React Dashboard
```

## Key API Endpoints

- `POST /api/sensor-data` — receives sensor data from ESP32
- `GET /api/sensor-data` — returns latest sensor reading
- `GET /api/sensor-data/history?limit=20` — returns last N readings for charts
- `GET /api/sensor-data/stats` — returns min/max/avg stats for last 24h

## ESP32 Payload Format

```json
{
  "temperature": 26,
  "humidity": 70,
  "soil_moisture": 350,
  "light_level": 300,
  "nitrogen": 20,
  "phosphorus": 10,
  "potassium": 5,
  "latitude": 0.3476,
  "longitude": 32.5825
}
```

## Database Schema

Table: `sensor_data`
- id (serial, primary key)
- temperature (real)
- humidity (real)
- soil_moisture (real)
- light_level (real)
- nitrogen (integer)
- phosphorus (integer)
- potassium (integer)
- latitude (real)
- longitude (real)
- created_at (timestamp with timezone)

## Dashboard Pages

- `/` — Live dashboard with sensor cards, status indicators, NPK values, environmental trend charts, auto-refresh every 5 seconds
- `/history` — Historical data table of past readings
- `/map` — GPS tracking location view
- `/api-info` — API integration guide for ESP32 developers

## Status Logic

- **Soil Moisture**: < 200 = Soil Dry, 200–600 = Optimal, > 600 = Waterlogged
- **Temperature**: < 15°C = Cold, 15–35°C = Optimal, > 35°C = Hot
- **Humidity**: < 30% = Low, 30–70% = Optimal, > 70% = High
- **Light Level**: < 100 = Dark, 100–500 = Moderate, > 500 = Bright

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Packages / Libs

- `lib/api-spec` — OpenAPI spec source of truth
- `lib/api-client-react` — Generated React Query hooks
- `lib/api-zod` — Generated Zod validation schemas
- `lib/db` — Drizzle ORM schema and DB client

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

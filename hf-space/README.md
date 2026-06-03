---
title: TremorID API
emoji: 🌋
colorFrom: red
colorTo: yellow
sdk: docker
app_port: 7860
---

# TremorID Backend API

Real-time Indonesia earthquake monitoring backend.

## API Endpoints

- `GET /api/health` — Health check
- `GET /api/quakes` — List quakes (supports `?limit=10&minMag=4&maxMag=7&maxDepth=100`)
- `GET /api/quakes/latest` — Latest quake
- `GET /api/quakes/:id` — Quake detail
- `GET /api/quakes/:id/summary` — AI summary
- `GET /api/quakes/digest` — Digest of recent quakes

## Environment Variables

- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `FREEMODEL_API_KEY` — Freemodel.dev API key
- `WEBHOOK_SECRET` — Telegram webhook secret
- `ALLOWED_ORIGINS` — CORS allowed origins (comma-separated)
- `PORT` — Server port (default: 3000)

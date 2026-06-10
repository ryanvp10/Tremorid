# 🌍 TremorID

> Real-time Indonesia Earthquake Monitor with AI & 3D Visualization

![TremorID](https://img.shields.io/badge/TremorID-Hackathon%202026-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 About

TremorID is a real-time earthquake monitoring webapp for Indonesia. Built for the **Everyone Ships Now** hackathon by Mind the Product × Novus.ai.

### Features
- 🗺️ **2D & 3D Interactive Maps** — Leaflet 2D fallback + CesiumJS globe locked to Indonesia
- 🤖 **AI Chat** — Ask about recent earthquakes in natural language (via freemodel.dev)
- 📱 **Telegram Bot** — Real-time alerts for quakes ≥ 5.0 SR via @TremorIDBot
- 🔔 **Notification Modal** — In-app modal with instructions to subscribe via Telegram (EN + ID)
- 📍 **Translated Locations** — Toggle between Bahasa Indonesia and English (i18n)
- 📊 **Filtering** — Filter by magnitude range and max depth
- ⏱️ **Timeline** — Browse earthquakes with date filtering
- 🚨 **Alerts** — Auto-notification for significant earthquakes (Mag ≥ 5.0)

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React + Vite |
| 3D Map | CesiumJS (OSM Tiles) |
| 2D Fallback | Leaflet.js |
| Backend | Node.js + Express |
| Database | SQLite |
| AI | freemodel.dev |
| Telegram | Telegraf.js (webhook mode) |
| Deploy (FE) | Netlify |
| Deploy (BE) | Hugging Face Spaces |
| Data Source | BMKG API |
| Localization | i18n toggle (ID/EN) |

## 📁 Project Structure

```
tremorid/
├── frontend/                       # React + Vite + CesiumJS + Leaflet
│   ├── src/
│   │   ├── components/             # Map2D, Map3D, QuakeCard, FilterPanel, etc.
│   │   ├── contexts/               # LanguageContext (i18n)
│   │   ├── lib/                    # parseWilayah, formatDate utils
│   │   └── App.jsx
├── backend/                        # Node.js + Express + SQLite
│   ├── src/
│   │   ├── services/
│   │   │   ├── bmkgFetcher.js      # BMKG API polling (5min interval, 30s timeout, retry)
│   │   │   └── ai.js               # freemodel.dev chat integration
│   │   ├── telegram/
│   │   │   └── bot.js              # Telegram bot setup (sync init, webhook mode)
│   │   ├── routes/
│   │   │   └── quakes.js           # GET /api/quakes (supports minMag/maxMag/maxDepth filters)
│   │   └── server.js               # Express server, bot init, BMKG fetcher
├── hf-space/                       # HF Spaces deployment mirror of backend/
├── PRD.md                          # Product Requirements
├── PROJECT_FLOW.md                 # Technical Architecture
└── README.md                       # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Environment Variables

**Backend / HF Space:**
```
TELEGRAM_BOT_TOKEN=your_bot_token         # Telegram bot token (from @BotFather)
FREEMODEL_API_KEY=your_freemodel_key      # freemodel.dev API key
HF_SPACE=1                                 # Enable HF Space webhook mode
DISABLE_BMKG=1                             # (optional) Disable BMKG polling
ALLOWED_ORIGINS=https://yourdomain.com     # CORS origins (comma-separated)
PORT=7860                                  # Server port
```

**Frontend:**
```
VITE_API_URL=https://your-api.hf.space     # Set in Netlify UI, NOT netlify.toml
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

## 🏗️ Deployment

### Frontend → Netlify
- Auto-deploys on push to `main`
- `VITE_API_URL` configured in **Netlify UI** (Environment Variables), never in `netlify.toml`

### Backend → Hugging Face Spaces
- HF Space git repo is **separate** from GitHub
- Deploy by cloning Space repo to `/tmp`, copying files from local `hf-space/`, committing, and pushing
- **Never force-push GitHub → HF** (binary `.db-wal` blocks it)
- HF Space injects env vars via Secrets (not `.env` files)

### Telegram Bot
- Webhook mode: bot registers `/telegram-webhook` endpoint with Telegram
- Lazy sync init: no eager API calls on startup, works even if Telegram API is temporarily unreachable
- `unhandledRejection` guard prevents crash from stray Telegraf internals
- Broadcasts alerts to subscribers for quakes ≥ 5.0 SR

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/quakes` | List earthquakes (supports `minMag`, `maxMag`, `maxDepth`, `limit`, `offset`, `startDate`, `endDate`) |
| GET | `/api/quakes/latest` | Latest earthquake |
| POST | `/telegram-webhook` | Telegram bot webhook |

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*TremorID — Gempa terkini Indonesia dalam tampilan 3D.* 🇮🇩

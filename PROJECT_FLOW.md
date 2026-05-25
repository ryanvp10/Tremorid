# 🌍 TremorID — Project Flow

> Real-time Indonesia Earthquake Monitor with AI & 3D Visualization

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Webapp   │  │ Telegram │  │  Social  │                  │
│  │ (Browser) │  │   Bot    │  │  Share   │                  │
│  └─────┬─────┘  └─────┬────┘  └─────┬────┘                 │
└────────┼──────────────┼─────────────┼───────────────────────┘
         │              │             │
         ▼              │             │
┌─────────────────┐     │             │
│   NETLIFY       │     │             │
│   Frontend      │     │             │
│   (React+Vite)  │     │             │
│   - 3D Map      │     │             │
│   - Filters     │     │             │
│   - Infographic │     │             │
│   - Am I Safe?  │     │             │
└────────┬────────┘     │             │
         │              │             │
         ▼              ▼             │
┌─────────────────────────────┐       │
│     HUGGINGFACE SPACES      │       │
│       Backend (Node.js)     │       │
│                             │       │
│  ┌───────────────────────┐  │       │
│  │   Express Server       │  │       │
│  │                        │  │       │
│  │  GET  /api/quakes      │  │       │   ┌──────────────┐
│  │  GET  /api/quakes/:id  │◄─┼───────┼──►│   BMKG API   │
│  │  GET  /api/quakes/near │  │       │   │  (data bmkg) │
│  │  GET  /api/ai/summary  │  │       │   └──────────────┘
│  │  POST /api/telegram/   │  │       │
│  │       webhook          │  │       │
│  └───────────────────────┘  │       │
│                             │       │
│  ┌───────────────────────┐  │       │
│  │   SQLite Database      │  │       │   ┌──────────────┐
│  │   - earthquakes        │  │       │──►│ freemodel.dev │
│  │   - subscribers        │  │       │   │  AI Summary   │
│  │   - logs               │  │       │   └──────────────┘
│  └───────────────────────┘  │       │
└──────────────┬──────────────┘       │
               │                      │
               ▼                      ▼
┌──────────────────────────────────────┐
│            GITHUB                     │
│    (ryanvp10/tremorid)               │
│    - Auto-deploy to Netlify           │
│    - Version control for frontend     │
└──────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Guest User Checks Earthquake (Webapp)

```
User opens tremorid.netlify.app
         │
         ▼
3D Map loads (CesiumJS, locked to Indonesia)
         │
         ▼
Map auto-fetches latest quakes from /api/quakes
         │
         ▼
Pins appear on map (color-coded by magnitude)
         │
         ▼
User options:
  ├── Click pin → Popup card (magnitude, depth, time, location)
  ├── Use "Am I Safe?" → type city → see nearby quakes
  ├── Open sidebar → filter by time/magnitude/region
  ├── Scrub timeline → see quakes from last 24h/7d/30d
  └── Click share → download infographic image
```

### Flow 2: Telegram Bot User

```
User messages @TremorIDBot
         │
         ▼
┌────────────────────────────────────────┐
│  /start     → Welcome msg + menu       │
│  /gempa     → Latest earthquake info   │
│  /terkini   → Last 5 earthquakes       │
│  /lokasi    → Quakes near a city       │
│  /berlangganan → Subscribe to alerts   │
│  /hentikan  → Unsubscribe              │
│  /bantuan   → Help menu                │
└────────────────────────────────────────┘
         │
         ▼
Backend processes command
         │
         ▼
Response sent back via Telegram API
```

### Flow 3: Real-Time Auto Alert

```
BMKG publishes new earthquake (≥ 4.0 SR)
         │
         ▼
Backend fetches from BMKG API (every 30s)
         │
         ▼
New quake saved to SQLite
         │
         ▼
AI generates Bahasa Indonesia summary
         │
         ▼
Telegram bot pushes alert to ALL subscribed users
         │
         ▼
Webapp users see new pin appear (auto-refresh)
```

### Flow 4: Share Infographic

```
User clicks "Share" on a quake card
         │
         ▼
Frontend generates infographic image (canvas/html2canvas)
         │
         ▼
includes: map snippet, magnitude, depth, time, location, TremorID watermark
         │
         ▼
Download as PNG OR share to Twitter/WhatsApp
```

---

## Data Pipeline

```
┌────────────┐     ┌──────────────┐     ┌─────────────┐
│  BMKG API  │────►│  Backend     │────►│  SQLite DB  │
│  (XML/JSON)│     │  Fetcher     │     │             │
└────────────┘     │  (cron 30s)  │     │ earthquakes │
                   └──────────────┘     │ subscribers │
                                        │ logs        │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Frontend   │
                                        │  /api/quakes│
                                        │  (GET)      │
                                        └─────────────┘
```

**BMKG Data Flow:**
1. Backend fetches from BMKG API every 30 seconds
2. Parse XML/JSON response
3. Insert new quakes into SQLite (skip duplicates by datetime+location)
4. If magnitude ≥ 4.0 → trigger AI summary + Telegram alert
5. Frontend polls `/api/quakes` every 15 seconds for updates

---

## Feature Breakdown by Week

### Week 1: Foundation
```
✅ GitHub repo + README
✅ React + Vite frontend setup
✅ Node.js + Express backend setup
✅ SQLite schema (earthquakes, subscribers)
✅ BMKG API integration (fetch + parse + store)
✅ Basic API endpoints:
   - GET /api/quakes → list all recent
   - GET /api/quakes/latest → single latest
   - GET /api/quakes/:id → single quake detail
✅ Novus.ai installed on frontend
✅ Deploy backend to HF Spaces
✅ Deploy frontend to Netlify
```

### Week 2: 3D Map
```
✅ CesiumJS 3D map locked to Indonesia
✅ Fetch quakes from backend API
✅ Display pins on 3D map (color-coded)
✅ Pin popup cards (click → details)
✅ Auto-zoom to latest quake
✅ Timeline scrubber (24h/7d/30d)
✅ Sidebar list view
✅ Filter by: time, magnitude, region
✅ Loading states + error handling
```

### Week 3: AI + Infographics
```
✅ AI summary for quakes ≥ 4.0 SR
✅ AI safety tips
✅ Daily digest generation
✅ Shareable infographic image (html2canvas)
✅ Share to Twitter/WhatsApp buttons
✅ "Am I Safe?" feature (city search + 200km radius)
✅ Distance calculation (Haversine formula)
```

### Week 4: Telegram Bot
```
✅ Create @TremorIDBot on Telegram
✅ Telegraf.js webhook mode (HF Spaces compatible)
✅ Bot commands: /start, /gempa, /terkini, /lokasi
✅ Subscribe/unsubscribe system
✅ Push alerts for quakes ≥ 4.0 SR
✅ Stored subscribers in SQLite
✅ Rate limiting (prevent spam)
```

### Week 5: Polish + Deploy
```
✅ UI polish (dark theme, animations)
✅ Mobile responsive
✅ 2D Leaflet fallback for slow devices
✅ Keep-alive ping for HF Spaces
✅ Error handling + edge cases
✅ Testing across browsers
✅ Demo video recording
✅ Hackathon submission
✅ GitHub README with screenshots
```

---

## Database Schema (SQLite)

```sql
-- Earthquakes table
CREATE TABLE earthquakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datetime TEXT NOT NULL,        -- BMKG format: "2025-05-25 04:15:30"
  magnitude REAL NOT NULL,       -- Richter scale
  depth REAL,                    -- in km
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  location TEXT,                 -- Wilayah from BMKG
  felt TEXT,                     -- Dirasakan (felt scale)
  tsunami TEXT,                  -- Potensi tsunami (yes/no)
  ai_summary TEXT,               -- AI generated summary
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(datetime, latitude, longitude)
);

-- Telegram subscribers
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id TEXT NOT NULL UNIQUE,
  username TEXT,
  subscribed_at TEXT DEFAULT (datetime('now')),
  is_active INTEGER DEFAULT 1
);

-- User searches (for analytics)
CREATE TABLE search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT,
  result_count INTEGER,
  searched_at TEXT DEFAULT (datetime('now'))
);
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/quakes` | List all recent quakes (last 30d) | None |
| GET | `/api/quakes/latest` | Latest single earthquake | None |
| GET | `/api/quakes/:id` | Single earthquake detail | None |
| GET | `/api/quakes/near?lat=&lon=&radius=` | Quakes near location | None |
| GET | `/api/ai/summary/:id` | AI summary for a quake | None |
| GET | `/api/ai/digest` | Daily digest | None |
| POST | `/api/telegram/webhook` | Telegram webhook | None |
| GET | `/api/health` | Health check | None |

---

## Repository Structure

```
tremorid/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Map3D.jsx          # CesiumJS 3D map
│   │   │   ├── Map2D.jsx          # Leaflet 2D fallback
│   │   │   ├── QuakeCard.jsx      # Pin popup card
│   │   │   ├── QuakeList.jsx      # Sidebar list
│   │   │   ├── FilterPanel.jsx    # Filters
│   │   │   ├── Timeline.jsx       # Timeline scrubber
│   │   │   ├── AmISafe.jsx        # "Am I Safe?" feature
│   │   │   ├── Infographic.jsx    # Shareable image
│   │   │   └── Navbar.jsx         # Top nav
│   │   ├── hooks/
│   │   │   └── useQuakes.js       # Fetch + cache quakes
│   │   ├── services/
│   │   │   └── api.js             # API calls
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── server.js              # Express + CORS
│   │   ├── db/
│   │   │   └── index.js           # SQLite setup + queries
│   │   ├── routes/
│   │   │   └── quakes.js          # All quake endpoints
│   │   ├── services/
│   │   │   ├── bmkg.js            # BMKG API fetcher
│   │   │   ├── ai.js              # AI summary generator
│   │   │   └── infographic.js     # Image generation helper
│   │   └── telegram/
│   │       └── bot.js             # Telegraf bot
│   ├── package.json
│   └── requirements.txt
│
├── PRD.md
├── PROJECT_FLOW.md
├── .gitignore
└── README.md
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| 3D map library | CesiumJS | Free, powerful, supports terrain |
| 2D fallback | Leaflet.js | Lightweight, fast on mobile |
| Backend hosting | HF Spaces | Free tier, supports Node.js |
| Frontend hosting | Netlify | Free, auto-deploy from GitHub |
| Database | SQLite | File-based, no server needed |
| AI provider | freemodel.dev | Free tier, GPT model |
| Data refresh | 30s polling | BMKG updates ~every 1-5 min |
| Frontend poll | 15s | Smooth UX without hammering API |
| Telegram transport | Webhook | HF Spaces doesn't support polling |

---

## Page Flow (Frontend)

```
Landing Page (3D Map)
  ├── Navbar: Logo | Search city | Language | Telegram connect
  ├── Center: 3D Map with pins
  ├── Right Sidebar: Quake list + Filters
  ├── Bottom: Timeline scrubber
  └── Modals:
      ├── Quake detail card (click pin)
      ├── Am I Safe? (city search)
      └── Download/share infographic
```

---

*TremorID — Gempa terkini Indonesia dalam tampilan 3D.*

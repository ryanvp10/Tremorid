# 🌍 TremorID

> Real-time Indonesia Earthquake Monitor with AI & 3D Visualization

![TremorID](https://img.shields.io/badge/TremorID-Hackathon%202025-red)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 About

TremorID is a real-time earthquake monitoring webapp for Indonesia. Built for the **Everyone Ships Now** hackathon by Mind the Product × Novus.ai.

### Features
- 🗺️ **3D Interactive Map** — CesiumJS globe locked to Indonesia
- 🤖 **AI Summaries** — Auto-generated Bahasa Indonesia earthquake reports
- 📱 **Telegram Bot** — Real-time alerts via @TremorIDBot
- 📍 **Am I Safe?** — Check earthquakes near your city
- 📊 **Shareable Infographics** — One-click share to social media
- ⏱️ **Timeline Scrubber** — Replay earthquakes from last 24h/7d/30d

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React + Vite |
| 3D Map | CesiumJS |
| 2D Fallback | Leaflet.js |
| Backend | Node.js + Express |
| Database | SQLite |
| AI | freemodel.dev |
| Telegram | Telegraf.js |
| Deploy (FE) | Netlify |
| Deploy (BE) | Hugging Face Spaces |
| Data Source | BMKG API |

## 📁 Project Structure

```
tremorid/
├── frontend/          # React + Vite + CesiumJS
├── backend/           # Node.js + Express + SQLite
├── PRD.md             # Product Requirements
├── PROJECT_FLOW.md    # Technical Architecture
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

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

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*TremorID — Gempa terkini Indonesia dalam tampilan 3D.* 🇮🇩

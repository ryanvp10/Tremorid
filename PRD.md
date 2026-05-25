# 🌍 TremorID — Product Requirements Document

> Real-time Indonesia Earthquake Monitor with AI & 3D Visualization
> Hackathon: Everyone Ships Now (Deadline: June 20, 5PM GMT)

---

## 1. Problem Statement

Indonesia sits on the Pacific Ring of Fire — earthquakes happen daily. BMKG provides official data but their website is outdated, slow, and lacks modern features like push notifications, AI summaries, or an intuitive 3D visualization. Existing PlayStore apps are cluttered with ads and offer only basic 2D maps.

---

## 2. Solution

**TremorID** — a real-time earthquake monitoring webapp for Indonesia with:
- 3D interactive map locked to Indonesia
- AI-powered summaries & Telegram alerts
- Clean, mobile-first design

---

## 3. Target Users

| User | Need | How TremorID Helps |
|------|------|---------------------|
| General public | Know if an earthquake happened near them | 3D map + "Am I safe?" feature |
| Journalists | Quick earthquake data for reports | AI summary + infographic |
| Students/researchers | Historical earthquake data | Timeline + filter by magnitude |
| Influencers | Share earthquake info to followers | Shareable infographic image |
| Families | Alert loved ones in affected area | Telegram push notification |

---

## 4. Core Features

### 4.1 3D Map (Hero Feature)
- CesiumJS 3D globe locked to Indonesia view
- Camera positioned to show all Indonesia provinces (Sumatra to Papua)
- Earthquake pins appear with pulse animation on new data
- Color-coded by magnitude:
  - 🟢 Green: 2.0–3.9 SR (minor)
  - 🟡 Yellow: 4.0–4.9 SR (light)
  - 🟠 Orange: 5.0–5.9 SR (moderate)
  - 🔴 Red: 6.0+ SR (strong/major)
- Click pin → popup card with magnitude, depth, time, location, affected cities
- Auto-zoom/pan to latest earthquake (smooth camera transition)
- Depth shown as vertical line or darker shade
- Timeline scrubber at bottom (last 24h / 7d / 30d)

### 4.2 Real-Time Data
- Fetch from BMKG API every 30 seconds
- Auto-refresh map pins without page reload
- Show "last updated" timestamp
- Sound notification for quakes > 5.0 SR (optional, user toggle)

### 4.3 AI Engine (via freemodel.dev or similar)
- Auto-generate Bahasa Indonesia summary of each significant quake (≥ 4.0 SR)
  - Example: "Gempa magnitudo 5.2 terjadi di Sulawesi Tengah, kedalaman 10km. Tidak berpotensi tsunami."
- AI-generated safety tips after strong quakes
- Daily earthquake digest ("Hari ini ada 12 gempa di Indonesia, terbesar 5.8 SR di Maluku")
- Weekly summary infographic (auto-generated)

### 4.4 "Am I Safe?" Feature
- User types their city name
- App shows all earthquakes within 200km radius
- Distance and estimated impact level
- Color indicator: Safe / Caution / Danger
- Works without login (guest mode)

### 4.5 Shareable Infographic
- Auto-generated image for each significant earthquake (≥ 5.0 SR)
- Includes: map pin, magnitude, depth, time, location, safety status
- One-click share to Twitter/WhatsApp
- Branded with TremorID watermark

### 4.6 Telegram Bot
- `@TremorIDBot`
- Auto-alert on earthquakes ≥ 4.0 SR
- Commands:
  - `/gempa` — latest earthquake
  - `/terkini` — last 5 earthquakes
  - `/lokasi [kota]` — earthquakes near a city
  - `/berlangganan` — subscribe to alerts
  - `/hentikan` — unsubscribe
- Push notifications to subscribed users

### 4.7 Earthquake List & Filter
- Sidebar list of recent earthquakes
- Filter by:
  - Time range (24h / 7d / 30d)
  - Magnitude range
  - Province/region
- Sort by: time (newest), magnitude (strongest), depth
- Search by location name

---

## 5. Out of Scope (v1)

- User accounts/login — v1 is public/guest only
- Mobile app (Android/iOS) — webapp only for now
- Historical data beyond 30 days
- Predictive earthquake AI (too complex for 5 weeks)
- BMKG data submission (read-only)

---

## 6. Tech Stack

| Layer | Tool | Reason |
|-------|------|--------|
| Frontend | React + Vite | Fast, modern, your existing skill |
| 3D Map | CesiumJS | Free, powerful 3D globe |
| 2D fallback | Leaflet.js | If 3D too slow on mobile |
| Backend | Node.js + Express | Same as tracker project |
| Database | SQLite | Lightweight, no server needed |
| AI | freemodel.dev API | Free tier, GPT model |
| Telegram | Telegraf.js | Your existing skill |
| Deploy Frontend | Netlify | Free, auto-deploy from GitHub |
| Deploy Backend | Hugging Face Spaces | Free tier |
| Data Source | BMKG API (data.bmkg.go.id) | Official, free, real-time |

---

## 7. Data Source Details

**BMKG API endpoints:**
- Latest quakes: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.xml`
- Felt quakes: `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.xml`
- Real-time: `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`

**Data fields per earthquake:**
- `Tanggal` + `Jam` → datetime
- `Magnitude` → Richter scale
- `Kedalaman` → depth in km
- `Lintang` + `Bujur` → lat/lon coordinates
- `Wilayah` → location name
- `Dirasakan` → shaking intensity (felt scale)
- `Potensi` → tsunami potential (yes/no)

---

## 8. UI/UX Requirements

### Desktop
- Full 3D map on left (70% width)
- Sidebar on right (30%) with list + filters + details
- Timeline scrubber at bottom
- Top navbar with search + Telegram connect button

### Mobile
- 3D map full screen
- Bottom sheet for list (swipe up)
- Floating action button for "Am I Safe?"
- Collapsible filter panel

### Color Scheme
- Dark theme (map-friendly, professional)
- Background: #0a0a1a
- Primary: #ff4444 (red, earthquake theme)
- Secondary: #ffd700 (gold/amber for warnings)
- Text: #ffffff with #a0a0cc for secondary

### Tone
- Bahasa Indonesia (primary)
- English (secondary, toggle)
- Professional but approachable
- Emergency info = clear, direct, no jargon

---

## 9. Project Timeline (5 weeks)

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Setup + Data pipeline | Project init, BMKG API integration, DB, basic backend |
| 2 | Frontend + 3D map | React app, CesiumJS 3D map, earthquake pins |
| 3 | AI + Infographics | AI summary generation, shareable images |
| 4 | Telegram + Alerts | Telegram bot, push notifications |
| 5 | Polish + Deploy | Testing, UI polish, deploy, hackathon submission |

---

## 10. Hackathon Submission Checklist

- [ ] Live deployed URL (Netlify frontend + HF backend)
- [ ] 2-3 min demo video (screen recording + voiceover)
- [ ] Novus.ai dashboard screenshot (install on frontend)
- [ ] Written description (Bahasa Indonesia + English)
- [ ] GitHub repo (public, clean README)
- [ ] Optional: LinkedIn post about the project

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Page load time | < 3 seconds |
| Data freshness | < 30 seconds from BMKG |
| 3D map smoothness | 60fps on desktop, 30fps on mobile |
| AI summary generation | < 5 seconds |
| Telegram alert delay | < 60 seconds after BMKG update |

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| BMKG API down | Low | High | Cache last known data, show warning |
| CesiumJS heavy on mobile | Medium | High | Offer 2D Leaflet fallback |
| HF Spaces cold start | Medium | Medium | Keep-alive ping every 5 min |
| Hackathon Novus requirement | Certain | Low | Install early in week 1 |

---

*TremorID — Gempa terkini Indonesia dalam tampilan 3D.*

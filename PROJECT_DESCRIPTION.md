# TremorID — Project Description

## English

**TremorID** is a real-time earthquake monitoring platform for Indonesia, built to keep people informed about seismic activity happening around them — instantly.

### The Problem

Indonesia sits on the Pacific Ring of Fire, experiencing thousands of earthquakes every year. Despite this, most people have no idea when nearby earthquakes occur. Official BMKG data exists but is buried in XML feeds that normal people never check. There's no simple, modern way for Indonesians to stay aware of earthquake activity in their region.

### The Solution

TremorID turns raw BMKG earthquake data into three accessible touchpoints:

1. **Interactive 2D & 3D Map** — A web app (tremorid.netlify.app) that plots every recent earthquake on a map using Leaflet (2D) and CesiumJS (3D globe). Users can tap any marker to see magnitude, depth, location, time, and tsunami potential.

2. **AI-Powered Telegram Bot** — A conversational bot (@TremorIDBot) that answers natural-language questions about earthquakes. Users can ask "Any quakes near Jakarta?" or "Was there a tsunami today?" and get instant, formatted responses powered by AI with real BMKG data context.

3. **Real-Time Push Alerts** — Users subscribe with /start and automatically receive alerts when any earthquake of magnitude 5.0+ SR strikes anywhere in Indonesia. No checking required — the information comes to them.

### Technical Architecture

- **Data Pipeline:** BMKG XML feeds → Node.js fetcher (every 5 min) → SQLite database
- **Backend:** Express.js REST API deployed on Hugging Face Spaces (port 7860)
- **Frontend:** React 18 + Vite, Leaflet for 2D map, CesiumJS for 3D globe, deployed on Netlify
- **Telegram Bot:** Telegraf.js polling bot running standalone on cloud VM (HF Spaces blocks outbound HTTPS to Telegram)
- **AI:** OpenRouter API (owl-alpha free model) for conversational chat, with last 10 quakes injected as context per message
- **Analytics:** Novus.ai integrated for user interaction tracking

### What Makes It Different

- **Real BMKG data**, not third-party aggregators
- **AI chat** that understands natural language — no commands needed
- **3D globe visualization** — see earthquake depth and location in true geographic context
- **Zero friction** — subscribe once, get alerts forever
- **Free to use** — no accounts, no paywalls

### Built With

React 18, Vite, Leaflet, CesiumJS, Node.js, Express, SQLite, Telegraf, OpenRouter, Hugging Face Spaces, Netlify, Novus.ai

---

## Bahasa Indonesia

**TremorID** adalah platform pemantauan gempa bumi real-time untuk Indonesia, dibuat agar masyarakat tetap mengetahui aktivitas seismik di sekitar mereka — secara instan.

### Masalah

Indonesia berada di Cincin Api Pasifik, mengalami ribuan gempa bumi setiap tahun. Namun, kebanyakan orang tidak tahu kapan gempa terjadi di dekat mereka. Data resmi BMKG tersedia tetapi tersembunyi dalam format XML yang tidak pernah diperiksa oleh masyarakat umum.

### Solusi

TremorID mengubah data mentah BMKG menjadi tiga titik akses yang mudah:

1. **Peta Interaktif 2D & 3D** — Aplikasi web (tremorid.netlify.app) yang menampilkan setiap gempa terkini menggunakan Leaflet (2D) dan CesiumJS (3D globe). Pengguna bisa tap marker untuk melihat magnitudo, kedalaman, lokasi, waktu, dan potensi tsunami.

2. **Bot Telegram Berbasis AI** — Bot percakapan (@TremorIDBot) yang menjawab pertanyaan bahasa alami tentang gempa. Pengguna bisa tanya "Ada gempa di Jakarta?" dan dapatkan jawaban instan yang terformat dengan data BMKG real-time.

3. **Notifikasi Push Real-Time** — Pengguna cukup subscribe dengan /start dan otomatis mendapat notifikasi saat gempa berkekuatan 5.0+ SR terjadi di mana pun di Indonesia.

### Teknologi

React 18, Vite, Leaflet, CesiumJS, Node.js, Express, SQLite, Telegraf, OpenRouter, Hugging Face Spaces, Netlify, Novus.ai

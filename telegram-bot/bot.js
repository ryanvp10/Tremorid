/**
 * TremorID Telegram Bot - Standalone runner
 * Runs on this VM (not HF Spaces) to avoid HF's network restrictions
 * Fetches earthquake data from the HF Space API
 */
require('dotenv').config({ path: '/home/ubuntu/tremorid/backend/.env' });

const { Telegraf } = require('telegraf');
const Database = require('better-sqlite3');
const path = require('path');

const HF_API_URL = process.env.HF_API_URL || 'https://ryanvp10-tremorid-api.hf.space';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DB_PATH = path.join(__dirname, 'bot.db');

if (!BOT_TOKEN || BOT_TOKEN === 'your_telegram_bot_token_here') {
  console.error('[FATAL] No TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

// --- Local SQLite for subscribers ---
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS subscribers (
    chat_id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    subscribed_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1
  )
`);

const addSubscriber = db.prepare('INSERT OR REPLACE INTO subscribers (chat_id, username, first_name, is_active) VALUES (?, ?, ?, 1)');
const removeSubscriber = db.prepare('UPDATE subscribers SET is_active = 0 WHERE chat_id = ?');
const getActiveSubscribers = db.prepare('SELECT chat_id FROM subscribers WHERE is_active = 1');

// --- Bot ---
const bot = new Telegraf(BOT_TOKEN);
const chatRateLimiter = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

bot.start(async (ctx) => {
  try {
    const { chat, from } = ctx.message;
    addSubscriber.run(chat.id, from.username || '', from.first_name || '');
    await ctx.reply(
      '🌋 Welcome to TremorID Bot!\n\n' +
      "You're now subscribed to earthquake alerts (≥ 5.0 SR).\n\n" +
      'Try asking:\n' +
      '• What is the latest earthquake?\n' +
      '• Any earthquakes near Jakarta?\n' +
      '• Was there a tsunami today?\n\n' +
      'Type /help for more examples.\n\n' +
      '🔗 Web app: https://tremorid.netlify.app'
    );
  } catch (e) {
    console.error('[BOT] start error:', e.message);
  }
});

bot.help(async (ctx) => {
  try {
    await ctx.reply(
      '🌋 TremorID Bot\n\n' +
      'Ask me naturally about earthquakes:\n' +
      "• What's the latest earthquake?\n" +
      '• Any quakes near Surabaya?\n' +
      '• Biggest earthquake this week?\n' +
      '• Was there a tsunami today?\n\n' +
      'Commands: /start /help /unsubscribe\n\n' +
      '🔗 Web app: https://tremorid.netlify.app'
    );
  } catch (e) {
    console.error('[BOT] help error:', e.message);
  }
});

bot.command('unsubscribe', async (ctx) => {
  try {
    removeSubscriber.run(ctx.message.chat.id);
    await ctx.reply('🔕 Unsubscribed from alerts. Type /start to subscribe again.');
  } catch (e) {
    console.error('[BOT] unsubscribe error:', e.message);
  }
});

bot.on('text', async (ctx) => {
  try {
    const userMessage = ctx.message.text;
    const chatId = ctx.message.chat.id;
    if (userMessage.startsWith('/')) return;
    if (userMessage.length > 500) {
      await ctx.reply('Message too long, please keep it under 500 characters.');
      return;
    }

    const now = Date.now();
    const recent = (chatRateLimiter.get(chatId) || []).filter(t => now - t < 60000);
    if (recent.length >= 10) {
      chatRateLimiter.set(chatId, recent);
      return ctx.reply('You are sending messages too quickly. Please wait a moment.');
    }
    recent.push(now);
    chatRateLimiter.set(chatId, recent);

    // Get quake data from HF Space
    const quakesRes = await fetch(`${HF_API_URL}/api/quakes?limit=10`);
    const quakes = await quakesRes.json();
    const quakeContext = quakes.length
      ? quakes.map((q, i) =>
          `${i + 1}. datetime: ${q.datetime}, magnitude: ${q.magnitude}, location: ${q.location || 'Unknown'}, depth: ${q.depth}km, tsunami: ${q.tsunami || 'Unknown'}`
        ).join('\n')
      : 'No recent earthquake data available.';

    const currentDatetime = new Date().toISOString();
    const systemPrompt = `You are TremorID, an earthquake information assistant for Indonesia powered by real BMKG data.

RULES:
- ALWAYS reply in English ONLY — NEVER use Bahasa Indonesia or any other language
- If user writes in Indonesian, STILL reply in English
- ONLY answer questions related to earthquakes, tsunamis, seismic activity, or BMKG data
- If user asks about anything else, politely decline: "I'm TremorID 🌋, your earthquake info assistant. I can only help with earthquake-related questions."

STRICT OUTPUT FORMAT — Follow this EXACT template for every quake listed:
📍 Location name
📊 Magnitude: M[number]
📏 Depth: [number] km
🕐 Time: DD/MM/YYYY, HH:MM [WIB/WITA/WIT]
🌊 Tsunami potential: [Yes/No/Unknown]

Rules for the format:
- Each quake MUST be separated by a blank line
- Always use the emoji prefix for each line exactly as shown above
- NEVER use bullet points (-), asterisks (*), or markdown bold (**)
- NEVER use HTML tags — just plain text with emoji
- Date format: DD/MM/YYYY
- Time zone: WIB (Java/Sumatra), WITA (Bali/Sulawesi/Kalimantan), WIT (Papua)
- If no quakes match the query, say so plainly without any quake data format
- Keep responses concise — max 3-5 quakes listed

CURRENT EARTHQUAKE DATA (last 10 from BMKG):
${quakeContext}

Current datetime: ${currentDatetime}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    // Call OpenRouter (free model)
    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://tremorid.netlify.app',
        'X-Title': 'TremorID',
      },
      body: JSON.stringify({
        model: 'openrouter/owl-alpha',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    const aiData = await aiRes.json();
    if (aiData.error) {
      console.error('[BOT] AI error:', JSON.stringify(aiData.error));
      await ctx.reply('Sorry, the AI service is temporarily unavailable. Please try again later.');
      return;
    }
    // Some models put output in reasoning field instead of content
    const replyContent = aiData.choices?.[0]?.message?.content || aiData.choices?.[0]?.message?.reasoning || 'Sorry, could not generate a response.';
    await ctx.reply(replyContent.slice(0, 4000));
  } catch (e) {
    console.error('[BOT] text error:', e.message);
    await ctx.reply('Sorry, something went wrong. Please try again later.');
  }
});

// --- Alert polling: check HF Space for new quakes every 60s ---
let lastAlertDatetime = null;

// Load last alerted datetime from file on startup
try {
  const fs = require('fs');
  lastAlertDatetime = fs.readFileSync('/tmp/last_alert.txt', 'utf8').trim();
  console.log('[ALERT] Loaded lastAlertDatetime:', lastAlertDatetime);
} catch (e) {
  console.log('[ALERT] No previous lastAlertDatetime, starting fresh');
}

function formatWIB(datetimeStr) {
  // Parse UTC datetime and convert to WIB (UTC+7)
  const utc = new Date(datetimeStr);
  const wib = new Date(utc.getTime() + 7 * 60 * 60 * 1000);
  const dd = String(wib.getUTCDate()).padStart(2, '0');
  const mm = String(wib.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = wib.getUTCFullYear();
  const hh = String(wib.getUTCHours()).padStart(2, '0');
  const min = String(wib.getUTCMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}, ${hh}:${min} WIB`;
}

async function checkAlerts() {
  try {
    const res = await fetch(`${HF_API_URL}/api/quakes/latest`);
    const quake = await res.json();
    if (!quake || !quake.datetime) {
      process.stderr.write(`[ALERT] No quake data\n`);
      return;
    }
    process.stderr.write(`[ALERT] Check: M${quake.magnitude} at ${quake.datetime} | last: ${lastAlertDatetime}\n`);

    // Only alert if this is a new quake we haven't seen
    if (quake.datetime !== lastAlertDatetime && quake.magnitude >= 5.0) {
      lastAlertDatetime = quake.datetime;
      try { require('fs').writeFileSync('/tmp/last_alert.txt', quake.datetime); } catch(e) {}
      const subs = getActiveSubscribers.all();
      process.stderr.write(`[ALERT] NEW quake M${quake.magnitude} >= 5.0! Subs: ${subs.length}\n`);
      if (subs.length === 0) return;

      const msg =
        `🌋 <b>EARTHQUAKE ALERT — Indonesia</b>\n\n` +
        `📍 ${quake.location || 'Unknown'}, Indonesia\n` +
        `📊 <b>Magnitude ${quake.magnitude} SR</b>\n` +
        `📏 Depth: ${quake.depth || '?'} km\n` +
        `🕐 ${formatWIB(quake.datetime)}\n` +
        `🌊 ${quake.tsunami || 'Unknown'}`;

      for (const sub of subs) {
        try {
          await bot.telegram.sendMessage(sub.chat_id, msg, { parse_mode: 'HTML' });
          process.stderr.write(`[ALERT] Sent to ${sub.chat_id}\n`);
          await sleep(100);
        } catch (e) {
          process.stderr.write(`[ALERT] Error: ${e.message}\n`);
        }
      }
    } else {
      process.stderr.write(`[ALERT] Skip: already alerted or below threshold\n`);
    }
  } catch (e) {
    process.stderr.write(`[ALERT] Check error: ${e.message}\n`);
  }
}

bot.launch().then(() => {
  console.log('[BOT] Telegram bot polling started (standalone runner)');
  // Start alert polling loop
  scheduleAlertCheck();
}).catch(err => {
  console.error('[BOT] Launch failed:', err.message);
  process.exit(1);
});

// Alert polling loop using recursive setTimeout
function scheduleAlertCheck() {
  setTimeout(async () => {
    await checkAlerts();
    scheduleAlertCheck();
  }, 60000);
}

process.on('SIGTERM', () => { bot.stop('SIGTERM'); process.exit(0); });
process.on('SIGINT', () => { bot.stop('SIGINT'); process.exit(0); });

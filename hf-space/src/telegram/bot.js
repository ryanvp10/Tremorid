// DEBUG: bot.js loaded — commit e4fda66 — 2026-06-17
const { Telegraf } = require('telegraf');
const db = require('../db');
const { addSubscriber, removeSubscriber, getAllQuakes } = db;
const { generateChatResponse } = require('../services/ai');
const { HttpsProxyAgent } = require('https-proxy-agent');

const chatRateLimiter = new Map();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let bot = null;

function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'your_telegram_bot_token_here') {
    console.log('[BOT] No TELEGRAM_BOT_TOKEN set, bot disabled');
    return null;
  }

  try {
    // Use proxy agent if HTTPS_PROXY is set (HF Spaces blocks direct HTTPS to Telegram)
    const proxyUrl = process.env.HTTPS_PROXY;
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    bot = new Telegraf(token, {
      telegram: { agent },
      handlerTimeout: 10000,
    });

    bot.start(async (ctx) => {
      try {
        const { chat, from } = ctx.message;
        addSubscriber(chat.id, from.username, from.first_name);
        await ctx.reply(
          '🌋 Welcome to TremorID Bot!\n\n' +
          "You're now subscribed to earthquake alerts (≥ 5.0 SR).\n\n" +
          'Try asking:\n' +
          '• What is the latest earthquake?\n' +
          '• Any earthquakes near Jakarta?\n' +
          '• Was there a tsunami today?\n\n' +
          'Type /help for more examples.'
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
          'Commands: /start /help /unsubscribe'
        );
      } catch (e) {
        console.error('[BOT] help error:', e.message);
      }
    });

    bot.command('unsubscribe', async (ctx) => {
      try {
        removeSubscriber(ctx.message.chat.id);
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
        const windowMs = 60 * 1000;
        const maxRequestsPerWindow = 10;
        const recentRequests = (chatRateLimiter.get(chatId) || []).filter(
          (timestamp) => now - timestamp < windowMs
        );

        if (recentRequests.length >= maxRequestsPerWindow) {
          chatRateLimiter.set(chatId, recentRequests);
          await ctx.reply('You are sending messages too quickly. Please wait a moment and try again.');
          return;
        }

        recentRequests.push(now);
        chatRateLimiter.set(chatId, recentRequests);

        const quakes = getAllQuakes(10);
        const quakeContext = quakes.length
          ? quakes
              .map((quake, index) => (
                `${index + 1}. datetime: ${quake.datetime}, magnitude: ${quake.magnitude}, location: ${quake.location || 'Unknown'}, depth: ${quake.depth ?? 'Unknown'}, tsunami: ${quake.tsunami || 'Unknown'}`
              ))
              .join('\n')
          : 'No recent earthquake data available.';

        const aiResponse = await generateChatResponse(userMessage, quakeContext);
        await ctx.reply(aiResponse.slice(0, 4000));
      } catch (e) {
        console.error('[BOT] text handler error:', e.message, '| stack:', e.stack?.split('\n').slice(0,3).join(' | '));
        await ctx.reply('Sorry, something went wrong. Please try again later.');
      }
    });

    console.log('[BOT] Telegram bot initialized' + (proxyUrl ? ' (proxy mode)' : ''));
    return bot;
  } catch (e) {
    console.error('[BOT] Failed to initialize bot:', e.message);
    bot = null;
    return null;
  }
}

function getBot() {
  return bot;
}

function formatAlertTime(isoStr) {
  if (!isoStr) return 'Unknown';
  try {
    const d = new Date(isoStr);
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const dd = String(wib.getUTCDate()).padStart(2, '0');
    const mm = String(wib.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = wib.getUTCFullYear();
    const hh = String(wib.getUTCHours()).padStart(2, '0');
    const min = String(wib.getUTCMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min} WIB`;
  } catch {
    return isoStr;
  }
}

function formatTsunami(text) {
  if (!text) return 'Unknown';
  const t = String(text).toLowerCase();
  if (t.includes('tidak') || t.includes('no tsunami') || t.includes('not')) return 'No tsunami potential';
  if (t.includes('potensi') || t.includes('potential') || t.includes('ada') || t.includes('yes')) return '⚠️ TSUNAMI POTENTIAL';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

async function broadcastAlert(quake) {
  if (!bot) return;

  const subscribers = typeof db.getAllSubscribers === 'function'
    ? db.getAllSubscribers()
    : db.getSubscribers();

  const message =
    `🌋 <b>EARTHQUAKE ALERT — Indonesia</b>\n\n` +
    `📍 ${quake.location || 'Unknown'}, Indonesia\n` +
    `📊 <b>Magnitude ${quake.magnitude} SR</b>\n` +
    `📏 Depth: ${quake.depth || '?'} km\n` +
    `🕐 ${formatAlertTime(quake.datetime)}\n` +
    `🌊 ${formatTsunami(quake.tsunami)}`;

  for (const subscriber of subscribers) {
    const chatId = parseInt(subscriber.chat_id || subscriber.chatId);
    try {
      await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
      await sleep(100);
    } catch (error) {
      console.error('[BOT] broadcastAlert error:', error);
    }
  }
}

function getBotWebhookHandler() {
  if (!bot) return null;
  return bot.webhookCallback('/api/telegram-webhook');
}

module.exports = { initBot, getBot, broadcastAlert, getBotWebhookHandler };

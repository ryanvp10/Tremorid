'use strict'
const { Telegraf } = require('telegraf')
const { getAllQuakes } = require('../db')
const { generateChatResponse } = require('../services/ai')

let bot = null

function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) { console.warn('[BOT] TELEGRAM_BOT_TOKEN not set'); return null }
  bot = new Telegraf(token)
  bot.start(async (ctx) => { try { const chatId = ctx.chat.id; const username = ctx.from.username || ''; const db = require('../db'); if (db.addSubscriber) { db.addSubscriber(chatId, username) } else { db.db.prepare('INSERT OR REPLACE INTO subscribers (chat_id, username, is_active) VALUES (?, ?, 1)').run(chatId, username) } await ctx.reply("🌋 Welcome to TremorID Bot!\n\nI'm your earthquake information assistant for Indonesia. Real-time BMKG data.\n\nYou're now subscribed to alerts (≥ 5.0 SR).\n\nTry asking:\n• What's the latest earthquake?\n• Any earthquakes near Jakarta?\n• Was there a tsunami today?\n\nType /help for more examples.") } catch(e) { console.error('[BOT] start error:', e.message) } })
  bot.help(async (ctx) => { try { await ctx.reply("🌋 TremorID Bot\n\nAsk me naturally about earthquakes:\n• What's the latest earthquake?\n• Any quakes near Surabaya?\n• Biggest earthquake this week?\n• Was there a tsunami today?\n\nCommands: /start /help /unsubscribe\n\nData from BMKG • Updated every 5 min") } catch(e) { console.error('[BOT] help error:', e.message) } })
  bot.command('unsubscribe', async (ctx) => { try { const chatId = ctx.chat.id; const db = require('../db'); if (db.removeSubscriber) { db.removeSubscriber(chatId) } else { db.db.prepare('UPDATE subscribers SET is_active = 0 WHERE chat_id = ?').run(chatId) } await ctx.reply("🔕 Unsubscribed from alerts. Type /start to subscribe again.") } catch(e) { console.error('[BOT] unsubscribe error:', e.message) } })
  bot.on('text', async (ctx) => { try { const text = ctx.message.text?.trim(); if (!text || text.startsWith('/')) return; const quakes = getAllQuakes(10); const quakeContext = quakes.map(q => q.datetime + ' — M' + q.magnitude + ' — ' + (q.location || 'unknown') + ' — Depth: ' + (q.depth || '?') + 'km — ' + (q.tsunami || 'no tsunami')).join('\n'); const reply = await generateChatResponse(text, quakeContext); await ctx.reply(reply, { parse_mode: 'Markdown' }) } catch(e) { console.error('[BOT] text error:', e.message); try { await ctx.reply("Sorry, having trouble right now. Please try again later.") } catch {} } })
  bot.launch()
  console.log('[BOT] Telegram bot initialized')
  return bot
}

function getBotWebhookHandler() {
  if (bot) return bot.webhookCallback('/telegram-webhook')
  return (req, res) => res.sendStatus(200)
}

function getBot() {
  return bot
}

module.exports = { initBot, getBot, getBotWebhookHandler }

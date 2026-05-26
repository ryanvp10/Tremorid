// AI service — freemodel.dev API wrapper for TremorID earthquake bot

function getApiKey() {
  const key = process.env.FREEMODEL_API_KEY
  if (!key) throw new Error('FREEMODEL_API_KEY not set')
  return key
}

/**
 * Generic chat completion call.
 * @param {{role: string, content: string}[]} messages
 * @returns {Promise<string>} assistant reply text
 */
async function askAI(messages) {
  const apiKey = getApiKey()
  try {
    const res = await fetch('https://api.freemodel.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.5',
        messages,
        temperature: 0.7,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
    return data.choices[0].message.content
  } catch (err) {
    console.error('[ai.js] askAI error:', err.message)
    throw err
  }
}

/**
 * Generate a conversational reply for the Telegram bot.
 * @param {string} userMessage  - raw user text (Indonesian or English)
 * @param {string} quakeContext - pre-formatted string of the last 10 earthquakes
 * @returns {Promise<string>} reply in English
 */
async function generateChatResponse(userMessage, quakeContext) {
  const now = new Date().toISOString()
  const systemPrompt = `You are TremorID, an earthquake information assistant for Indonesia powered by real BMKG data.

RULES:
- ALWAYS reply in English, even if user writes in Indonesian
- ONLY answer questions related to earthquakes, tsunamis, seismic activity, or BMKG data
- If user asks about anything else, politely decline:
  "I'm TremorID 🌋, your earthquake info assistant. I can only help with earthquake-related questions. Try asking 'What's the latest earthquake?' or 'Any quakes near Jakarta?'"
- Be concise and friendly. Use emoji sparingly (🌋 📍 📊 📏 🕐 🌊 🔔)
- If earthquake data is available, include: location, magnitude, depth, time, tsunami potential
- If no data matches the user's query, say so honestly

CURRENT EARTHQUAKE DATA (last 10 from BMKG):
${quakeContext}

Current datetime: ${now}`

  return askAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ])
}

/**
 * Generate a brief 1-2 sentence public summary for a single earthquake.
 * @param {{magnitude, depth, location, datetime, tsunami, felt}} quake
 * @returns {Promise<string>} English summary
 */
async function generateQuakeSummary(quake) {
  const systemPrompt =
    'Write a brief 1-2 sentence English summary of this earthquake for the Indonesian public. Include magnitude, location, depth, and tsunami potential. Keep it clear and calm.'

  return askAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(quake) },
  ])
}

module.exports = { askAI, generateChatResponse, generateQuakeSummary }

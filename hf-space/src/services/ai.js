// AI service — HuggingFace Inference API (free, no IP limits)
// Falls back to Freemodel.dev if HF_API_KEY not set

function getApiKey() {
  // HF_TOKEN is auto-injected by HF Spaces; FREEMODEL_API_KEY as fallback
  const key = process.env.HF_TOKEN || process.env.HF_API_KEY || process.env.FREEMODEL_API_KEY
  if (!key) throw new Error('HF_TOKEN, HF_API_KEY, or FREEMODEL_API_KEY not set')
  return key
}

async function askAI(messages) {
  const apiKey = getApiKey()
  try {
    // Use HF Inference API — free, no IP-based account limits
    const res = await fetch(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages,
          max_tokens: 512,
          temperature: 0.2,
        }),
      }
    )
    const data = await res.json()
    if (!res.ok) {
      // Fallback to Freemodel.dev if HF fails
      if (process.env.FREEMODEL_API_KEY) {
        console.log('[ai.js] HF Inference failed, trying Freemodel.dev fallback')
        return askAIFreemodel(messages)
      }
      throw new Error(data.error?.message || `HTTP ${res.status}`)
    }
    return data.choices[0].message.content
  } catch (err) {
    console.error('[ai.js] askAI error:', err.message)
    throw err
  }
}

async function askAIFreemodel(messages) {
  const res = await fetch('https://api.freemodel.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FREEMODEL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.5',
      messages,
      temperature: 0.2,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return data.choices[0].message.content
}

// eslint-disable-next-line no-unused-vars
async function generateChatResponse(userMessage, quakeContext) {
  const now = new Date().toISOString()
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

Current datetime: ${now}`

  return askAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ])
}

async function generateQuakeSummary(quake) {
  const systemPrompt =
    'Write a brief 1-2 sentence English summary of this earthquake for the Indonesian public. Include magnitude, location, depth, and tsunami potential. Keep it clear and calm.'

  return askAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(quake) },
  ])
}

module.exports = { askAI, generateChatResponse, generateQuakeSummary }

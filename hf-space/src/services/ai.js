// AI service — OpenRouter (free model)

async function askAI(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.FREEMODEL_API_KEY
  if (!apiKey) throw new Error('No AI API key set')

  // Use OpenRouter if available, fallback to freemodel.dev
  if (process.env.OPENROUTER_API_KEY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://tremorid.netlify.app',
        'X-Title': 'TremorID',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 500,
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(JSON.stringify(data.error))
    return data.choices[0].message.content
  }

  // Legacy freemodel.dev fallback
  const res = await fetch('https://api.freemodel.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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

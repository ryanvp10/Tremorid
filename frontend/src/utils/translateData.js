const directionMap = {
  utara: 'North',
  selatan: 'South',
  barat: 'West',
  timur: 'East',
  'barat daya': 'Southwest',
  tenggara: 'Southeast',
  'timur laut': 'Northeast',
  'barat laut': 'Northwest',
}

const landSeaMap = {
  '(Laut)': '(Sea)',
  '(laut)': '(Sea)',
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/**
 * Translate parsed Wilayah location string to English.
 * "36 km Selatan NABIRE" → "36 km South of NABIRE"
 * "22 km Tenggara SARMI (Laut)" → "22 km Southeast of SARMI (Sea)"
 */
export function translateLocation(parsed, lang) {
  if (!parsed || lang !== 'en') return parsed

  let result = parsed

  // Replace directions (try longer phrases first so "barat laut" beats "barat")
  const dirs = Object.keys(directionMap).sort((a, b) => b.length - a.length)
  for (const id of dirs) {
    const en = directionMap[id]
    const regex = new RegExp(id, 'gi')
    result = result.replace(regex, en)
  }

  // Replace Laut → Sea
  result = result.replace(/\(Laut\)/gi, '(Sea)')

  // Add "of" before the location name: "36 km South NABIRE" → "36 km South of NABIRE"
  // Pattern: distance + direction + location name
  result = result.replace(
    /(\d+\s*km\s+(?:North|South|East|West|Southwest|Southeast|Northeast|Northwest))\s+([A-Z][A-Z\s()]+(?:\(Sea\))?)/,
    '$1 of $2'
  )

  return result
}

/**
 * Translate BMKG Potensi (tsunami potential) string.
 */
export function translatePotensi(text, lang) {
  if (!text || lang !== 'en') return text

  const map = {
    'tidak ada tsunami': 'No tsunami risk',
    'potensi tsunami': 'Tsunami potential',
    'tidak berpotensi tsunami': 'No tsunami potential',
    'berpotensi tsunami': 'Tsunami potential',
  }

  const lower = text.toLowerCase().trim()
  for (const [id, en] of Object.entries(map)) {
    if (lower.includes(id)) return en
  }
  return text
}

/**
 * Translate BMKG Dirasakan (felt report) string.
 * "Dirasakan (Skala MMI): II-III Ambon" → "Felt (MMI Scale): II-III Ambon"
 */
export function translateDirasakan(text, lang) {
  if (!text || lang !== 'en') return text

  let result = text
  result = result.replace(/Dirasakan/i, 'Felt')
  result = result.replace(/Skala\s+MMI/i, 'MMI Scale')
  return result
}

/**
 * Translate depth string.
 * "10 km" → "10 km" (same), "Kedalaman: 10 km" → "Depth: 10 km"
 */
export function translateDepth(text, lang) {
  if (!text || lang !== 'en') return text
  return result.replace(/Kedalaman/i, 'Depth')
}

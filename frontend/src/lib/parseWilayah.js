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

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function cleanLoc(s) {
  return s.trim().toUpperCase().replace(/\s+/g, ' ')
}

function translateDirection(text, lang) {
  if (lang !== 'en') return text
  let result = text
  // Sort by length desc so "barat laut" matches before "barat"
  const dirs = Object.keys(directionMap).sort((a, b) => b.length - a.length)
  for (const id of dirs) {
    const en = directionMap[id]
    result = result.replace(new RegExp(id, 'gi'), en)
  }
  return result
}

function addOfPreposition(text) {
  // "36 km South NABIRE" → "36 km South of NABIRE"
  return text.replace(
    /(\d+\s*km\s+(?:North|South|East|West|Southwest|Southeast|Northeast|Northwest))\s+([A-Z][A-Z\s()]+(?:\(Sea\))?)/,
    '$1 of $2'
  )
}

/**
 * Parse BMKG Wilayah string into clean format.
 * Optionally translate to English when lang='en'.
 *
 * Input:  "Pusat gempa berada di darat 36 km selatan Nabire"
 * Output (id): "36 km Selatan NABIRE"
 * Output (en): "36 km South of NABIRE"
 *
 * Input:  "Pusat gempa berada di laut 22 km tenggara Sarmi"
 * Output (id): "22 km Tenggara SARMI (Laut)"
 * Output (en): "22 km Southeast of SARMI (Sea)"
 */
export function parseWilayah(wilayah, lang) {
  if (!wilayah || typeof wilayah !== 'string') return wilayah

  const text = wilayah.trim()

  // Match: "... darat X km direction Location" (on land)
  const landMatch = text.match(
    /darat\s+(\d+(?:\.\d+)?)\s*km\s+(utara|selatan|barat|timur|barat daya|tenggara|timur laut|barat laut)\s+(.+)/i
  )
  if (landMatch) {
    const dist = landMatch[1]
    const dir = capitalize(landMatch[2])
    const loc = cleanLoc(landMatch[3])
    const translatedDir = translateDirection(dir, lang)
    const base = `${dist} km ${translatedDir} ${loc}`
    return lang === 'en' ? addOfPreposition(base) : base
  }

  // Match: "... laut X km direction Location" (at sea)
  const seaMatch = text.match(
    /laut\s+(\d+(?:\.\d+)?)\s*km\s+(utara|selatan|barat|timur|barat daya|tenggara|timur laut|barat laut)\s+(.+)/i
  )
  if (seaMatch) {
    const dist = seaMatch[1]
    const dir = capitalize(seaMatch[2])
    const loc = cleanLoc(seaMatch[3])
    const translatedDir = translateDirection(dir, lang)
    const seaLabel = lang === 'en' ? '(Sea)' : '(Laut)'
    const base = `${dist} km ${translatedDir} ${loc} ${seaLabel}`
    return lang === 'en' ? addOfPreposition(base) : base
  }

  // Fallback: return as-is without the prefix
  return text.replace(/Pusat gempa berada di\s+/gi, '').trim()
}

/**
 * Translate BMKG Potensi string.
 */
export function translatePotensi(text, lang) {
  if (!text || lang !== 'en') return text

  const lower = text.toLowerCase().trim()
  if (lower.includes('tidak ada tsunami') || lower.includes('tidak berpotensi tsunami')) {
    return 'No tsunami risk'
  }
  if (lower.includes('potensi tsunami') || lower.includes('berpotensi tsunami')) {
    return 'Tsunami potential'
  }
  return text
}

/**
 * Translate BMKG Dirasakan string.
 */
export function translateDirasakan(text, lang) {
  if (!text || lang !== 'en') return text
  return text
    .replace(/Dirasakan/i, 'Felt')
    .replace(/Skala\s+MMI/i, 'MMI Scale')
}

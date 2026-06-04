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

/**
 * Parse BMKG Wilayah string into clean format.
 * Optionally translate directions to English when lang='en'.
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
  // Longer directions first so "barat laut" matches before "barat"
  const landMatch = text.match(
    /darat\s+(\d+(?:\.\d+)?)\s*km\s+(barat laut|barat daya|timur laut|tenggara|utara|selatan|barat|timur)\s+(.+)/i
  )
  if (landMatch) {
    const dist = landMatch[1]
    const dir = capitalize(landMatch[2])
    const loc = cleanLoc(landMatch[3])
    const translatedDir = lang === 'en' ? translateDirection(dir) : dir
    const base = `${dist} km ${translatedDir} ${loc}`
    return lang === 'en' ? addOfPreposition(base) : base
  }

  // Match: "... laut X km direction Location" (at sea)
  const seaMatch = text.match(
    /laut\s+(\d+(?:\.\d+)?)\s*km\s+(barat laut|barat daya|timur laut|tenggara|utara|selatan|barat|timur)\s+(.+)/i
  )
  if (seaMatch) {
    const dist = seaMatch[1]
    const dir = capitalize(seaMatch[2])
    const loc = cleanLoc(seaMatch[3])
    const translatedDir = lang === 'en' ? translateDirection(dir) : dir
    const seaLabel = lang === 'en' ? '(Sea)' : '(Laut)'
    const base = `${dist} km ${translatedDir} ${loc} ${seaLabel}`
    return lang === 'en' ? addOfPreposition(base) : base
  }

  // Fallback: return as-is without the prefix
  return text.replace(/Pusat gempa berada di\s+/gi, '').trim()
}

function translateDirection(dir) {
  const lower = dir.toLowerCase()
  return directionMap[lower] || dir
}

function addOfPreposition(text) {
  // "36 km South NABIRE" → "36 km South of NABIRE"
  return text.replace(
    /(\d+\s*km\s+(?:North|South|East|West|Southwest|Southeast|Northeast|Northwest))\s+([A-Z][A-Z\s()]+(?:\(Sea\))?)/,
    '$1 of $2'
  )
}

function capitalize(s) {
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

function cleanLoc(s) {
  return s.trim().toUpperCase().replace(/\s+/g, ' ')
}

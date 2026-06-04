const directionMap = {
  // Spaced versions
  'barat laut': 'Northwest',
  'barat daya': 'Southwest',
  'timur laut': 'Northeast',
  tenggara: 'Southeast',
  utara: 'North',
  selatan: 'South',
  barat: 'West',
  timur: 'East',
  // CamelCase versions (BMKG JSON format)
  baratlaut: 'Northwest',
  baratdaya: 'Southwest',
  timurlaut: 'Northeast',
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
 *
 * Input:  "39 km TimurLaut LABUANBAJO-NTT"
 * Output (en): "39 km Northeast of LABUANBAJO-NTT"
 */
export function parseWilayah(wilayah, lang) {
  if (!wilayah || typeof wilayah !== 'string') return wilayah

  const text = wilayah.trim()

  // Direction pattern: matches both "Barat Laut" and "BaratLaut" (BMKG uses both)
  // Longer directions first so "barat laut"/"BaratLaut" match before "barat"
  const dirPattern = '(barat laut|baratlaut|barat daya|baratdaya|timur laut|timurlaut|tenggara|utara|selatan|barat|timur)'

  // Match: "... darat X km direction Location" (on land)
  const landMatch = text.match(
    new RegExp(`darat\\s+(\\d+(?:\\.\\d+)?)\\s*km\\s+${dirPattern}\\s+(.+)`, 'i')
  )
  if (landMatch) {
    return formatResult(landMatch[1], landMatch[2], landMatch[3], lang, false)
  }

  // Match: "... laut X km direction Location" (at sea)
  const seaMatch = text.match(
    new RegExp(`laut\\s+(\\d+(?:\\.\\d+)?)\\s*km\\s+${dirPattern}\\s+(.+)`, 'i')
  )
  if (seaMatch) {
    return formatResult(seaMatch[1], seaMatch[2], seaMatch[3], lang, true)
  }

  // Match: "X km direction Location" (no darat/laut prefix — common in BMKG JSON)
  const bareMatch = text.match(
    new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*km\\s+${dirPattern}\\s+(.+)`, 'i')
  )
  if (bareMatch) {
    const isSea = /\blaut\b/i.test(wilayah)
    return formatResult(bareMatch[1], bareMatch[2], bareMatch[3], lang, isSea)
  }

  // Fallback: return as-is without the prefix
  return text.replace(/Pusat gempa berada di\s+/gi, '').trim()
}

function formatResult(dist, dir, loc, lang, isSea) {
  const capitalized = capitalize(dir)
  const translatedDir = lang === 'en' ? translateDirection(capitalized) : capitalized
  const cleanLocation = cleanLoc(loc)
  const seaLabel = isSea ? (lang === 'en' ? '(Sea)' : '(Laut)') : ''
  const base = seaLabel
    ? `${dist} km ${translatedDir} ${cleanLocation} ${seaLabel}`
    : `${dist} km ${translatedDir} ${cleanLocation}`
  return lang === 'en' ? addOfPreposition(base) : base
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

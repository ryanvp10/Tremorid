/**
 * Parse BMKG Wilayah string into clean format.
 *
 * Input:  "Pusat gempa berada di darat 36 km selatan Nabire"
 * Output: "36 km Selatan NABIRE"
 *
 * Input:  "Pusat gempa berada di laut 22 km tenggara Sarmi"
 * Output: "22 km Tenggara SARMI (Laut)"
 */
export function parseWilayah(wilayah) {
  if (!wilayah || typeof wilayah !== 'string') return wilayah

  const text = wilayah.trim()

  // Match: "... darat X km direction Location" (on land)
  const landMatch = text.match(
    /darat\s+(\d+(?:\.\d+)?)\s*km\s+(utara|selatan|barat|timur|barat daya|tenggara|timur laut|barat laut)\s+(.+)/i
  )
  if (landMatch) {
    return `${landMatch[1]} km ${capitalize(landMatch[2])} ${cleanLoc(landMatch[3])}`
  }

  // Match: "... laut X km direction Location" (at sea)
  const seaMatch = text.match(
    /laut\s+(\d+(?:\.\d+)?)\s*km\s+(utara|selatan|barat|timur|barat daya|tenggara|timur laut|barat laut)\s+(.+)/i
  )
  if (seaMatch) {
    return `${seaMatch[1]} km ${capitalize(seaMatch[2])} ${cleanLoc(seaMatch[3])} (Laut)`
  }

  // Fallback: return as-is without the prefix
  return text.replace(/Pusat gempa berada di\s+/gi, '').trim()
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function cleanLoc(s) {
  return s.trim().toUpperCase().replace(/\s+/g, ' ')
}

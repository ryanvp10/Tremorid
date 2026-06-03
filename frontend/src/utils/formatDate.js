/**
 * Format a datetime string to DD/MM/YYYY, HH:MM WIB
 * Handles BMKG format (2026-05-29 14:30:00) and ISO dates
 */
export function formatDate(datetime) {
  if (!datetime) return '-'

  const raw = String(datetime).trim()

  // Match BMKG format: 2026-05-29 14:30:00 or 2026-05-29T14:30:00
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (match) {
    const [, year, month, day, hour, minute] = match
    return `${day}/${month}/${year}, ${hour}:${minute} WIB`
  }

  // Fallback: parse as Date
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return `${raw} WIB`

  const d = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')

  return `${dd}/${mm}/${yyyy}, ${hh}:${min} WIB`
}

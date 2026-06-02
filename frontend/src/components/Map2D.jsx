import React, { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function getMagnitudeColor(magnitude) {
  const value = Number(magnitude)

  if (value >= 5) return 'red'
  if (value >= 3) return 'yellow'
  return 'green'
}

function getQuakeValue(quake, fields) {
  return fields.find((field) => quake[field] !== undefined && quake[field] !== null)
}

function getCoordinates(quake) {
  const latField = getQuakeValue(quake, ['latitude', 'lat', 'Latitude', 'lintang'])
  const lngField = getQuakeValue(quake, ['longitude', 'lng', 'lon', 'Longitude', 'bujur'])
  const lat = Number(quake[latField])
  const lng = Number(quake[lngField])

  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng]

  const coordinates = quake.coordinates || quake.Coordinates || quake.coords
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const [first, second] = coordinates.map(Number)
    if (Number.isFinite(first) && Number.isFinite(second)) return [first, second]
  }

  return null
}

function Map2D() {
  const [quakes, setQuakes] = useState([])

  useEffect(() => {
    let isMounted = true

    async function fetchQuakes() {
      try {
        const response = await fetch('http://localhost:3000/api/quakes')
        const data = await response.json()

        if (isMounted) {
          setQuakes(Array.isArray(data) ? data : [])
        }
      } catch {
        if (isMounted) {
          setQuakes([])
        }
      }
    }

    fetchQuakes()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <MapContainer center={[-2, 118]} zoom={5} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {quakes.map((quake, index) => {
        const position = getCoordinates(quake)
        if (!position) return null

        const magnitude = Number(
          quake.magnitude ?? quake.mag ?? quake.Magnitude ?? quake.magnitudo ?? 0
        )
        const color = getMagnitudeColor(magnitude)

        return (
          <CircleMarker
            key={quake.id ?? `${quake.datetime ?? quake.time ?? index}-${index}`}
            center={position}
            radius={Math.max(magnitude * 2, 4)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.75 }}
          >
            <Popup>
              <div>
                <div>Location: {quake.location ?? quake.place ?? quake.wilayah ?? '-'}</div>
                <div>Magnitude: {quake.magnitude ?? quake.mag ?? quake.Magnitude ?? '-'}</div>
                <div>Depth: {quake.depth ?? quake.Depth ?? quake.kedalaman ?? '-'}</div>
                <div>Datetime: {quake.datetime ?? quake.time ?? quake.dateTime ?? '-'}</div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

export default Map2D

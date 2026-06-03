import { useEffect, useRef } from 'react'
import {
  Cartesian3,
  Color,
  Credit,
  ImageryLayer,
  UrlTemplateImageryProvider,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { parseWilayah } from '../lib/parseWilayah'
import { API_BASE } from '../services/api'
import { formatDate } from '../utils/formatDate'

function getMagnitudeColor(magnitude) {
  if (magnitude >= 5) return Color.RED
  if (magnitude >= 3) return Color.YELLOW
  return Color.GREEN
}

function formatInfoValue(value) {
  return String(value ?? '-')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function Map3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return undefined

    let isMounted = true
    const mapImagery = new UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: new Credit('&copy; OpenStreetMap contributors'),
    })

    const viewer = new Viewer(containerRef.current, {
      baseLayer: new ImageryLayer(mapImagery),
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
    })

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(118, -2, 6500000),
    })

    async function fetchQuakes() {
      try {
        const response = await fetch(`${API_BASE}/quakes`)
        if (!response.ok) return

        const quakes = await response.json()

        if (!isMounted || !Array.isArray(quakes)) return

        quakes.forEach((quake, index) => {
          const latitude = Number(quake.latitude)
          const longitude = Number(quake.longitude)

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

          const magnitude = Number(quake.magnitude ?? 0)
          const safeMagnitude = Number.isFinite(magnitude) ? magnitude : 0
          const pointSize = Math.max(safeMagnitude * 3, 4)

          viewer.entities.add({
            id: quake.id ?? `quake-${index}`,
            name: parseWilayah(quake.Wilayah || quake.location) ?? 'Earthquake',
            position: Cartesian3.fromDegrees(longitude, latitude),
            point: {
              pixelSize: pointSize,
              color: getMagnitudeColor(safeMagnitude),
              outlineColor: Color.WHITE,
              outlineWidth: 1,
            },
            description: `
              <div>
                <strong>Detail</strong>
                <div>Location: ${formatInfoValue(parseWilayah(quake.Wilayah || quake.location))}</div>
                <div>Magnitude: ${formatInfoValue(quake.magnitude)}</div>
                <div>Depth: ${formatInfoValue(quake.depth)}</div>
                <div>Datetime: ${formatDate(quake.datetime)}</div>
              </div>
            `,
          })
        })
      } catch {
        // Leave the globe empty if quake data is unavailable.
      }
    }

    fetchQuakes()

    return () => {
      isMounted = false
      viewer.destroy()
    }
  }, [])

  return <div ref={containerRef} className="h-full w-full" />
}

export default Map3D

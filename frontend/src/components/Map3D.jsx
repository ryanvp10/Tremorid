import { useEffect, useRef } from 'react'
import {
  Cartesian3,
  Color,
  ImageryLayer,
  IonImageryProvider,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { API_BASE } from '../services/api'

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
    let viewer = null

    async function initMap() {
      try {
        // Cesium World Imagery (Bing Maps Aerial with labels) — free, globe-ready
        const baseImagery = await IonImageryProvider.fromAssetId(2)

        if (!isMounted) return

        viewer = new Viewer(containerRef.current, {
          baseLayer: new ImageryLayer(baseImagery),
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

        // Fetch quake data
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
              name: quake.location ?? 'Earthquake',
              position: Cartesian3.fromDegrees(longitude, latitude),
              point: {
                pixelSize: pointSize,
                color: getMagnitudeColor(safeMagnitude),
                outlineColor: Color.WHITE,
                outlineWidth: 1,
              },
              description: `
                <div>
                  <div>Location: ${formatInfoValue(quake.location)}</div>
                  <div>Magnitude: ${formatInfoValue(quake.magnitude)}</div>
                  <div>Depth: ${formatInfoValue(quake.depth)}</div>
                  <div>Datetime: ${formatInfoValue(quake.datetime)}</div>
                </div>
              `,
            })
          })
        } catch {
          // Leave globe empty if data unavailable
        }
      } catch {
        // Leave globe empty if imagery fails
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (viewer) viewer.destroy()
    }
  }, [])

  return <div ref={containerRef} className="h-full w-full" />
}

export default Map3D

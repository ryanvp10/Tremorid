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
    const darkImagery = new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      credit: new Credit(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      ),
    })

    const viewer = new Viewer(containerRef.current, {
      baseLayer: new ImageryLayer(darkImagery),
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
      destination: Cartesian3.fromDegrees(118, -2, 20000000),
    })

    async function fetchQuakes() {
      try {
        const response = await fetch('http://localhost:3000/api/quakes')
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

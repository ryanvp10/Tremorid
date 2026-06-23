import { useEffect, useRef, useState } from 'react'
import {
  Cartesian3,
  Color,
  Credit,
  defined,
  ImageryLayer,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { parseWilayah } from '../lib/parseWilayah'
import { API_BASE } from '../services/api'
import { formatDate } from '../utils/formatDate'
import { useLanguage } from '../contexts/LanguageContext'

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

function Map3D({ selectedQuake }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const { lang } = useLanguage()

  useEffect(() => {
    const latitude = Number(selectedQuake?.latitude)
    const longitude = Number(selectedQuake?.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

    const viewer = viewerRef.current
    if (!viewer) return

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(longitude, latitude, 500000),
      duration: 1.5,
      complete: () => {
        const entity = viewer.entities.getById(selectedQuake.id ?? '')
        if (entity) {
          viewer.selectedEntity = entity
        }
      },
    })
  }, [selectedQuake])

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
      backgroundColor: Color.fromCssColorString('#0a1628'),
    })
    viewerRef.current = viewer

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(118, -2, 6500000),
    })

    // Force tile load on mobile — kickstart by slightly moving camera after a tick
    setTimeout(() => {
      if (!isMounted) return
      const current = viewer.camera.position
      viewer.camera.moveRight(0.001)
      setTimeout(() => {
        if (!isMounted) return
        viewer.camera.flyTo({ destination: current, duration: 0 })
        setLoading(false)
      }, 300)
    }, 100)

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
          const pointSize = Math.max(safeMagnitude * 2.5, 3)

          viewer.entities.add({
            id: quake.id ?? `quake-${index}`,
            name: 'Detail',
            position: Cartesian3.fromDegrees(longitude, latitude),
            point: {
              pixelSize: pointSize,
              color: getMagnitudeColor(safeMagnitude).withAlpha(0.7),
              outlineColor: getMagnitudeColor(safeMagnitude),
              outlineWidth: 1,
              heightReference: 0,
            },
            description: `
              <div>
                <div>Location: ${formatInfoValue(parseWilayah(quake.Wilayah || quake.location, lang))}</div>
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

    // Click handler: select dot on click, clear selection on empty space
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position)
      if (defined(picked) && picked.id && picked.id.name === 'Detail') {
        viewer.selectedEntity = picked.id
      } else {
        viewer.selectedEntity = undefined
      }
    }, ScreenSpaceEventType.LEFT_CLICK)

    fetchQuakes()

    return () => {
      isMounted = false
      handler.destroy()
      viewerRef.current = null
      viewer.destroy()
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a1628]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <span className="text-sm text-white/60">Loading globe...</span>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}

export default Map3D

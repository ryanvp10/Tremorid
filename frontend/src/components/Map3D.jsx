import { useEffect, useRef } from 'react'
import {
  Cartesian3,
  Credit,
  ImageryLayer,
  UrlTemplateImageryProvider,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

function Map3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return undefined

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

    return () => {
      viewer.destroy()
    }
  }, [])

  return <div ref={containerRef} className="h-full w-full" />
}

export default Map3D

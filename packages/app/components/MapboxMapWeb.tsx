import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { planetColors } from './AstroLegend'

// Types for our props
export interface MapboxMapWebProps {
  lines: Array<{
    planet: string
    angleType: string
    coordinates: [number, number][]
  }>
}

// Type for global mapboxgl to avoid TypeScript errors
declare global {
  interface Window {
    mapboxgl?: any
  }
}

export function MapboxMapWeb({ lines }: MapboxMapWebProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize the map on component mount
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Set the access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    // Create map with globe projection
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      projection: 'globe', // Enable 3D globe view
      center: [0, 20],
      zoom: 1.2,
      minZoom: 0.5, // Allow zooming out further
    })

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Save map reference
    map.current = newMap

    // Set up atmosphere for globe view when style loads
    newMap.on('style.load', () => {
      if (map.current) {
        map.current.setFog({
          color: 'rgb(20, 20, 30)', // Atmosphere color
          'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
          'horizon-blend': 0.4, // Atmosphere thickness
          'space-color': 'rgb(2, 5, 10)', // Dark space
          'star-intensity': 0.6 // Star brightness
        })
      }
    })

    // Handle map load event
    newMap.on('load', () => {
      console.log('Globe loaded and ready for lines')
      setMapLoaded(true)
    })

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add/update lines when the map is loaded and lines change
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      console.log('Map not ready yet for lines')
      return
    }

    console.log('Adding lines to globe:', lines.length)

    try {
      // Remove old layers and sources first
      lines.forEach((line) => {
        const id = `line-${line.planet}-${line.angleType}`
        if (map.current?.getLayer(id)) {
          map.current.removeLayer(id)
        }
        if (map.current?.getSource(id)) {
          map.current.removeSource(id)
        }
      })

      // Add each line to the map
      lines.forEach((line) => {
        const id = `line-${line.planet}-${line.angleType}`
        const color = planetColors[line.planet] || '#ffffff'

        console.log(`Adding line: ${id}, coordinates:`, line.coordinates.length)

        // Only add if we have valid coordinates
        if (line.coordinates.length > 1) {
          // Add the line source
          map.current?.addSource(id, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: line.coordinates,
              },
            },
          })

          // Add the line layer with enhanced styling for globe
          map.current?.addLayer({
            id,
            type: 'line',
            source: id,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': color,
              'line-width': 3,
              'line-opacity': 0.9,
              'line-blur': 1, // Add glow effect
            },
          })
        } else {
          console.warn(`Skipping line ${id} - insufficient coordinates`)
        }
      })
    } catch (error) {
      console.error('Error adding lines to globe:', error)
    }
  }, [lines, mapLoaded])

  return <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
}

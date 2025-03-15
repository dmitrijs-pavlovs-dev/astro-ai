import * as turf from '@turf/turf'

interface BirthData {
  date: string
  time: string
  latitude: number
  longitude: number
}

interface PlanetaryLine {
  planet: string
  angleType: string
  coordinates: [number, number][]
}

// Simplified calculation for the prototype
// In a real implementation, this would use proper astronomical calculations
export function calculatePlanetaryLines(birthData: BirthData): PlanetaryLine[] {
  const planets = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  const angleTypes = ['Conjunction', 'Opposition']
  const lines: PlanetaryLine[] = []

  // For prototype purposes, we'll generate simplified lines
  // In a real implementation, these would be calculated using astronomical formulas
  planets.forEach((planet) => {
    angleTypes.forEach((angleType) => {
      // Generate a line that goes around the earth based on the planet and angle type
      // For the prototype, we'll use simplified pseudo-astronomical calculations

      // Base offset is influenced by birth coordinates
      const latOffset = birthData.latitude * 0.01
      const lngOffset = birthData.longitude * 0.01

      // Different offset for each planet and angle type for variety
      const planetIndex = planets.indexOf(planet)
      const angleIndex = angleTypes.indexOf(angleType)

      // Create different patterns for different planets
      let coordinates: [number, number][] = []

      if (angleType === 'Conjunction') {
        // For conjunctions, create a line that roughly follows a great circle
        // passing through points opposite the birth location
        for (let i = -180; i <= 180; i += 10) {
          const point: [number, number] = [
            i,
            Math.sin((i + planetIndex * 30) * (Math.PI / 180)) * 60 + latOffset,
          ]
          coordinates.push(point)
        }
      } else {
        // For oppositions, create a line that follows a different pattern
        for (let i = -180; i <= 180; i += 10) {
          const point: [number, number] = [
            i,
            Math.cos((i + planetIndex * 45) * (Math.PI / 180)) * 60 + lngOffset,
          ]
          coordinates.push(point)
        }
      }

      // Make sure coordinates wrap correctly around the globe
      coordinates = coordinates.map(([lng, lat]) => {
        let adjustedLng = lng
        while (adjustedLng > 180) adjustedLng -= 360
        while (adjustedLng < -180) adjustedLng += 360
        return [adjustedLng, Math.max(-85, Math.min(85, lat))]
      })

      lines.push({
        planet,
        angleType,
        coordinates,
      })
    })
  })

  return lines
}

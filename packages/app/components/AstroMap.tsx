import React from 'react'
import { Platform } from 'react-native'
import { YStack, Text, Spinner } from '@t4/ui'
// Direct import instead of dynamic import
import { MapboxMapWeb } from './MapboxMapWeb'

// Types for our component props
interface AstroMapProps {
  lines: Array<{
    planet: string
    angleType: string
    coordinates: [number, number][]
  }>
}

export function AstroMap({ lines }: AstroMapProps) {
  // State to track if map is loading
  const [isLoading, setIsLoading] = React.useState(true)

  // Effect to simulate loading for consistent UX
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Small delay to allow initial render
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  // For React Native, show a placeholder message
  if (Platform.OS !== 'web') {
    return (
      <YStack flex={1} jc='center' ai='center'>
        <Text>Map view is only available on web for now</Text>
      </YStack>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <YStack flex={1} jc='center' ai='center'>
        <Spinner />
        <Text pt='$2'>Loading map...</Text>
      </YStack>
    )
  }

  // For web, render the map component
  return <MapboxMapWeb lines={lines} />
}

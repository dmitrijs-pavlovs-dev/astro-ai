import React from 'react'
import { Text, XStack, YStack, Separator, Accordion } from '@t4/ui'

// Planet color mapping
export const planetColors: Record<string, string> = {
  Sun: '#FFD700', // Gold
  Moon: '#C0C0C0', // Silver
  Venus: '#00FF00', // Green
  Mars: '#FF0000', // Red
  Jupiter: '#4B0082', // Indigo
  Saturn: '#800000', // Maroon
}

// Planet descriptions for the legend
const planetDescriptions: Record<string, string> = {
  Sun: 'Career, success, vitality, recognition',
  Moon: 'Emotions, comfort, home, intuition',
  Venus: 'Love, beauty, pleasure, relationships',
  Mars: 'Energy, passion, drive, initiative',
  Jupiter: 'Expansion, abundance, wisdom, growth',
  Saturn: 'Structure, discipline, responsibility, lessons',
}

// Define different line patterns for each angle type - same as in MapboxMapWeb
export const angleDashPatterns: Record<string, number[]> = {
  Conjunction: [1, 0], // Solid line
  Opposition: [2, 2], // Dashed line
  Rising: [1, 1], // Dotted line
  Setting: [6, 2], // More pronounced long dash
  MC: [2, 2, 6, 2], // More pronounced dot-dash
  IC: [1, 3, 1, 3, 6, 3], // Multiple dots followed by long dash
}

// Angle type descriptions
const angleTypeDescriptions: Record<string, string> = {
  Conjunction: "Areas where the planet's energy is strongly expressed",
  Opposition: 'Areas of tension requiring balance and integration',
  Rising: 'Where the planet was rising at your birth',
  Setting: 'Where the planet was setting at your birth',
  MC: 'Highest point - career and public expression',
  IC: 'Lowest point - home and private life',
}

// Semantic meanings for planet/angle combinations
const combinationMeanings: Record<string, Record<string, string>> = {
  Sun: {
    Conjunction:
      'Places where your sense of identity, purpose and leadership abilities are enhanced',
    Opposition: 'Areas where you may need to balance personal identity with external challenges',
    Rising: 'Locations where you can find recognition, visibility and success in your career',
    Setting: 'Regions where you may encounter important partnerships that affect your identity',
    MC: 'Places offering powerful opportunities for career advancement and public recognition',
    IC: 'Areas where you can reconnect with your core identity and inner strength',
  },
  Moon: {
    Conjunction: 'Places where you feel emotionally at home and nurtured',
    Opposition: 'Areas requiring balance between emotional needs and practical matters',
    Rising: 'Locations where your intuition and emotional intelligence are heightened',
    Setting: 'Regions where relationships deeply affect your emotional world',
    MC: 'Places where emotions or intuition can guide your public life and career',
    IC: 'Areas that feel deeply familiar and provide emotional security',
  },
  Venus: {
    Conjunction: 'Places where love, beauty, and pleasurable experiences are enhanced',
    Opposition: 'Areas where you balance personal desires with relationship needs',
    Rising: 'Locations where your charm and attractiveness are magnified',
    Setting: 'Regions where significant partnerships and relationships develop',
    MC: 'Places offering career opportunities in arts, beauty, or harmonious environments',
    IC: 'Areas where you can create beauty and harmony in your private life',
  },
  Mars: {
    Conjunction: 'Places where your energy, courage and assertiveness are enhanced',
    Opposition: 'Areas where you must balance personal drive with cooperation',
    Rising: 'Locations where your initiative and physical vitality are strengthened',
    Setting: 'Regions where dynamic and potentially challenging relationships form',
    MC: 'Places offering opportunities for leadership and energetic career pursuits',
    IC: 'Areas where you can channel your drive into creating a secure foundation',
  },
  Jupiter: {
    Conjunction: 'Places of expansion, growth, and fortunate opportunities',
    Opposition: 'Areas requiring balance between expansion and practical limitations',
    Rising: 'Locations where optimism and opportunities for growth are abundant',
    Setting: 'Regions where beneficial partnerships and shared wisdom develop',
    MC: 'Places offering significant career growth and recognition',
    IC: 'Areas where you can expand your sense of belonging and inner wisdom',
  },
  Saturn: {
    Conjunction: 'Places where discipline, responsibility and life lessons are emphasized',
    Opposition: 'Areas requiring balance between structure and flexibility',
    Rising: 'Locations where you develop maturity and face important tests',
    Setting: 'Regions where relationships involve commitment and responsibility',
    MC: 'Places offering career advancement through hard work and persistence',
    IC: 'Areas where you build solid foundations and address deep-seated fears',
  },
}

export interface AstroLegendProps {
  hasLines: boolean
}

// Helper component to visualize line patterns in the legend
function LinePattern({ pattern, color = '#FFFFFF' }: { pattern: number[]; color?: string }) {
  // Create a visual representation of the dash pattern
  const width = 100 // Increased width to accommodate more repetitions
  const height = 6
  const segments: React.ReactNode[] = []

  // Scale factor to make patterns more visible
  const scaleFactor = 3

  // Repeat pattern to make it more visible
  const repeatedPattern: number[] = []
  const repeatCount = 5 // Ensure the pattern repeats enough times

  // Create repeated pattern array
  for (let r = 0; r < repeatCount; r++) {
    for (let i = 0; i < pattern.length; i++) {
      repeatedPattern.push(pattern[i] || 0)
    }
  }

  // Generate segments based on the repeated pattern
  let position = 0
  for (let i = 0; i < repeatedPattern.length; i++) {
    const length = repeatedPattern[i] || 0
    const isVisible = i % 2 === 0

    if (isVisible && length > 0) {
      segments.push(
        <YStack
          key={i}
          position='absolute'
          left={position}
          height={height}
          width={length * scaleFactor}
          backgroundColor={color}
          borderRadius='$1'
        />
      )
    }

    position += length * scaleFactor
    if (position >= width) break
  }

  return (
    <XStack width={width} height={height} position='relative'>
      {segments}
    </XStack>
  )
}

export function AstroLegend({ hasLines }: AstroLegendProps) {
  if (!hasLines) return null

  return (
    <YStack mt='$4' p='$4' backgroundColor='$backgroundHover' borderRadius='$4'>
      <Text fontSize='$5' fontWeight='bold' mb='$3'>
        Understanding Your Astrocartography Map
      </Text>

      <Text fontSize='$3' mb='$3'>
        Your map shows planetary lines that represent different energies and influences based on
        your birth chart. Each line has two key attributes: the planet (color) and the angle type
        (line pattern).
      </Text>

      {/* Basic Legend Reference */}
      <YStack mb='$4'>
        <Text fontSize='$4' fontWeight='bold' mb='$2'>
          Quick Reference
        </Text>

        {/* Planet Colors */}
        <Text fontSize='$3' fontWeight='bold' mb='$1'>
          Planet Colors:
        </Text>
        <XStack flexWrap='wrap' mb='$2'>
          {Object.entries(planetColors).map(([planet, color]) => (
            <XStack key={planet} alignItems='center' space='$2' mr='$4' mb='$2' minWidth={100}>
              <YStack width={24} height={6} backgroundColor={color} borderRadius='$1' />
              <Text fontSize='$3'>{planet}</Text>
            </XStack>
          ))}
        </XStack>

        {/* Angle Types */}
        <Text fontSize='$3' fontWeight='bold' mb='$1'>
          Angle Patterns:
        </Text>
        <XStack flexWrap='wrap' mb='$3'>
          {Object.entries(angleDashPatterns).map(([angleType, pattern]) => (
            <XStack key={angleType} alignItems='center' space='$2' mr='$4' mb='$2' minWidth={120}>
              <LinePattern pattern={pattern} color='#FFFFFF' />
              <Text fontSize='$3'>{angleType}</Text>
            </XStack>
          ))}
        </XStack>
      </YStack>

      <Separator my='$3' />

      {/* Detailed Combinations */}
      <Text fontSize='$4' fontWeight='bold' mb='$2'>
        Planetary Line Combinations
      </Text>

      <Accordion type='multiple' defaultValue={['Sun']}>
        {Object.entries(planetColors).map(([planet, color]) => (
          <Accordion.Item key={planet} value={planet}>
            <Accordion.Trigger>
              <XStack alignItems='center' space='$2' flex={1}>
                <YStack width={12} height={12} backgroundColor={color} borderRadius='$1' />
                <Text fontSize='$3' fontWeight='bold'>
                  {planet} - {planetDescriptions[planet]}
                </Text>
              </XStack>
            </Accordion.Trigger>
            <Accordion.Content>
              <YStack space='$3' pt='$2' pb='$1'>
                {Object.entries(angleDashPatterns).map(([angleType, pattern]) => {
                  // Ensure pattern is defined
                  const dashPattern = pattern || [1, 0]
                  return (
                    <YStack key={`${planet}-${angleType}`} space='$1' mb='$2'>
                      <XStack alignItems='center' space='$3'>
                        <LinePattern pattern={dashPattern} color={color} />
                        <Text fontWeight='bold' fontSize='$3'>
                          {angleType}
                        </Text>
                      </XStack>
                      <Text fontSize='$2' pl='$6' mt='$1'>
                        {combinationMeanings[planet]?.[angleType] ||
                          `${planet} ${angleType.toLowerCase()} influences`}
                      </Text>
                    </YStack>
                  )
                })}
              </YStack>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </YStack>
  )
}

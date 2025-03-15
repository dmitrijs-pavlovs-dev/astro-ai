import React from 'react'
import { Text, XStack, YStack, Separator } from '@t4/ui'

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

// Angle type descriptions
const angleTypeDescriptions: Record<string, string> = {
    Conjunction: "Areas where the planet's energy is strongly expressed",
    Opposition: 'Areas of tension requiring balance and integration',
    Rising: 'Where the planet was rising at your birth',
    Setting: 'Where the planet was setting at your birth',
    MC: 'Highest point - career and public expression',
    IC: 'Lowest point - home and private life',
}

export interface AstroLegendProps {
    hasLines: boolean
}

export function AstroLegend({ hasLines }: AstroLegendProps) {
    if (!hasLines) return null

    return (
        <YStack mt="$4" p="$4" backgroundColor="$backgroundHover" borderRadius="$4">
            <Text fontSize="$5" fontWeight="bold" mb="$3">
                Understanding Your Astrocartography Map
            </Text>

            <Text fontSize="$3" mb="$3">
                Your map shows planetary lines that represent different energies and influences based on your birth chart.
                These lines indicate where particular planetary energies are strongest on Earth.
            </Text>

            {/* Planets Section */}
            <Text fontSize="$4" fontWeight="bold" mb="$2">
                Planetary Energies
            </Text>

            <YStack space="$2" mb="$4">
                {Object.entries(planetColors).map(([planet, color]) => (
                    <XStack key={planet} alignItems="center" space="$2">
                        <YStack width={24} height={4} backgroundColor={color} borderRadius="$1" />
                        <Text fontWeight="bold" fontSize="$3" minWidth={60}>{planet}</Text>
                        <Text fontSize="$3">{planetDescriptions[planet]}</Text>
                    </XStack>
                ))}
            </YStack>

            <Separator my="$3" />

            {/* Line Types Section */}
            <Text fontSize="$4" fontWeight="bold" mb="$2">
                Line Types
            </Text>

            <YStack space="$2">
                {Object.entries(angleTypeDescriptions).map(([angleType, description]) => (
                    <YStack key={angleType} space="$1" mb="$2">
                        <Text fontWeight="bold" fontSize="$3">{angleType}</Text>
                        <Text fontSize="$3">{description}</Text>
                    </YStack>
                ))}
            </YStack>
        </YStack>
    )
} 
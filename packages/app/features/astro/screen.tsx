import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { Button, Input, Label, ScrollView, Text, XStack, YStack } from '@t4/ui'
import { AstroMap } from 'app/components/AstroMap'
import { trpc } from 'app/utils/trpc'

// Form validation schema
const birthDataFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  latitude: z.string().min(1, 'Latitude is required'),
  longitude: z.string().min(1, 'Longitude is required'),
})

type BirthDataForm = z.infer<typeof birthDataFormSchema>

export default function AstroScreen() {
  const utils = trpc.useContext()
  const [mapVisible, setMapVisible] = useState(false)
  const [birthDataId, setBirthDataId] = useState<string | null>(null)

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BirthDataForm>({
    resolver: zodResolver(birthDataFormSchema),
    defaultValues: {
      name: '',
      date: '',
      time: '',
      latitude: '',
      longitude: '',
    },
  })

  // Query for planetary lines if we have birth data
  const { data: planetaryLines } = trpc.astro.getPlanetaryLines.useQuery(
    { birthDataId: birthDataId! },
    {
      enabled: !!birthDataId && mapVisible,
    }
  )

  // Mutations
  const submitBirthDataMutation = trpc.astro.submitBirthData.useMutation({
    onSuccess: (data) => {
      if (data && data.id) {
        setBirthDataId(data.id)
        calculatePlanetaryLinesMutation.mutate({ birthDataId: data.id })
        setMapVisible(true)
      }
    },
  })

  const calculatePlanetaryLinesMutation = trpc.astro.calculatePlanetaryLines.useMutation({
    onSuccess: () => {
      // Refetch the planetary lines if we have a birthDataId
      if (birthDataId) {
        void utils.astro.getPlanetaryLines.invalidate({ birthDataId })
      }
    },
  })

  // Form submission handler
  const onSubmit = (data: BirthDataForm) => {
    submitBirthDataMutation.mutate(data)
  }

  return (
    <ScrollView>
      <YStack space='$4' padding='$4'>
        <Text fontSize='$6' fontWeight='bold'>
          Astrocartography Map
        </Text>

        {!mapVisible && (
          <>
            <Text>Enter your birth details to generate your astrocartography map.</Text>

            <YStack space='$4'>
              <YStack>
                <Label htmlFor='name'>Name</Label>
                <Controller
                  control={control}
                  name='name'
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id='name'
                      placeholder='Your name'
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.name && <Text color='$red10'>{errors.name.message}</Text>}
              </YStack>

              <YStack>
                <Label htmlFor='date'>Birth Date (YYYY-MM-DD)</Label>
                <Controller
                  control={control}
                  name='date'
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id='date'
                      placeholder='1990-01-01'
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.date && <Text color='$red10'>{errors.date.message}</Text>}
              </YStack>

              <YStack>
                <Label htmlFor='time'>Birth Time (HH:MM)</Label>
                <Controller
                  control={control}
                  name='time'
                  render={({ field: { onChange, value } }) => (
                    <Input id='time' placeholder='12:00' value={value} onChangeText={onChange} />
                  )}
                />
                {errors.time && <Text color='$red10'>{errors.time.message}</Text>}
              </YStack>

              <XStack space='$4'>
                <YStack flex={1}>
                  <Label htmlFor='latitude'>Latitude</Label>
                  <Controller
                    control={control}
                    name='latitude'
                    render={({ field: { onChange, value } }) => (
                      <Input
                        id='latitude'
                        placeholder='40.7128'
                        value={value}
                        onChangeText={onChange}
                        keyboardType='numeric'
                      />
                    )}
                  />
                  {errors.latitude && <Text color='$red10'>{errors.latitude.message}</Text>}
                </YStack>

                <YStack flex={1}>
                  <Label htmlFor='longitude'>Longitude</Label>
                  <Controller
                    control={control}
                    name='longitude'
                    render={({ field: { onChange, value } }) => (
                      <Input
                        id='longitude'
                        placeholder='-74.0060'
                        value={value}
                        onChangeText={onChange}
                        keyboardType='numeric'
                      />
                    )}
                  />
                  {errors.longitude && <Text color='$red10'>{errors.longitude.message}</Text>}
                </YStack>
              </XStack>

              <Button onPress={handleSubmit(onSubmit)}>Generate Map</Button>
            </YStack>
          </>
        )}

        {mapVisible && (
          <YStack height={500}>
            {planetaryLines ? (
              <>
                <XStack justifyContent='space-between' mb='$2'>
                  <Text fontSize='$5' fontWeight='bold'>
                    Your Astrocartography Map
                  </Text>
                  <Button size='sm' variant='outlined' onPress={() => setMapVisible(false)}>
                    New Map
                  </Button>
                </XStack>
                <AstroMap lines={planetaryLines} />
              </>
            ) : (
              <YStack flex={1} justifyContent='center' alignItems='center'>
                <Text>Loading your map...</Text>
              </YStack>
            )}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}

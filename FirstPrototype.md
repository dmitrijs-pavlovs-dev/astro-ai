# First Prototype Implementation Plan

## Scope

For the first prototype, we will implement a minimal viable product that:

1. Accepts user birth data (date, time, location)
2. Calculates planetary lines (Sun, Moon, Venus, Mars, Jupiter, Saturn)
3. Stores these lines in Cloudflare D1
4. Displays the lines on a Mapbox GL map

## Architecture

```
┌─────────────┐      ┌────────────────┐      ┌───────────┐
│  Next.js/   │      │  Cloudflare    │      │   D1      │
│  Tamagui    │ ───> │  Workers API   │ ───> │ Database  │
└─────────────┘      └────────────────┘      └───────────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     │
┌─────────────┐      ┌────────────────┐           │
│  Mapbox GL  │      │  Astronomical  │           │
│  Map        │      │  Calculations  │           │
└─────────────┘      └────────────────┘           │
                                                  │
┌─────────────┐                                   │
│  Supabase   │ ──────────────────────────────────┘
│  Auth       │
└─────────────┘
```

## Implementation Steps

### 1. Backend Setup

#### 1.1 Cloudflare D1 Schema

```sql
-- Schema for D1 database
CREATE TABLE birth_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT, -- Now nullable
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  birth_lat REAL NOT NULL,
  birth_lng REAL NOT NULL,
  birth_location TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE planetary_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  birth_data_id INTEGER NOT NULL, -- Reference birth_data instead of user
  planet TEXT NOT NULL,
  angle TEXT NOT NULL,
  line_coordinates TEXT NOT NULL, -- JSON array of [lng, lat] pairs
  created_at INTEGER NOT NULL,
  FOREIGN KEY (birth_data_id) REFERENCES birth_data(id)
);

CREATE INDEX idx_birth_data_user_id ON birth_data (user_id);
CREATE INDEX idx_planetary_lines_birth_data_id ON planetary_lines (birth_data_id);
CREATE INDEX idx_planetary_lines_planet_angle ON planetary_lines (birth_data_id, planet, angle);
```

#### 1.2 Create Drizzle Schema

```ts
// packages/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const birthData = sqliteTable("birth_data", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  userId: text("user_id"), // Optional - will be null for anonymous users
  createdAt: text("created_at").notNull(),
});

export const planetaryLines = sqliteTable("planetary_lines", {
  id: text("id").primaryKey(),
  birthDataId: text("birth_data_id")
    .notNull()
    .references(() => birthData.id),
  planet: text("planet").notNull(),
  angleType: text("angle_type").notNull(), // Conjunction, opposition, etc.
  lineData: text("line_data").notNull(), // JSON string of GeoJSON
  createdAt: text("created_at").notNull(),
});
```

#### 1.3 DB Client Setup

```ts
// packages/api/src/db/client.ts
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

export const createDb = (d1: D1Database) => {
  return drizzle(d1);
};

// DB operations for astrocartography
export const insertBirthData = async (
  db: any,
  data: {
    name: string;
    date: string;
    time: string;
    latitude: string;
    longitude: string;
    userId?: string;
  }
) => {
  const id = crypto.randomUUID();
  const newData = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };

  await db.insert(schema.birthData).values(newData);
  return newData;
};

export const insertPlanetaryLines = async (
  db: any,
  lines: Array<{
    birthDataId: string;
    planet: string;
    angleType: string;
    lineData: string; // GeoJSON as string
  }>
) => {
  const linesToInsert = lines.map((line) => ({
    ...line,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }));

  await db.insert(schema.planetaryLines).values(linesToInsert);
  return linesToInsert;
};

export const getBirthDataById = async (db: any, id: string) => {
  return db.select().from(schema.birthData).where(eq(schema.birthData.id, id));
};

export const getBirthDataByUserId = async (db: any, userId: string) => {
  return db
    .select()
    .from(schema.birthData)
    .where(eq(schema.birthData.userId, userId));
};

export const getPlanetaryLinesByBirthDataId = async (
  db: any,
  birthDataId: string
) => {
  return db
    .select()
    .from(schema.planetaryLines)
    .where(eq(schema.planetaryLines.birthDataId, birthDataId));
};
```

#### 1.4 Add New tRPC Router

```typescript
// packages/api/src/router/astro.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { db, schema } from "@astro-ai/db";
import { calculatePlanetaryLines } from "../utils/astronomical";
import {
  insertBirthData,
  insertPlanetaryLines,
  getBirthDataById,
  getBirthDataByUserId,
  getPlanetaryLinesByBirthDataId,
} from "../db/client";

export const astroRouter = createTRPCRouter({
  // Submit birth data - can be used by both anonymous and authenticated users
  submitBirthData: publicProcedure
    .input(
      z.object({
        name: z.string(),
        date: z.string(),
        time: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        userId: z.string().optional(), // Optional - authenticated users can pass this
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use the insertBirthData utility function
        const birthData = await insertBirthData(db, input);

        // Return the ID so it can be used to calculate planetary lines
        return { id: birthData.id, success: true };
      } catch (error) {
        console.error("Failed to submit birth data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit birth data",
        });
      }
    }),

  // Calculate and store planetary lines for a birth data entry
  calculatePlanetaryLines: publicProcedure
    .input(z.object({ birthDataId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Get the birth data using utility function
        const birthDataResults = await getBirthDataById(db, input.birthDataId);

        if (birthDataResults.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Birth data not found",
          });
        }

        const birthData = birthDataResults[0];

        // Calculate planetary lines using the utility function
        const lines = calculatePlanetaryLines({
          date: birthData.date,
          time: birthData.time,
          latitude: parseFloat(birthData.latitude),
          longitude: parseFloat(birthData.longitude),
        });

        // Prepare lines for insertion
        const linesToInsert = lines.map((line) => ({
          birthDataId: input.birthDataId,
          planet: line.planet,
          angleType: line.angleType,
          lineData: JSON.stringify(line.coordinates),
        }));

        // Insert lines using utility function
        const insertedLines = await insertPlanetaryLines(db, linesToInsert);

        return { success: true, lineCount: insertedLines.length };
      } catch (error) {
        console.error("Failed to calculate planetary lines:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate planetary lines",
        });
      }
    }),

  // Get planetary lines for a birth data entry
  getPlanetaryLines: publicProcedure
    .input(z.object({ birthDataId: z.string() }))
    .query(async ({ input }) => {
      try {
        // First confirm birth data exists
        const birthDataResults = await getBirthDataById(db, input.birthDataId);

        if (birthDataResults.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Birth data not found",
          });
        }

        // Get the planetary lines using utility function
        const linesData = await getPlanetaryLinesByBirthDataId(
          db,
          input.birthDataId
        );

        // Format the response
        const formattedLines = linesData.map((line) => ({
          id: line.id,
          planet: line.planet,
          angleType: line.angleType,
          coordinates: JSON.parse(line.lineData),
        }));

        return formattedLines;
      } catch (error) {
        console.error("Failed to get planetary lines:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get planetary lines",
        });
      }
    }),

  // For authenticated users - get their birth data
  getUserBirthData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;

      // Use utility function to get birth data by user ID
      const birthDataList = await getBirthDataByUserId(db, userId);

      return birthDataList;
    } catch (error) {
      console.error("Failed to get user birth data:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get user birth data",
      });
    }
  }),
});
```

#### 1.5 Add Astro Router to Main Router

```typescript
// packages/api/src/router.ts
import { authRouter } from "./routes/auth";
import { carsRouter } from "./routes/cars";
import { helloRouter } from "./routes/hello";
import { userRouter } from "./routes/user";
import { astroRouter } from "./routes/astro";
import { router } from "./trpc";

export const appRouter = router({
  hello: helloRouter,
  user: userRouter,
  auth: authRouter,
  car: carsRouter,
  astro: astroRouter,
});

export type AppRouter = typeof appRouter;
```

### 2. Frontend Components

#### 2.1 Create AstroScreen Component

```tsx
// packages/app/features/astro/screen.tsx
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button, Input, Label, ScrollView, Text, XStack, YStack } from "@t4/ui";
import { AstroMap } from "app/components/AstroMap";
import { trpc } from "app/utils/trpc";

// Form validation schema
const birthDataFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  latitude: z.string().min(1, "Latitude is required"),
  longitude: z.string().min(1, "Longitude is required"),
});

type BirthDataForm = z.infer<typeof birthDataFormSchema>;

export default function AstroScreen() {
  const utils = trpc.useContext();
  const [mapVisible, setMapVisible] = useState(false);
  const [birthDataId, setBirthDataId] = useState<string | null>(null);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BirthDataForm>({
    resolver: zodResolver(birthDataFormSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      latitude: "",
      longitude: "",
    },
  });

  // Query for planetary lines if we have birth data
  const { data: planetaryLines } = trpc.astro.getPlanetaryLines.useQuery(
    { birthDataId: birthDataId! },
    {
      enabled: !!birthDataId && mapVisible,
    }
  );

  // Mutations
  const submitBirthDataMutation = trpc.astro.submitBirthData.useMutation({
    onSuccess: (data) => {
      if (data && data.id) {
        setBirthDataId(data.id);
        calculatePlanetaryLinesMutation.mutate({ birthDataId: data.id });
        setMapVisible(true);
      }
    },
  });

  const calculatePlanetaryLinesMutation =
    trpc.astro.calculatePlanetaryLines.useMutation({
      onSuccess: () => {
        // Refetch the planetary lines if we have a birthDataId
        if (birthDataId) {
          void utils.astro.getPlanetaryLines.invalidate({ birthDataId });
        }
      },
    });

  // Form submission handler
  const onSubmit = (data: BirthDataForm) => {
    submitBirthDataMutation.mutate(data);
  };

  return (
    <ScrollView>
      <YStack space="$4" padding="$4">
        <Text fontSize="$6" fontWeight="bold">
          Astrocartography Map
        </Text>

        {!mapVisible && (
          <>
            <Text>
              Enter your birth details to generate your astrocartography map.
            </Text>

            <YStack space="$4">
              <YStack>
                <Label htmlFor="name">Name</Label>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.name && (
                  <Text color="$red10">{errors.name.message}</Text>
                )}
              </YStack>

              <YStack>
                <Label htmlFor="date">Birth Date (YYYY-MM-DD)</Label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id="date"
                      placeholder="1990-01-01"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.date && (
                  <Text color="$red10">{errors.date.message}</Text>
                )}
              </YStack>

              <YStack>
                <Label htmlFor="time">Birth Time (HH:MM)</Label>
                <Controller
                  control={control}
                  name="time"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      id="time"
                      placeholder="12:00"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.time && (
                  <Text color="$red10">{errors.time.message}</Text>
                )}
              </YStack>

              <XStack space="$4">
                <YStack flex={1}>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Controller
                    control={control}
                    name="latitude"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        id="latitude"
                        placeholder="40.7128"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                      />
                    )}
                  />
                  {errors.latitude && (
                    <Text color="$red10">{errors.latitude.message}</Text>
                  )}
                </YStack>

                <YStack flex={1}>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Controller
                    control={control}
                    name="longitude"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        id="longitude"
                        placeholder="-74.0060"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                      />
                    )}
                  />
                  {errors.longitude && (
                    <Text color="$red10">{errors.longitude.message}</Text>
                  )}
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
                <XStack justifyContent="space-between" mb="$2">
                  <Text fontSize="$5" fontWeight="bold">
                    Your Astrocartography Map
                  </Text>
                  <Button
                    size="sm"
                    variant="outlined"
                    onPress={() => setMapVisible(false)}
                  >
                    New Map
                  </Button>
                </XStack>
                <AstroMap lines={planetaryLines} />
              </>
            ) : (
              <YStack flex={1} justifyContent="center" alignItems="center">
                <Text>Loading your map...</Text>
              </YStack>
            )}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
```

#### 2.2 Create AstroMap Component

```tsx
// packages/app/components/AstroMap.tsx
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { YStack, Text } from "@t4/ui";

// For web, we'll use actual MapBox
let MapboxComponent = null;
if (Platform.OS === "web") {
  // This dynamic import will only happen on web
  import("mapbox-gl").then((mapboxgl) => {
    MapboxComponent = mapboxgl.default;
  });
}

interface AstroMapProps {
  lines: Array<{
    planet: string;
    angleType: string;
    coordinates: [number, number][];
  }>;
}

export function AstroMap({ lines }: AstroMapProps) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !mapContainer.current || !MapboxComponent) {
      // Not on web or map not ready yet
      return;
    }

    // Initialize map if not already done
    if (!map.current) {
      MapboxComponent.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      map.current = new MapboxComponent.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [0, 20],
        zoom: 1.5,
      });

      map.current.on("load", () => {
        addLinesToMap();
      });
    } else {
      // Map already initialized, just update the lines
      addLinesToMap();
    }

    function addLinesToMap() {
      if (!map.current || !map.current.loaded()) return;

      // Define colors for each planet
      const planetColors = {
        Sun: "#FFD700", // Gold
        Moon: "#C0C0C0", // Silver
        Venus: "#00FF00", // Green
        Mars: "#FF0000", // Red
        Jupiter: "#4B0082", // Indigo
        Saturn: "#800000", // Maroon
      };

      // Add each line to the map
      lines.forEach((line) => {
        const id = `line-${line.planet}-${line.angleType}`;

        // Remove existing layer and source if they exist
        if (map.current.getLayer(id)) {
          map.current.removeLayer(id);
        }
        if (map.current.getSource(id)) {
          map.current.removeSource(id);
        }

        // Add the line source
        map.current.addSource(id, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: line.coordinates,
            },
          },
        });

        // Add the line layer
        map.current.addLayer({
          id,
          type: "line",
          source: id,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": planetColors[line.planet] || "#ffffff",
            "line-width": 2,
            "line-opacity": 0.8,
          },
        });
      });
    }

    return () => {
      // No need to destroy the map in this component
      // as we'll handle that elsewhere
    };
  }, [lines]);

  // For React Native, implement a placeholder or use a compatible map library
  if (Platform.OS !== "web") {
    return (
      <YStack flex={1} jc="center" ai="center">
        <Text>Map view is only available on web for now</Text>
      </YStack>
    );
  }

  return <YStack ref={mapContainer} flex={1} />;
}
```

#### 2.3 Add Route in Next.js

```tsx
// apps/next/pages/astro.tsx
import { AstroScreen } from "app/features/astro";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Astrocartography</title>
      </Head>
      <AstroScreen />
    </>
  );
}
```

### 3. Testing Plan

1. Manual testing of the full flow:

   - Enter birth details (with or without signing in)
   - Confirm data is saved to D1
   - Verify lines are calculated and stored
   - Confirm lines display properly on the Mapbox map
   - If signed in, verify data is linked to user account

2. Edge cases to test:
   - Anonymous vs authenticated user experience
   - Different users should see their own birth data if signed in
   - Proper error handling for invalid inputs
   - Mobile vs web display differences

### 5. Next Steps After First Prototype

1. Implement proper astronomical calculations
2. Add line interpretation text
3. Optimize database queries
4. Improve location search with geocoding
5. Enhance map interactions (zoom to lines, tooltips)
6. Implement caching for better performance
7. Add support for mobile map view
8. Implement user settings and preferences
9. Add export/sharing functionality

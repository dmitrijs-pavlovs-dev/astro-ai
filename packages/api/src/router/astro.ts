import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { eq } from 'drizzle-orm'
import * as schema from '../db/schema'
import { calculatePlanetaryLines } from '../utils/astronomical'

export const astroRouter = router({
  // Submit birth data - for anonymous users
  submitBirthData: publicProcedure
    .input(
      z.object({
        name: z.string(),
        date: z.string(),
        time: z.string(),
        latitude: z.string(),
        longitude: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = ctx.db

        // DB operation: Insert birth data
        const id = crypto.randomUUID()
        const newBirthData = {
          ...input,
          id,
          createdAt: new Date().toISOString(),
        }

        await db.insert(schema.birthData).values(newBirthData)

        // Return the ID so it can be used to calculate planetary lines
        return { id: newBirthData.id, success: true }
      } catch (error) {
        console.error('Failed to submit birth data:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit birth data',
        })
      }
    }),

  // Calculate and store planetary lines for a birth data entry
  calculatePlanetaryLines: publicProcedure
    .input(z.object({ birthDataId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = ctx.db

        // DB operation: Get birth data by ID
        const birthDataResults = await db
          .select()
          .from(schema.birthData)
          .where(eq(schema.birthData.id, input.birthDataId))

        if (birthDataResults.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Birth data not found',
          })
        }

        const birthData = birthDataResults[0]

        // Calculate planetary lines using the utility function
        const lines = calculatePlanetaryLines({
          date: birthData.date,
          time: birthData.time,
          latitude: parseFloat(birthData.latitude),
          longitude: parseFloat(birthData.longitude),
        })

        // DB operation: Insert planetary lines
        const linesToInsert = lines.map((line) => ({
          id: crypto.randomUUID(),
          birthDataId: input.birthDataId,
          planet: line.planet,
          angleType: line.angleType,
          lineData: JSON.stringify(line.coordinates),
          createdAt: new Date().toISOString(),
        }))

        await db.insert(schema.planetaryLines).values(linesToInsert)

        return { success: true, lineCount: lines.length }
      } catch (error) {
        console.error('Failed to calculate planetary lines:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to calculate planetary lines',
        })
      }
    }),

  // Get planetary lines for a birth data entry
  getPlanetaryLines: publicProcedure
    .input(z.object({ birthDataId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = ctx.db

        // DB operation: Check if birth data exists
        const birthDataResults = await db
          .select()
          .from(schema.birthData)
          .where(eq(schema.birthData.id, input.birthDataId))

        if (birthDataResults.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Birth data not found',
          })
        }

        // DB operation: Get planetary lines by birth data ID
        const linesData = await db
          .select()
          .from(schema.planetaryLines)
          .where(eq(schema.planetaryLines.birthDataId, input.birthDataId))

        // Format the response
        const formattedLines = linesData.map((line) => ({
          id: line.id,
          planet: line.planet,
          angleType: line.angleType,
          coordinates: JSON.parse(line.lineData),
        }))

        return formattedLines
      } catch (error) {
        console.error('Failed to get planetary lines:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get planetary lines',
        })
      }
    }),

  // Get birth data for user (if needed in the future)
  getUserBirthData: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = ctx.db

        // DB operation: Get birth data by user ID
        const birthDataList = await db
          .select()
          .from(schema.birthData)
          .where(eq(schema.birthData.userId, input.userId))

        return birthDataList
      } catch (error) {
        console.error('Failed to get user birth data:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user birth data',
        })
      }
    }),
})

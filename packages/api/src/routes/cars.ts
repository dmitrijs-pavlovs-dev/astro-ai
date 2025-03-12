import { CarTable } from '../db/schema'
import { publicProcedure, router } from '../trpc'
import { sql } from 'drizzle-orm'

export const carsRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx
    // Log all available tables
    console.log('Available tables in database:')
    try {
      // Use raw SQL to get table information instead of introspection API
      const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`)
      console.log('Tables:', tables)
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
    const allCars = await db.select().from(CarTable).all()
    return allCars
  }),
})

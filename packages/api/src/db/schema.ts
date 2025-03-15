import { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot'

// User
export const UserTable = sqliteTable('User', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
})

export type User = InferSelectModel<typeof UserTable>
export type InsertUser = InferInsertModel<typeof UserTable>
export const insertUserSchema = createInsertSchema(UserTable)
export const selectUserSchema = createSelectSchema(UserTable)

// Car
export const CarTable = sqliteTable('Car', {
  id: text('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  color: text('color').notNull(),
  price: real('price').notNull(),
  mileage: integer('mileage').notNull(),
  fuelType: text('fuelType').notNull(),
  transmission: text('transmission').notNull(),
})

export type Car = InferSelectModel<typeof CarTable>
export type InsertCar = InferInsertModel<typeof CarTable>
export const insertCarSchema = createInsertSchema(CarTable)
export const selectCarSchema = createSelectSchema(CarTable)

// Birth Data
export const birthData = sqliteTable('birth_data', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  userId: text('user_id').references(() => UserTable.id), // Optional - will be null for anonymous users
  createdAt: text('created_at').notNull(),
})

export type BirthData = InferSelectModel<typeof birthData>
export type InsertBirthData = InferInsertModel<typeof birthData>
export const insertBirthDataSchema = createInsertSchema(birthData)
export const selectBirthDataSchema = createSelectSchema(birthData)

// Planetary Lines
export const planetaryLines = sqliteTable('planetary_lines', {
  id: text('id').primaryKey(),
  birthDataId: text('birth_data_id')
    .notNull()
    .references(() => birthData.id),
  planet: text('planet').notNull(),
  angleType: text('angle_type').notNull(), // Conjunction, opposition, etc.
  lineData: text('line_data').notNull(), // JSON string of GeoJSON
  createdAt: text('created_at').notNull(),
})

export type PlanetaryLine = InferSelectModel<typeof planetaryLines>
export type InsertPlanetaryLine = InferInsertModel<typeof planetaryLines>
export const insertPlanetaryLineSchema = createInsertSchema(planetaryLines)
export const selectPlanetaryLineSchema = createSelectSchema(planetaryLines)

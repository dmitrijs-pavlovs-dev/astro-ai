import type { Config } from 'drizzle-kit'
import 'dotenv/config'

export default {
  schema: './src/db/schema.ts',
  out: './migrations',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: 'wrangler.toml',
    dbName: 'astro-ai-prod-db',
  },
  verbose: false,
  strict: true,
} satisfies Config

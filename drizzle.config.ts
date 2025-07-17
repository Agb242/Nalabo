import { defineConfig } from "drizzle-kit";

// Load environment variables
import { config } from 'dotenv';
config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Please add your database connection string to the .env file or Replit Secrets.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

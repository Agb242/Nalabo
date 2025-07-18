import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './shared/schema';
import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

dotenv.config();

async function main() {
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Create a Drizzle instance
  const db = drizzle(pool, { schema });
  
  console.log('Running migrations...');
  
  // Run the migrations
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('Migrations completed successfully!');
  
  // Close the connection
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});

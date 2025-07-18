import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from 'dotenv';

// Load environment variables
config();

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false; // Disable pipeline connection

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please add your database connection string to the .env file.",
  );
}

// Add application name to connection string
const connectionString = process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'application_name=nalabo_app';

// Create a connection pool with better timeout and reconnection settings
export const pool = new Pool({ 
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Reduced max connections to prevent exhausting server limits
  min: 1,   // Maintain a minimum number of connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close and remove a connection after it has been used this many times
  allowExitOnIdle: true,
});

// Handle connection errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

// Clean up on process exit
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

// Configuration pour la reconnexion automatique
pool.on('error', (err) => {
  console.error('Database connection error:', err);
  if (err.message.includes('terminating connection')) {
    console.log('🔄 Tentative de reconnexion automatique...');
    // La reconnexion sera gérée automatiquement par le pool
  }
});

pool.on('connect', () => {
  console.log('✅ Connexion base de données établie');
});

pool.on('end', () => {
  console.log('⚠️ Connexion base de données fermée');
});

export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Test the initial connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database');
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    throw error; // Let the main application handle connection errors
  }
}

// Only test connection if not in production
if (process.env.NODE_ENV === 'development') {
  testConnection().catch(console.error);
}
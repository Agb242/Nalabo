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

// Create a connection pool with enhanced retry logic and stability
export const pool = new Pool({ 
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 3, // Reduced for stability
  min: 1,
  idleTimeoutMillis: 60000, // Extended idle timeout
  connectionTimeoutMillis: 15000, // Extended connection timeout
  maxUses: 5000,
  allowExitOnIdle: true,
  // Enhanced retry configuration
  retryOnFailure: true,
  retryDelay: 1000,
  maxRetries: 3,
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

// Configuration pour la reconnexion automatique avec retry logic
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

pool.on('error', async (err) => {
  console.error('Database connection error:', err);

  if (err.message.includes('terminating connection') || err.code === 'ECONNRESET') {
    reconnectAttempts++;
    console.log(`🔄 Tentative de reconnexion ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);

    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      setTimeout(async () => {
        try {
          await testConnection();
          reconnectAttempts = 0; // Reset on successful connection
          console.log('✅ Reconnexion réussie');
        } catch (retryError) {
          console.error('❌ Échec de la reconnexion:', retryError);
        }
      }, 2000 * reconnectAttempts); // Exponential backoff
    }
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
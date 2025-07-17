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
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  max: 10, // Reduced max connections to prevent exhausting server limits
  min: 2,   // Maintain a minimum number of connections
  idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  maxUses: 5000, // Close and remove a connection after it has been used this many times
  allowExitOnIdle: true,
});

// Handle connection errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  // Attempt to reconnect after a delay
  setTimeout(() => {
    pool.connect().catch(e => console.error('Reconnection attempt failed:', e));
  }, 1000);
});

// Add a heartbeat to keep connections alive
const heartbeatInterval = setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error('Heartbeat failed:', error);
  }
}, 300000); // Every 5 minutes

// Clean up on process exit
process.on('exit', () => {
  clearInterval(heartbeatInterval);
  pool.end().catch(console.error);
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
    // Attempt to reconnect after a delay
    setTimeout(testConnection, 5000);
  }
}

testConnection();
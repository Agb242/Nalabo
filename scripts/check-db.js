#!/usr/bin/env node

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { config } from 'dotenv';

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;

// Load environment variables
config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

// Check database connection
async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('✅ Successfully connected to the database');
    
    // Check required tables
    const requiredTables = ['users', 'user_sessions', 'workshops'];
    const { rows } = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    const existingTables = rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables.join(', '));
      console.log('\nTo create missing tables, run:');
      console.log('   npm run db:push');
      process.exit(1);
    }
    
    console.log('✅ Toutes les tables requises sont présentes');
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :');
    console.error(error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabase();

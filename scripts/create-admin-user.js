#!/usr/bin/env node

import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Load environment variables
config();

async function createAdminUser() {
  console.log('🔐 Création d\'un utilisateur administrateur...');
  
  const adminData = {
    username: 'admin',
    email: 'admin@nalabo.tech',
    password: await bcrypt.hash('Nalabo2025!', 12),
    firstName: 'Super',
    lastName: 'Admin',
    role: 'admin',
    points: 1000,
  };

  try {
    // Check if admin already exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, 'admin'));
    if (existingAdmin) {
      console.log('✅ Utilisateur admin existe déjà');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rôle: ${existingAdmin.role}`);
      return;
    }

    // Create admin user
    const [admin] = await db.insert(users).values(adminData).returning();
    console.log('✅ Utilisateur admin créé avec succès');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Mot de passe: Nalabo2025!`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    process.exit(1);
  }
}

createAdminUser();
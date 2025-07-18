
#!/usr/bin/env node

const { db } = require('../server/db');
const { users } = require('../shared/schema');
const bcrypt = require('bcrypt');
const { eq } = require('drizzle-orm');

async function createInitialAdmin() {
  try {
    console.log('🔧 Vérification du compte admin...');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Un compte admin existe déjà');
      return;
    }

    // Créer le compte admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [admin] = await db.insert(users).values({
      username: 'admin',
      email: 'admin@nalabo.local',
      password: hashedPassword,
      role: 'admin',
    }).returning();

    console.log('✅ Compte admin créé avec succès');
    console.log('📧 Email: admin@nalabo.local');
    console.log('🔑 Mot de passe: admin123');
    console.log('⚠️  Changez le mot de passe après la première connexion');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
  }
}

createInitialAdmin();

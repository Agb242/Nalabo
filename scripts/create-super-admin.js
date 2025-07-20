import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from '../shared/schema.js';

// Charger les variables d'environnement
config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createSuperAdmin() {
  try {
    console.log('🔧 Création du super administrateur...');

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Données du super admin
    const superAdminData = {
      username: 'superadmin',
      email: 'admin@nalabo.com',
      password: hashedPassword,
      role: 'super_admin',
      subscription: 'enterprise',
      permissions: {
        infrastructure: true,
        userManagement: true,
        communityManagement: true,
        auditAccess: true,
        systemSettings: true,
        billingManagement: true
      },
      title: 'Super Administrateur',
      points: 10000,
      bio: 'Administrateur système principal de la plateforme Nalabo'
    };

    // Vérifier si le super admin existe déjà
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, superAdminData.email))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('⚠️  Le super administrateur existe déjà');
      console.log('📧 Email:', superAdminData.email);
      console.log('👤 Username:', superAdminData.username);
      return;
    }

    // Créer le super admin
    const [newSuperAdmin] = await db
      .insert(users)
      .values(superAdminData)
      .returning();

    console.log('✅ Super administrateur créé avec succès !');
    console.log('📧 Email:', newSuperAdmin.email);
    console.log('👤 Username:', newSuperAdmin.username);
    console.log('🔑 Mot de passe temporaire: admin123');
    console.log('🔒 Rôle:', newSuperAdmin.role);
    console.log('');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion');
    console.log('');
    console.log('🌐 Connectez-vous via: http://localhost:5000');
    console.log('➡️  Accès Super Admin: http://localhost:5000/super-admin');

  } catch (error) {
    console.error('❌ Erreur lors de la création du super admin:', error);
    process.exit(1);
  }
}

// Import eq pour les requêtes
import { eq } from 'drizzle-orm';

// Exécuter le script
createSuperAdmin()
  .then(() => {
    console.log('🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
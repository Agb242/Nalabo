
const { storage } = require('../server/storage');
const { hashPassword } = require('../server/auth');

async function createDefaultAdmin() {
  try {
    console.log('🔧 Création de l\'utilisateur admin par défaut...');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await storage.getUserByUsername('admin');
    if (existingAdmin) {
      console.log('✅ Utilisateur admin existe déjà');
      return;
    }

    // Créer l'utilisateur admin
    const hashedPassword = await hashPassword('admin123!');
    
    const adminUser = await storage.createUser({
      username: 'admin',
      email: 'admin@nalabo.dev',
      password: hashedPassword,
      firstName: 'Administrateur',
      lastName: 'Nalabo',
      role: 'admin',
      points: 0,
    });

    console.log('✅ Utilisateur admin créé avec succès:');
    console.log('   Username: admin');
    console.log('   Password: admin123!');
    console.log('   Email: admin@nalabo.dev');
    console.log('⚠️  CHANGEZ LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

createDefaultAdmin().then(() => {
  console.log('🎉 Configuration admin terminée');
  process.exit(0);
});

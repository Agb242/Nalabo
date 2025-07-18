
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Créer un index pour améliorer les performances
CREATE INDEX idx_users_role ON users(role);

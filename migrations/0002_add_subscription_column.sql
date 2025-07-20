-- Add subscription column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription text DEFAULT 'free';

-- Add community_id column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS community_id integer;

-- Add foreign key constraint for community_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_community_id_communities_id_fk') THEN
        ALTER TABLE users ADD CONSTRAINT users_community_id_communities_id_fk 
        FOREIGN KEY (community_id) REFERENCES communities(id);
    END IF;
END $$;

-- Add permissions column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions json;
-- Create user_sessions table for connect-pg-simple
CREATE TABLE IF NOT EXISTS user_sessions (
  sid VARCHAR PRIMARY KEY NOT NULL,
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions (expire);

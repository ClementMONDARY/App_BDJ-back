-- Enable UUID extension if not already enabled (though gen_random_uuid is often built-in)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Public Profile)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    firstname TEXT,
    lastname TEXT,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin', 'moderator'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Auth table (Private Credentials)
-- 1:1 relationship with users
CREATE TABLE IF NOT EXISTS user_auth (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_auth_email ON user_auth(email);

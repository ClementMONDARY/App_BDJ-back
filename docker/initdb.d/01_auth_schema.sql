CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    firstname TEXT,
    lastname TEXT,
    avatar TEXT,
    bio TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_auth (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
INSERT INTO users (id, username, firstname, lastname, avatar, bio, role, created_at) VALUES
('ea9016f3-26b1-407e-8b66-9ee860b55c50', 'testuser', 'Test', 'User', NULL, NULL, 'admin', '2025-12-12T14:58:29.680Z'::TIMESTAMPTZ);

INSERT INTO user_auth (user_id, email, password_hash) VALUES
('ea9016f3-26b1-407e-8b66-9ee860b55c50', 'test@example.com', '$argon2id$v=19$m=65536,t=3,p=4$J09SdGH1kvRtUbW+Z8omSw$2MFFtucDvfp1b8thEaBgu6FGHgqEK84LEiPZYrS2MmI');

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_auth_email ON user_auth(email);

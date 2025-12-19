CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suggestion_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('up', 'down')),
    UNIQUE (suggestion_id, user_id)
);

INSERT INTO suggestions (id, user_id, title, content, upvotes, downvotes, created_at) VALUES
('68322a63-1878-4e0a-85ee-941fcf95a4e5', 'ea9016f3-26b1-407e-8b66-9ee860b55c50', 'Espace Forum', 'Un espace forum sur l''appli', 10, 2, '2025-12-12 15:19:40.951');


CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);

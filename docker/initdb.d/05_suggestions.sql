CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suggestion_votes (
    id SERIAL PRIMARY KEY,
    suggestion_id INT REFERENCES suggestions(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('up', 'down')),
    UNIQUE (suggestion_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);

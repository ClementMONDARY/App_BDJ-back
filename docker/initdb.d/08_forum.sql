CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    cover_image TEXT,
    attachment_urls TEXT[],
    view_count INT DEFAULT 0 NOT NULL,
    like_count INT DEFAULT 0 NOT NULL,
    msg_count INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INT REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_likes (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS topic_follows (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_topic_id ON posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);


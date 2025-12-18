CREATE TYPE question_status AS ENUM ('pending', 'answered', 'rejected');

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message VARCHAR(250) NOT NULL,
    answer TEXT,
    status question_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO questions (id, user_id, message, answer, status, created_at) VALUES
('f029d7ba-9fba-4954-8e0d-1482e7c6b471', 'ea9016f3-26b1-407e-8b66-9ee860b55c50', 'A party in the woods', 'Great idea, lets do this !', 'answered', '2025-12-12 14:35:51.371'),
('ff18da8b-bad1-4648-96c0-d1ea62bd0ffa', 'ea9016f3-26b1-407e-8b66-9ee860b55c50', 'A secret santa among all classes', NULL, 'pending', '2025-12-12 14:37:44.654');

CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

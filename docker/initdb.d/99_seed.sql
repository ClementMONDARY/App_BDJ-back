-- --------------------------------------------------------------------------------
-- 99_seed_data.sql (CORRIGÉ)
-- --------------------------------------------------------------------------------

-- 1. Create extra users (Alice & Bob)
INSERT INTO users (id, username, firstname, lastname, avatar, bio, role) VALUES
('a0000000-0000-4000-a000-000000000001', 'alice', 'Alice', 'Wonderland', 'https://avatar.iran.liara.run/public/girl?username=alice', 'Love tech and tea.', 'user'),
('b0000000-0000-4000-a000-000000000002', 'bob', 'Bob', 'Builder', 'https://avatar.iran.liara.run/public/boy?username=bob', 'Can we fix it?', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_auth (user_id, email, password_hash) VALUES
('a0000000-0000-4000-a000-000000000001', 'alice@example.com', '$argon2id$v=19$m=65536,t=3,p=4$WwPzThqQfwandadzmpr9+g$ELX+ePYqTiRtCvHATQhSTTnXtPdbwHMZAv6pqMcgbI0'), -- password123
('b0000000-0000-4000-a000-000000000002', 'bob@example.com', '$argon2id$v=19$m=65536,t=3,p=4$WwPzThqQfwandadzmpr9+g$ELX+ePYqTiRtCvHATQhSTTnXtPdbwHMZAv6pqMcgbI0') -- password123
ON CONFLICT (user_id) DO NOTHING;

-- 2. Articles
INSERT INTO articles (id, author_id, title, content, cover_image, view_count, like_count) VALUES
('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Welcome to the Platform', 'This is the first official article.', 'https://picsum.photos/seed/article1/800/400', 120, 2);

INSERT INTO article_likes (user_id, article_id) VALUES
('b0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001');

-- 3. Forum
INSERT INTO categories (id, name, slug, description) VALUES
('d0000000-0000-4000-a000-000000000001', 'General', 'general', 'General discussions'),
('d0000000-0000-4000-a000-000000000002', 'Tech Support', 'tech-support', 'Get help');

INSERT INTO topics (id, author_id, category_id, title, slug, content, msg_count) VALUES
('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000001', 'Hello World', 'hello-world', 'Just saying hello!', 2);

INSERT INTO posts (id, topic_id, author_id, content) VALUES
('f0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Just saying hello!'),
('f0000000-0000-4000-a000-000000000002', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Hi Bob! Welcome!');

-- 4. Events (Utilisation de l'ID de Bob b000...0002 comme organisateur)
INSERT INTO events (id, organizer_id, title, description, cover_image, start_time, end_time, location, price, max_capacity, current_attendees) VALUES
('a0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Launch Party', 'Join us!', 'https://picsum.photos/seed/event1/800/400', NOW() + interval '7 days', NOW() + interval '7 days 4 hours', 'Main Hall', 4.95, 100, 1);

-- Alice is registered to the event
INSERT INTO event_registrations (event_id, user_id, status) VALUES
('a0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'registered');

-- 5. Notifications
INSERT INTO notifications (id, user_id, type, title, content, is_read, resource_data) VALUES
('a0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'reply', 'New reply', 'Alice replied.', FALSE, '{"topic_id": "e0000000-0000-4000-a000-000000000001"}');

-- 6. Messaging (CORRIGÉ : IDs valides et nombre de colonnes correct)
-- Conversation DIRECT entre Alice et Bob
INSERT INTO conversations (id, type) VALUES
('d0000000-0000-4000-a000-000000000001', 'direct');

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
('d0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002'), -- Bob
('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001'); -- Alice

-- Messages : (conversation_id, sender_id, content) -> on retire l'ID du message car souvent auto-généré, sinon ajoutez l'ID en premier.
-- Je suppose ici que votre table messages a un ID auto (DEFAULT gen_random_uuid()). 
-- Si vous devez forcer l'ID du message, ajoutez la colonne ID.
INSERT INTO messages (conversation_id, sender_id, content) VALUES
('d0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Hey Admin, found a bug!'),
('d0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Thanks Alice, please report it.');

-- 7. Suggestions (IDs alignés)
INSERT INTO suggestions (id, user_id, title, content, upvotes, downvotes) VALUES
('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Forum Section', 'Add forum', 1, 0);

INSERT INTO suggestion_votes (id, suggestion_id, user_id, type) VALUES
('a0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'up');
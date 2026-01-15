-- --------------------------------------------------------------------------------
-- 99_seed_data.sql
-- --------------------------------------------------------------------------------

-- 1. Create extra users (Alice & Bob) if they don't exist
-- We use ON CONFLICT DO NOTHING to avoid errors on restarts if IDs collide,
-- though ideally we clean DB on restart.

INSERT INTO users (id, username, firstname, lastname, avatar, bio, role) VALUES
('a0000000-0000-4000-a000-000000000001', 'alice', 'Alice', 'Wonderland', 'https://avatar.iran.liara.run/public/girl?username=alice', 'Love tech and tea.', 'user'),
('b0000000-0000-4000-a000-000000000002', 'bob', 'Bob', 'Builder', 'https://avatar.iran.liara.run/public/boy?username=bob', 'Can we fix it?', 'moderator')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_auth (user_id, email, password_hash) VALUES
('a0000000-0000-4000-a000-000000000001', 'alice@example.com', '$argon2id$v=19$m=65536,t=3,p=4$WwPzThqQfwandadzmpr9+g$ELX+ePYqTiRtCvHATQhSTTnXtPdbwHMZAv6pqMcgbI0'), -- password123
('b0000000-0000-4000-a000-000000000002', 'bob@example.com', '$argon2id$v=19$m=65536,t=3,p=4$WwPzThqQfwandadzmpr9+g$ELX+ePYqTiRtCvHATQhSTTnXtPdbwHMZAv6pqMcgbI0') -- password123
ON CONFLICT (user_id) DO NOTHING;

-- 2. Articles
-- Admin (testuser) writes an article
INSERT INTO articles (id, author_id, title, content, cover_image, view_count, like_count) VALUES
('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Welcome to the Platform', 'This is the first official article. We are excited to have you here!', 'https://picsum.photos/seed/article1/800/400', 120, 2);

-- Bob likes the article
INSERT INTO article_likes (user_id, article_id) VALUES
('b0000000-0000-4000-a000-000000000002', 'c0000000-0000-4000-a000-000000000001');


-- 3. Forum
-- Categories
INSERT INTO categories (id, name, slug, description) VALUES
('d0000000-0000-4000-a000-000000000001', 'General', 'general', 'General discussions about everything'),
('d0000000-0000-4000-a000-000000000002', 'Tech Support', 'tech-support', 'Get help with your issues');

-- Topics
-- Bob posts in General
INSERT INTO topics (id, author_id, category_id, title, slug, content, msg_count) VALUES
('e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000001', 'Hello World', 'hello-world', 'Just saying hello to everyone!', 2);

-- Initial post for the topic
INSERT INTO posts (id, topic_id, author_id, content) VALUES
('f0000000-0000-4000-a000-000000000001', 'e0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'Just saying hello to everyone!');

-- Alice replies
INSERT INTO posts (id, topic_id, author_id, content) VALUES
('f0000000-0000-4000-a000-000000000002', 'e0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Hi Bob! Welcome!');


-- 4. Events
-- Admin organizes an event
INSERT INTO events (id, organizer_id, title, description, cover_image, start_time, end_time, location, price, max_capacity, current_attendees) VALUES
('g0000000-0000-4000-a000-000000000001', 'ea9016f3-26b1-407e-8b66-9ee860b55c50', 'Launch Party', 'Join us for the official launch party!', 'https://picsum.photos/seed/event1/800/400', NOW() + interval '7 days', NOW() + interval '7 days 4 hours', 'Main Hall', 0, 100, 2);

-- Alice and Bob register
INSERT INTO event_registrations (event_id, user_id, status) VALUES
('g0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'registered'),
('g0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000002', 'registered');


-- 5. Notifications
-- Notify Bob that Alice replied (mock data)
INSERT INTO notifications (user_id, type, title, content, is_read, resource_data) VALUES
('b0000000-0000-4000-a000-000000000002', 'reply', 'New reply in "Hello World"', 'Alice replied to your topic.', FALSE, '{"topic_id": "e0000000-0000-4000-a000-000000000001"}');


-- 6. Messaging
-- Conversation between Alice and Admin
INSERT INTO conversations (id, type) VALUES
('h0000000-0000-4000-a000-000000000001', 'direct');

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
('h0000000-0000-4000-a000-000000000001', 'ea9016f3-26b1-407e-8b66-9ee860b55c50'),
('h0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001');

INSERT INTO messages (conversation_id, sender_id, content) VALUES
('i0000000-0000-4000-a000-000000000001', 'h0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Hey Admin, I found a bug!'),
('i0000000-0000-4000-a000-000000000002', 'h0000000-0000-4000-a000-000000000001', 'ea9016f3-26b1-407e-8b66-9ee860b55c50', 'Thanks Alice, can you report it in the forum?');

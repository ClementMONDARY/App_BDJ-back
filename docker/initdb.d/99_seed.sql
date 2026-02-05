-- --------------------------------------------------------------------------------
-- 99_seed_data.sql
-- --------------------------------------------------------------------------------

-- 1. Create extra users (Alice & Bob)
INSERT INTO users (id, username, firstname, lastname, avatar, bio, follower_count, following_count, role) VALUES
(1, 'alice', 'Alice', 'Wonderland', 'https://avatar.iran.liara.run/public/girl?username=alice', 'Love tech and tea.', 1, 1, 'user'),
(2, 'bob', 'Bob', 'Builder', 'https://avatar.iran.liara.run/public/boy?username=bob', 'Can we fix it?', 1, 1, 'admin')
ON CONFLICT (id) DO NOTHING;

-- 1.1 Follows
-- ALice and Bob follow each others
INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2),
(2, 1);

INSERT INTO user_auth (user_id, email, password_hash) VALUES
(1, 'alice@example.com', '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(2, 'bob@example.com', '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk') -- password123
ON CONFLICT (user_id) DO NOTHING;

-- 2. Articles
INSERT INTO articles (id, author_id, title, content, cover_image, view_count, like_count) VALUES
(1, 2, 'Welcome to the Platform', 'This is the first official article.', 'https://picsum.photos/seed/article1/800/400', 120, 2);

INSERT INTO article_likes (user_id, article_id) VALUES
(2, 1);

-- 3. Forum (Topics & Posts, plus de categories)
INSERT INTO topics (id, author_id, title, content, cover_image, attachment_urls, msg_count) VALUES
(1, 1, 'Hello World', 'Just saying hello to everyone!', 'https://picsum.photos/seed/topic1/800/400', '{"https://picsum.photos/seed/topic1/600/200"}', 3);

INSERT INTO posts (id, topic_id, author_id, parent_id, content) VALUES
(1, 1, 2, null, 'Just saying hello!'),
(2, 1, 1, null, 'Hi Bob! Welcome!'),
(3, 1, 2, 2, 'Your so kind Alice!');

-- 4. Events (Utilisation de l'ID de Bob 2 comme organisateur)
INSERT INTO events (id, organizer_id, title, description, cover_image, start_time, end_time, location, price, max_capacity, current_attendees) VALUES
(1, 2, 'Launch Party', 'Join us!', 'https://picsum.photos/seed/event1/800/400', NOW() + interval '7 days', NOW() + interval '7 days 4 hours', 'Main Hall', 4.95, 100, 1);

-- Alice is registered to the event
INSERT INTO event_registrations (event_id, user_id, status) VALUES
(1, 1, 'registered');

-- 5. Notifications
INSERT INTO notifications (id, user_id, type, title, content, is_read, resource_data) VALUES
(1, 2, 'forum', 'Forum • New topic: Hello World', 'Alice created a new topic named "Hello World", are you interested?', FALSE, '{"topic_id": 1}');

-- 6. Messaging
-- Conversation entre Alice et Bob
INSERT INTO conversations (id, title) VALUES
(1, 'Alice & Bob');

-- Conversation participants
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 2), -- Bob
(1, 1); -- Alice

-- Conversation messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(1, 1, 'Hey Admin, found a bug!'),
(1, 2, 'Thanks Alice, please report it.');

-- 7. Suggestions (IDs alignés)
INSERT INTO suggestions (id, user_id, title, content, upvotes, downvotes) VALUES
(1, 2, 'Forum Section', 'Add forum', 1, 0);

INSERT INTO suggestion_votes (id, suggestion_id, user_id, type) VALUES
(1, 1, 1, 'up');

-- 8. Questions
INSERT INTO questions (id, user_id, message, answer, status, created_at) VALUES
(1, 2, 'Rorem ipsum dolor sit amet, consectetur adipiscing elit ?', 'Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis.\n\nUt commodo efficitur neque. Ut diam quam, semper iaculis condimentum ac, vestibulum eu nisl. Curabitur tempus urna at turpis condimentum lobortis.', 'answered', '2025-12-12 14:35:51.371'),
(2, 1, 'A secret santa among all classes', NULL, 'pending', '2025-12-12 14:37:44.654');


-- --------------------------------------------------------------------------------
-- 9. RESET SEQUENCES
-- --------------------------------------------------------------------------------
ALTER SEQUENCE users_id_seq RESTART WITH 3;
ALTER SEQUENCE articles_id_seq RESTART WITH 2;
ALTER SEQUENCE topics_id_seq RESTART WITH 2;
ALTER SEQUENCE posts_id_seq RESTART WITH 4;
ALTER SEQUENCE events_id_seq RESTART WITH 2;
ALTER SEQUENCE notifications_id_seq RESTART WITH 2;
ALTER SEQUENCE conversations_id_seq RESTART WITH 2;
ALTER SEQUENCE suggestions_id_seq RESTART WITH 2;
ALTER SEQUENCE suggestion_votes_id_seq RESTART WITH 2;
ALTER SEQUENCE questions_id_seq RESTART WITH 3;

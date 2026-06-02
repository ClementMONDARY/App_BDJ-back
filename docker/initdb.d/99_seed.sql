-- --------------------------------------------------------------------------------
-- 99_seed_data.sql
-- --------------------------------------------------------------------------------

-- 1. Create extra users (Alice, Bob + 5 nouveaux pour le forum)
INSERT INTO users (id, username, firstname, lastname, avatar, bio, follower_count, following_count, role) VALUES
(1, 'alice',   'Alice',   'Wonderland', '/assets/images/avatars/avatar_female_01.png',   'Love tech and tea.',          1, 1, 'user'),
(2, 'bob',     'Bob',     'Builder',    '/assets/images/avatars/avatar_male_01.png',       'Can we fix it?',              1, 1, 'admin'),
(3, 'charlie', 'Charlie', 'Chaplin',    '/assets/images/avatars/avatar_male_02.png',   'Silent but efficient.',       0, 0, 'user'),
(4, 'diana',   'Diana',   'Prince',     '/assets/images/avatars/avatar_female_02.png',   'Always on the move.',         0, 0, 'user'),
(5, 'eve',     'Eve',     'Online',     '/assets/images/avatars/avatar_female_03.png',     'Security enthusiast.',        0, 0, 'user'),
(6, 'frank',   'Frank',   'Sinatra',    '/assets/images/avatars/avatar_male_03.png',    'My way or the highway.',      0, 0, 'user'),
(7, 'grace',   'Grace',   'Hopper',     '/assets/images/avatars/avatar_female_00.png',   'Found the first bug. Literally.', 0, 0, 'user')
ON CONFLICT (id) DO NOTHING;

-- 1.1 Follows
-- Alice and Bob follow each other
INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2),
(2, 1);

INSERT INTO user_auth (user_id, email, password_hash) VALUES
(1, 'alice@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(2, 'bob@example.com',     '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(3, 'charlie@example.com', '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(4, 'diana@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(5, 'eve@example.com',     '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(6, 'frank@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'), -- password123
(7, 'grace@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk')  -- password123
ON CONFLICT (user_id) DO NOTHING;

-- 2. Articles
INSERT INTO articles (id, author_id, title, content, cover_image, view_count, like_count) VALUES
(1, 2, 'Bienvenue sur la plateforme BDJ !', 'Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.', 'https://picsum.photos/seed/article1/800/400', 320, 14),
(2, 2, 'Guide complet pour trouver un stage à l''étranger', 'Partir en stage à l''étranger est une expérience qui marque une carrière. Que ce soit au Royaume-Uni, en Irlande, en Allemagne ou au Canada, les opportunités sont nombreuses pour les étudiants qui savent où chercher. Dans cet article, nous vous guidons pas à pas : de la recherche d''offres jusqu''à votre arrivée sur place.

Commencez par identifier les plateformes dédiées : LinkedIn, Indeed International, Erasmus+, et les sites propres à chaque pays cible. N''oubliez pas le réseau de votre école, souvent sous-exploité.

Côté administratif, renseignez-vous tôt sur les visas (certains nécessitent 3 mois de délai), l''assurance maladie internationale, et les aides financières disponibles (OFII, région, bourse Erasmus). Pensez aussi à ouvrir un compte bancaire local dès votre arrivée pour éviter les frais de change.

Sur place, restez curieux et proactif. Les stages à l''étranger sont souvent plus autonomes qu''en France : c''est une chance de vous démarquer. Bonne chance à tous !', 'https://picsum.photos/seed/article2/800/400', 187, 9),
(3, 2, 'Débuter en développement web : par où commencer en 2025 ?', 'Le développement web attire chaque année de nombreux étudiants et reconvertis. Mais face à la multitude de langages, frameworks et tutoriels disponibles, difficile de savoir par où commencer. Voici une feuille de route claire et progressive.

Étape 1 — Les bases : HTML, CSS, JavaScript. Pas de raccourci possible. Maîtrisez le DOM, les sélecteurs CSS, et la manipulation du DOM en JS vanilla avant de passer à un framework.

Étape 2 — Choisissez un framework frontend. En 2025, React reste le plus demandé sur le marché, mais Vue.js et Svelte gagnent du terrain. Choisissez en fonction de vos objectifs professionnels.

Étape 3 — Le backend. Node.js avec Express ou Fastify pour rester en JavaScript, ou Python avec FastAPI si vous venez de la data. Apprenez les bases des API REST, de l''authentification et des bases de données relationnelles (PostgreSQL).

Étape 4 — Les outils du quotidien : Git, Docker, et un peu de CI/CD. Ces compétences font souvent la différence en entretien.

Restez curieux, construisez des projets concrets, et n''hésitez pas à contribuer à des projets open source. La communauté est là pour vous aider.', 'https://picsum.photos/seed/article3/800/400', 412, 31),
(4, 2, 'Retour sur notre soirée karaoké : une nuit inoubliable', 'Vendredi soir, le BDJ a mis le feu à la salle avec sa soirée karaoké annuelle. Plus de 80 étudiants réunis, des voix aussi diverses que talentueuses (ou pas, et c''est tout aussi bien), et une ambiance qui restera dans les mémoires.

La soirée a démarré timidement — comme toujours, les premières prestations sont celles des courageux. Mention spéciale à Frank et Diana pour leur duo improvisé sur "Don''t Stop Believin''" qui a littéralement déclenché une standing ovation.

Le point culminant ? Grace, habituellement si discrète, qui a enchaîné un medley de chansons des années 80 avec une aisance déconcertante. Personne ne l''avait vue venir.

Le BDJ remercie tous les participants, les bénévoles qui ont géré la sono et l''accueil, ainsi que le staff de la salle. Rendez-vous l''année prochaine pour une édition encore plus grande. Et oui, il y aura une coupe du monde de karaoké inter-promos.', 'https://picsum.photos/seed/article4/800/400', 256, 22),
(5, 2, 'Sécurité numérique : 5 réflexes essentiels pour les étudiants', 'On parle souvent de cybersécurité comme d''un sujet réservé aux experts. Pourtant, en tant qu''étudiant, vous êtes une cible privilégiée : emails institutionnels, accès aux réseaux de l''école, données personnelles... Voici 5 réflexes simples à adopter dès maintenant.

1. Utilisez un gestionnaire de mots de passe. Bitwarden, 1Password ou KeePass : choisissez-en un et arrêtez de réutiliser le même mot de passe partout. C''est la première source de compromission.

2. Activez la double authentification (2FA) partout où c''est possible. Gmail, GitHub, Discord... Un SMS ou une app comme Authy suffit à bloquer 99% des attaques par credential stuffing.

3. Méfiez-vous du phishing. Les mails d''hameçonnage imitent parfaitement les communications officielles. Vérifiez toujours l''adresse expéditrice et ne cliquez jamais sur un lien sans l''avoir inspecté.

4. Mettez à jour vos appareils. Les mises à jour corrigent des failles de sécurité critiques. Activez les mises à jour automatiques.

5. Évitez les Wi-Fi publics pour des opérations sensibles. Si vous devez les utiliser, passez par un VPN.

La sécurité numérique, ça s''apprend. Et vous avez toutes les ressources pour le faire.', 'https://picsum.photos/seed/article5/800/400', 143, 7);

INSERT INTO article_likes (user_id, article_id) VALUES
(2, 1), (3, 1), (4, 1),
(2, 2), (3, 2),
(1, 3), (2, 3), (4, 3), (5, 3),
(1, 4), (2, 4), (5, 4),
(1, 5), (3, 5);

-- 3. Forum (Topics & Posts, plus de categories)
INSERT INTO topics (id, author_id, title, content, cover_image, attachment_urls, view_count, msg_count) VALUES
(1, 1, 'Hello World', 'Just saying hello to everyone! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam facere sed consequatur consectetur fuga excepturi nesciunt eos earum voluptatem quidem, doloremque at odio, sapiente expedita quaerat delectus culpa velit reiciendis dolorum nobis debitis. Harum, mollitia eaque laudantium labore aliquam, nobis eius ipsam autem illum, in temporibus itaque? Atque consectetur et quo quasi consequatur ratione, iure repudiandae omnis aliquam explicabo dolor, autem ipsa sunt quas ullam quam quibusdam esse ex beatae dolores. Dolorum voluptatibus cumque voluptatem eos maxime repellendus, mollitia veniam doloremque nobis quod accusamus alias, a error ducimus, itaque quasi nisi tempora. Voluptas nihil, eveniet recusandae delectus at illo quis vero, esse consequuntur odit fugiat laborum harum. Dolores ab tempora architecto a sit odio totam praesentium tenetur debitis facilis sed, culpa quod, laborum nostrum doloremque nemo at cupiditate vero. Nobis corporis numquam omnis deleniti libero voluptatibus molestias quis ducimus velit tempora, laudantium sequi eligendi asperiores doloribus minus dolor temporibus voluptates, illo fugit autem sed aut, pariatur totam? Consequatur fugit necessitatibus eveniet? Voluptate, cum maiores nihil autem nesciunt aspernatur in ipsam, cupiditate modi facilis laboriosam repellendus dolore asperiores tenetur provident sunt. Quis ullam fugiat eos. Eveniet, beatae dolores ad rem sapiente voluptates, ullam maiores perferendis dolore ratione facere velit. Voluptatem sed suscipit vitae quia aliquid obcaecati, accusantium quidem inventore aspernatur, fugit odit consequatur odio. Saepe, reiciendis, assumenda eaque accusamus nesciunt debitis quos rerum sed distinctio consequuntur hic eum? Minima dignissimos tempore, nisi necessitatibus esse rem aperiam doloremque ullam. Odio voluptatem magni officiis aperiam voluptate, neque obcaecati pariatur accusantium quas. Nihil, dolor.', 'https://picsum.photos/seed/topic1/800/400', '{"https://picsum.photos/seed/topic1/600/200"}', 120, 10);

INSERT INTO posts (id, topic_id, author_id, parent_id, content) VALUES
(1,  1, 2, null, 'Just saying hello!'),
(2,  1, 1, null, 'Hi Bob! Welcome!'),
(3,  1, 2, 2,    'You''re so kind Alice!'),
(4,  1, 3, null, 'Great topic, love it!'),
(5,  1, 4, 4,    'Totally agree with Charlie.'),
(6,  1, 5, null, 'Has anyone checked the security implications here?'),
(7,  1, 6, 6,    'Good point Eve, always think about security!'),
(8,  1, 7, null, 'As Grace would say: if it works, ship it.'),
(9,  1, 3, 8,    'Haha, classic Grace mindset!'),
(10, 1, 4, 2,    'Alice, you always make everyone feel welcome!');

INSERT INTO topics (id, author_id, title, content, cover_image, view_count, like_count, msg_count) VALUES
(2, 3, 'Retour d''expérience stage développeur 2024',
 'Je reviens tout juste d''un stage de 6 mois dans une startup parisienne en tant que développeur full-stack. Stack utilisée : React Native, Node.js/Fastify et PostgreSQL. Points forts : équipe soudée, beaucoup d''autonomie dès la 2e semaine, revues de code très formatives. Point faible : les horaires étaient chargés en fin de sprint. N''hésitez pas à me poser vos questions !',
 'https://picsum.photos/seed/topic2/800/400', 85, 1, 5),
(3, 4, 'Organisation du tournoi de foot inter-promos',
 'Je propose d''organiser un tournoi de football entre les différentes promotions le samedi 15 mars sur les terrains du campus. Équipes de 5, chaque promo peut en aligner jusqu''à 2. Pour s''inscrire, répondez ici avec le nom de votre équipe et la liste des joueurs. Arbitres bénévoles bienvenus ! Le gagnant remporte une pizza offerte par le BDJ.',
 'https://picsum.photos/seed/topic3/800/400', 42, 1, 3),
(4, 5, 'Conseils pour un stage à l''étranger',
 'Bonjour à tous, je cherche un stage de fin d''études à l''étranger (UK ou Irlande). Quelqu''un a déjà fait ça ? Quelles démarches pour le visa, l''assurance, le logement ? Comment trouver des offres ? Y a-t-il des aides financières disponibles ? Merci d''avance !',
 NULL, 31, 1, 2),
(5, 6, 'Idées pour la prochaine soirée BDJ',
 'Le BDJ organise sa prochaine soirée le mois prochain et on cherche des idées originales ! L''an dernier on avait fait un karaoké mémorable. Cette année on veut quelque chose de différent. Pistes envisagées : soirée jeux de société, bowling, escape game, soirée déguisée. Votez en commentaire et proposez vos idées ! Budget : environ 15 € par personne.',
 'https://picsum.photos/seed/topic5/800/400', 198, 2, 8);

INSERT INTO posts (id, topic_id, author_id, parent_id, content) VALUES
(11, 2, 1, NULL, 'Super retour d''expérience Charlie ! Fastify c''est vraiment top pour les perfs.'),
(12, 2, 2, 11,   'Tout à fait, on l''utilise aussi sur nos projets internes.'),
(13, 2, 4, NULL, 'Quelles étaient les conditions de rémunération si c''est pas indiscret ?'),
(14, 2, 3, 13,   'Gratification légale + tickets restaurant, la norme en startup.'),
(15, 2, 7, NULL, 'Merci pour le partage ! Tu as un contact là-bas si on cherche un stage ?'),
(16, 3, 1, NULL, 'Je suis partante ! Je monte une équipe avec des filles de ma promo.'),
(17, 3, 2, NULL, 'On s''inscrit aussi côté promo 2023. On vous attend sur le terrain !'),
(18, 3, 5, 16,   'Super ! On sera peut-être dans la même poule Alice.'),
(19, 4, 1, NULL, 'J''ai fait un stage à Londres l''an dernier. Pour moins de 6 mois, le visa n''est plus requis post-Brexit, mais vérifie bien les conditions actuelles.'),
(20, 4, 6, NULL, 'Ouvre un compte bancaire local dès ton arrivée, ça évite les frais de change.'),
(21, 5, 1, NULL, 'Soirée jeux de société pour moi !'),
(22, 5, 2, 21,   '+1 pour les jeux de société, Catan ou 7 Wonders !'),
(23, 5, 3, NULL, 'Soirée bowling ? Ça faisait longtemps !'),
(24, 5, 4, 23,   'Le bowling c''est toujours sympa en groupe.'),
(25, 5, 7, NULL, 'Escape game ce serait original ! On n''a jamais fait ça ensemble.'),
(26, 5, 5, 25,   'Super idée ! Ça renforce la cohésion.'),
(27, 5, 1, 25,   '+1 pour l''escape game !'),
(28, 5, 6, NULL, 'Karaokéééé ! La soirée de l''année dernière était légendaire.');

-- Topic follows (like_count reflects number of follows)
INSERT INTO topic_follows (user_id, topic_id) VALUES
(2, 1), (3, 1),
(4, 2),
(1, 3),
(5, 4),
(2, 5), (7, 5);

UPDATE topics SET like_count = 2 WHERE id = 1;

-- Events
INSERT INTO events (id, organizer_id, title, description, cover_image, start_time, end_time, location, price, max_capacity, current_attendees) VALUES
(1, 2, 'Launch Party', 'Join us for the launch of our new platform! Food, drinks, and good vibes guaranteed.', 'https://picsum.photos/seed/event1/800/400', NOW() + interval '7 days', NOW() + interval '7 days 4 hours', 'Main Hall', 4.95, 100, 1),
(2, 2, 'Soirée JDR', 'Une soirée autour d''une partie de jeu de rôle, pour les experts ou débutants, tout le monde est accepté et encouragé à passer un bon moment avec nos maîtres du jeu.', 'https://picsum.photos/seed/event2/800/400', NOW() + interval '3 days', NOW() + interval '3 days 3 hours', 'Salle B', null, 5, 3),
(3, 2, 'Concert Acoustique', 'Une soirée musicale intime avec nos artistes locaux. Places très limitées.', 'https://picsum.photos/seed/event3/800/400', NOW() + interval '14 days', NOW() + interval '14 days 2 hours', 'Amphithéâtre', 9.99, 4, 4),
(4, 2, 'Atelier Passé', 'Cet événement est terminé. Visible uniquement via le filtre "Tous".', 'https://picsum.photos/seed/event4/800/400', NOW() - interval '7 days', NOW() - interval '7 days 2 hours', 'Salle A', null, 20, 12);

-- Alice (user_id=1) est inscrite à l'event 1
INSERT INTO event_registrations (event_id, user_id, status) VALUES
(1, 1, 'registered');


-- 5. Notifications
INSERT INTO notifications (id, user_id, type, title, content, is_read, resource_data) VALUES
(1, 2, 'forum', 'Forum • New topic: Hello World', 'Alice created a new topic named "Hello World", are you interested?', FALSE, '{"topic_id": 1}'),
(2, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(3, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(4, 2, 'message', 'Alice • New message', 'Alice sent you a message.', FALSE, '{"conversation_id": 1}'),
(5, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(6, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(7, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(8, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(9, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(10, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(11, 2, 'forum', 'Forum • New topic: Hello World', 'Alice created a new topic named "Hello World", are you interested?', FALSE, '{"topic_id": 1}'),
(12, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(13, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(14, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(15, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(16, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(17, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(18, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(19, 2, 'article', 'Article • New like on "Welcome to the Platform"', 'Bob liked your article.', TRUE, '{"article_id": 1}'),
(20, 2, 'event', 'Event • New registration on "Launch Party"', 'Bob registered to your event.', TRUE, '{"event_id": 1}');



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
ALTER SEQUENCE users_id_seq RESTART WITH 8;
ALTER SEQUENCE articles_id_seq RESTART WITH 6;
ALTER SEQUENCE topics_id_seq RESTART WITH 6;
ALTER SEQUENCE posts_id_seq RESTART WITH 29;
ALTER SEQUENCE events_id_seq RESTART WITH 5;
ALTER SEQUENCE notifications_id_seq RESTART WITH 21;
ALTER SEQUENCE conversations_id_seq RESTART WITH 2;
ALTER SEQUENCE suggestions_id_seq RESTART WITH 2;
ALTER SEQUENCE suggestion_votes_id_seq RESTART WITH 2;
ALTER SEQUENCE questions_id_seq RESTART WITH 3;

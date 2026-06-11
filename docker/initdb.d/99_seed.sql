-- --------------------------------------------------------------------------------
-- 99_seed.sql — Données de démonstration · Plateforme BDJ
-- Contexte   : fin d'année universitaire, fort engagement des membres.
-- Comptes    : tous les mots de passe sont « password123 »
-- --------------------------------------------------------------------------------
-- POINTS D'ENTRÉE DÉMO
--   alice@example.com  → utilisateur standard (parcours complet)
--   bob@example.com    → admin (gestion questions, articles, événements)
-- --------------------------------------------------------------------------------

-- ═══════════════════════════════════════════════════════════════════
-- 1. UTILISATEURS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO users (id, username, firstname, lastname, avatar, bio, follower_count, following_count, role) VALUES
(1, 'alice',   'Alice',   'Martin',    '/assets/images/avatars/avatar_female_01.png', 'Passionnée de dev web et de théâtre. Promo 2025.',                1, 1, 'user'),
(2, 'bob',     'Bob',     'Lefebvre',  '/assets/images/avatars/avatar_male_01.png',   'Président du BDJ. Toujours partant pour un projet.',              1, 1, 'admin'),
(3, 'charlie', 'Charlie', 'Dupont',    '/assets/images/avatars/avatar_male_02.png',   'Dev full-stack, revient de 6 mois de stage à Paris.',            0, 0, 'user'),
(4, 'diana',   'Diana',   'Bernard',   '/assets/images/avatars/avatar_female_02.png', 'Organisatrice du tournoi de foot inter-promos 2025.',             0, 0, 'user'),
(5, 'eve',     'Eve',     'Rousseau',  '/assets/images/avatars/avatar_female_03.png', 'Cybersécurité et café. Pas forcément dans cet ordre.',            0, 0, 'user'),
(6, 'frank',   'Frank',   'Moreau',    '/assets/images/avatars/avatar_male_03.png',   'Maître des cérémonies des soirées BDJ depuis 3 ans.',             0, 0, 'user'),
(7, 'grace',   'Grace',   'Petit',     '/assets/images/avatars/avatar_female_00.png', 'Discrète mais redoutable. A trouvé le premier bug de la plateforme.', 0, 0, 'user')
ON CONFLICT (id) DO NOTHING;

-- Alice et Bob se suivent mutuellement
INSERT INTO user_follows (follower_id, following_id) VALUES
(1, 2),
(2, 1);

-- ═══════════════════════════════════════════════════════════════════
-- 2. AUTH — mot de passe : password123 (argon2id)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO user_auth (user_id, email, password_hash) VALUES
(1, 'alice@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'),
(2, 'bob@example.com',     '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'),
(3, 'charlie@example.com', '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'),
(4, 'diana@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'),
(5, 'eve@example.com',     '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'),
(6, 'frank@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk'),
(7, 'grace@example.com',   '$argon2id$v=19$m=65536,t=3,p=4$tlfAtlP7pM6rPJHFoH1MLg$7uE/6nPlOIZXxKKzNVFBZPJo44ucW3Z5LIIExJke0Mk')
ON CONFLICT (user_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 3. ARTICLES
-- like_count correspond au nombre réel de lignes dans article_likes.
-- alice (1) n'a PAS liké les articles 1 et 2 → démo : elle like l'article 1 en live.
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO articles (id, author_id, title, content, cover_image, view_count, like_count) VALUES
(1, 2, 'Bienvenue sur la plateforme BDJ !',
 'Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque. Sorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.',
 'https://picsum.photos/seed/article1/800/400', 320, 3),

(2, 2, 'Guide complet pour trouver un stage à l''étranger',
 'Partir en stage à l''étranger est une expérience qui marque une carrière. Que ce soit au Royaume-Uni, en Irlande, en Allemagne ou au Canada, les opportunités sont nombreuses pour les étudiants qui savent où chercher. Dans cet article, nous vous guidons pas à pas : de la recherche d''offres jusqu''à votre arrivée sur place.

Commencez par identifier les plateformes dédiées : LinkedIn, Indeed International, Erasmus+, et les sites propres à chaque pays cible. N''oubliez pas le réseau de votre école, souvent sous-exploité.

Côté administratif, renseignez-vous tôt sur les visas (certains nécessitent 3 mois de délai), l''assurance maladie internationale, et les aides financières disponibles (OFII, région, bourse Erasmus). Pensez aussi à ouvrir un compte bancaire local dès votre arrivée pour éviter les frais de change.

Sur place, restez curieux et proactif. Les stages à l''étranger sont souvent plus autonomes qu''en France : c''est une chance de vous démarquer. Bonne chance à tous !',
 'https://picsum.photos/seed/article2/800/400', 187, 2),

(3, 2, 'Débuter en développement web : par où commencer en 2025 ?',
 'Le développement web attire chaque année de nombreux étudiants et reconvertis. Mais face à la multitude de langages, frameworks et tutoriels disponibles, difficile de savoir par où commencer. Voici une feuille de route claire et progressive.

Étape 1 — Les bases : HTML, CSS, JavaScript. Pas de raccourci possible. Maîtrisez le DOM, les sélecteurs CSS, et la manipulation du DOM en JS vanilla avant de passer à un framework.

Étape 2 — Choisissez un framework frontend. En 2025, React reste le plus demandé sur le marché, mais Vue.js et Svelte gagnent du terrain. Choisissez en fonction de vos objectifs professionnels.

Étape 3 — Le backend. Node.js avec Express ou Fastify pour rester en JavaScript, ou Python avec FastAPI si vous venez de la data. Apprenez les bases des API REST, de l''authentification et des bases de données relationnelles (PostgreSQL).

Étape 4 — Les outils du quotidien : Git, Docker, et un peu de CI/CD. Ces compétences font souvent la différence en entretien.

Restez curieux, construisez des projets concrets, et n''hésitez pas à contribuer à des projets open source. La communauté est là pour vous aider.',
 'https://picsum.photos/seed/article3/800/400', 412, 4),

(4, 2, 'Retour sur notre soirée karaoké : une nuit inoubliable',
 'Vendredi soir, le BDJ a mis le feu à la salle avec sa soirée karaoké annuelle. Plus de 80 étudiants réunis, des voix aussi diverses que talentueuses (ou pas, et c''est tout aussi bien), et une ambiance qui restera dans les mémoires.

La soirée a démarré timidement — comme toujours, les premières prestations sont celles des courageux. Mention spéciale à Frank et Diana pour leur duo improvisé sur "Don''t Stop Believin''" qui a littéralement déclenché une standing ovation.

Le point culminant ? Grace, habituellement si discrète, qui a enchaîné un medley de chansons des années 80 avec une aisance déconcertante. Personne ne l''avait vue venir.

Le BDJ remercie tous les participants, les bénévoles qui ont géré la sono et l''accueil, ainsi que le staff de la salle. Rendez-vous l''année prochaine pour une édition encore plus grande. Et oui, il y aura une coupe du monde de karaoké inter-promos.',
 'https://picsum.photos/seed/article4/800/400', 256, 3),

(5, 2, 'Sécurité numérique : 5 réflexes essentiels pour les étudiants',
 'On parle souvent de cybersécurité comme d''un sujet réservé aux experts. Pourtant, en tant qu''étudiant, vous êtes une cible privilégiée : emails institutionnels, accès aux réseaux de l''école, données personnelles... Voici 5 réflexes simples à adopter dès maintenant.

1. Utilisez un gestionnaire de mots de passe. Bitwarden, 1Password ou KeePass : choisissez-en un et arrêtez de réutiliser le même mot de passe partout. C''est la première source de compromission.

2. Activez la double authentification (2FA) partout où c''est possible. Gmail, GitHub, Discord... Un SMS ou une app comme Authy suffit à bloquer 99% des attaques par credential stuffing.

3. Méfiez-vous du phishing. Les mails d''hameçonnage imitent parfaitement les communications officielles. Vérifiez toujours l''adresse expéditrice et ne cliquez jamais sur un lien sans l''avoir inspecté.

4. Mettez à jour vos appareils. Les mises à jour corrigent des failles de sécurité critiques. Activez les mises à jour automatiques.

5. Évitez les Wi-Fi publics pour des opérations sensibles. Si vous devez les utiliser, passez par un VPN.

La sécurité numérique, ça s''apprend. Et vous avez toutes les ressources pour le faire.',
 'https://picsum.photos/seed/article5/800/400', 143, 2);

-- alice (1) : a liké 3, 4, 5 — peut liker 1 en démo
-- bob   (2) : a liké 1, 2, 3, 4
INSERT INTO article_likes (user_id, article_id) VALUES
(2, 1), (3, 1), (4, 1),
(2, 2), (3, 2),
(1, 3), (2, 3), (4, 3), (5, 3),
(1, 4), (2, 4), (5, 4),
(1, 5), (3, 5);

-- ═══════════════════════════════════════════════════════════════════
-- 4. FORUM — Topics & Posts
-- Démo alice : peut poster dans topic 5 (soirée BDJ) et suivre topic 2 (retour de stage Charlie)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO topics (id, author_id, title, content, cover_image, attachment_urls, view_count, msg_count) VALUES
(1, 1, 'Hello World',
 'Just saying hello to everyone! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam facere sed consequatur consectetur fuga excepturi nesciunt eos earum voluptatem quidem, doloremque at odio, sapiente expedita quaerat delectus culpa velit reiciendis dolorum nobis debitis. Harum, mollitia eaque laudantium labore aliquam, nobis eius ipsam autem illum, in temporibus itaque? Atque consectetur et quo quasi consequatur ratione, iure repudiandae omnis aliquam explicabo dolor, autem ipsa sunt quas ullam quam quibusdam esse ex beatae dolores. Dolorum voluptatibus cumque voluptatem eos maxime repellendus, mollitia veniam doloremque nobis quod accusamus alias, a error ducimus, itaque quasi nisi tempora. Voluptas nihil, eveniet recusandae delectus at illo quis vero, esse consequuntur odit fugiat laborum harum.',
 'https://picsum.photos/seed/topic1/800/400', '{"https://picsum.photos/seed/topic1/600/200"}', 120, 10);

INSERT INTO posts (id, topic_id, author_id, parent_id, content) VALUES
(1,  1, 2, null, 'Bienvenue sur la plateforme Alice !'),
(2,  1, 1, null, 'Merci Bob ! Ravi d''être là.'),
(3,  1, 2, 2,    'On est contents de t''avoir parmi nous !'),
(4,  1, 3, null, 'Super topic, belle initiative !'),
(5,  1, 4, 4,    'Tout à fait, bien joué Charlie.'),
(6,  1, 5, null, 'Quelqu''un a vérifié les implications côté sécurité ?'),
(7,  1, 6, 6,    'Bonne question Eve, la sécurité c''est primordial !'),
(8,  1, 7, null, 'Comme dirait Grace : si ça marche, on ship.'),
(9,  1, 3, 8,    'Haha, l''état d''esprit classique de Grace !'),
(10, 1, 4, 2,    'Alice, tu sais toujours mettre tout le monde à l''aise !');

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
(12, 2, 2, 11,   'Tout à fait, on l''utilise aussi sur nos projets internes au BDJ.'),
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

-- Topic follows (like_count = nombre de follows)
INSERT INTO topic_follows (user_id, topic_id) VALUES
(2, 1), (3, 1),   -- Bob et Charlie suivent "Hello World"
(4, 2),            -- Diana suit le retour de stage de Charlie
(1, 3),            -- Alice suit le tournoi de foot
(5, 4),            -- Eve suit "Conseils stage étranger"
(2, 5), (7, 5);   -- Bob et Grace suivent "Idées soirée BDJ"
-- Démo alice : peut suivre topic 2 (retour de stage Charlie) en live

UPDATE topics SET like_count = 2 WHERE id = 1;

-- ═══════════════════════════════════════════════════════════════════
-- 5. ÉVÉNEMENTS
-- event 1 : alice inscrite (1/100)   → démo : afficher son statut
-- event 2 : 3/8 inscrits, gratuit    → démo : alice s'inscrit en live
-- event 3 : 4/4 COMPLET, payant      → démo : inscription refusée (capacité max)
-- event 4 : passé                    → démo : filtrage "événements passés"
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO events (id, organizer_id, title, description, cover_image, start_time, end_time, location, price, max_capacity, current_attendees) VALUES
(1, 2, 'Soirée de Printemps',
 'La grande soirée de fin d''année du BDJ ! Buffet, musique live, tombola et surprises. Venez nombreux pour clôturer cette année en beauté.',
 'https://picsum.photos/seed/event1/800/400',
 NOW() + interval '7 days', NOW() + interval '7 days' + interval '4 hours',
 'Grande Salle — Campus Principal', 4.95, 100, 1),

(2, 2, 'Atelier Jeux de Rôle',
 'Une soirée autour d''une partie de jeu de rôle. Experts ou débutants, tous les niveaux sont les bienvenus. Nos maîtres du jeu vous guideront pour une aventure mémorable !',
 'https://picsum.photos/seed/event2/800/400',
 NOW() + interval '3 days', NOW() + interval '3 days' + interval '3 hours',
 'Salle B — Bâtiment C', null, 8, 3),

(3, 2, 'Concert Acoustique',
 'Une soirée musicale intime avec nos artistes locaux. Places très limitées, réservez vite !',
 'https://picsum.photos/seed/event3/800/400',
 NOW() + interval '14 days', NOW() + interval '14 days' + interval '2 hours',
 'Amphithéâtre — Campus Principal', 9.99, 4, 4),

(4, 2, 'Soirée Karaoké — Édition 2025',
 'La légendaire soirée karaoké du BDJ. Merci à tous les participants pour cette nuit inoubliable !',
 'https://picsum.photos/seed/event4/800/400',
 NOW() - interval '7 days', NOW() - interval '7 days' + interval '3 hours',
 'Salle Polyvalente — Campus Principal', null, 80, 62);

-- Inscriptions aux événements
INSERT INTO event_registrations (event_id, user_id, status) VALUES
(1, 1, 'registered'),                                                                       -- alice → Soirée de Printemps
(2, 3, 'registered'), (2, 4, 'registered'), (2, 6, 'registered'),                          -- charlie, diana, frank → Atelier JDR (5 places restantes)
(3, 3, 'registered'), (3, 4, 'registered'), (3, 6, 'registered'), (3, 7, 'registered');    -- COMPLET → Concert Acoustique

-- ═══════════════════════════════════════════════════════════════════
-- 6. NOTIFICATIONS
-- bob   : mélange lues/non lues — représente l''activité de la plateforme
-- alice : 2 lues + 3 non lues → démo : consulter et marquer comme lues en live
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO notifications (id, user_id, type, title, content, is_read, resource_data) VALUES
-- Notifications de Bob (admin)
(1,  2, 'forum',   'Forum • Nouveau topic : Hello World',           'Alice a créé le topic "Hello World".',                              FALSE, '{"topic_id": 1}'),
(2,  2, 'article', 'Article • Nouveau j''aime',                     'Charlie a aimé votre article "Bienvenue sur la plateforme".',       TRUE,  '{"article_id": 1}'),
(3,  2, 'article', 'Article • Nouveau j''aime',                     'Diana a aimé votre article "Bienvenue sur la plateforme".',         TRUE,  '{"article_id": 1}'),
(4,  2, 'message', 'Alice • Nouveau message',                        'Alice vous a envoyé un message.',                                   FALSE, '{"conversation_id": 1}'),
(5,  2, 'article', 'Article • Nouveau j''aime',                     'Alice a aimé votre article "Débuter en dev web".',                 TRUE,  '{"article_id": 3}'),
(6,  2, 'article', 'Article • Nouveau j''aime',                     'Diana a aimé votre article "Débuter en dev web".',                 TRUE,  '{"article_id": 3}'),
(7,  2, 'article', 'Article • Nouveau j''aime',                     'Eve a aimé votre article "Débuter en dev web".',                   TRUE,  '{"article_id": 3}'),
(8,  2, 'article', 'Article • Nouveau j''aime',                     'Alice a aimé votre article "Soirée karaoké".',                     TRUE,  '{"article_id": 4}'),
(9,  2, 'article', 'Article • Nouveau j''aime',                     'Eve a aimé votre article "Soirée karaoké".',                       TRUE,  '{"article_id": 4}'),
(10, 2, 'event',   'Événement • Nouvelle inscription',               'Alice s''est inscrite à "Soirée de Printemps".',                   TRUE,  '{"event_id": 1}'),
(11, 2, 'forum',   'Forum • Nouveau topic : Retour d''expérience',  'Charlie a partagé son retour de stage, très enrichissant !',        FALSE, '{"topic_id": 2}'),
(12, 2, 'event',   'Événement • Nouvelle inscription',               'Charlie s''est inscrit à "Atelier Jeux de Rôle".',                 TRUE,  '{"event_id": 2}'),
(13, 2, 'event',   'Événement • Nouvelle inscription',               'Diana s''est inscrite à "Atelier Jeux de Rôle".',                  TRUE,  '{"event_id": 2}'),
(14, 2, 'event',   'Événement • Nouvelle inscription',               'Frank s''est inscrit à "Atelier Jeux de Rôle".',                   TRUE,  '{"event_id": 2}'),
(15, 2, 'event',   'Événement • Concert Acoustique COMPLET',         'Les 4 places du Concert Acoustique sont toutes réservées.',        FALSE, '{"event_id": 3}'),
(16, 2, 'article', 'Article • Nouveau j''aime',                     'Charlie a aimé votre article "Sécurité numérique".',               TRUE,  '{"article_id": 5}'),
(17, 2, 'article', 'Article • Nouveau j''aime',                     'Alice a aimé votre article "Sécurité numérique".',                 TRUE,  '{"article_id": 5}'),
(18, 2, 'forum',   'Forum • Nouveau vote',                          'Alice a voté pour la suggestion "Forum Section".',                  TRUE,  '{"suggestion_id": 1}'),
(19, 2, 'forum',   'Forum • Nouvelle suggestion soumise',            'Eve a soumis la suggestion "Filtres avancés".',                    FALSE, '{"suggestion_id": 4}'),
(20, 2, 'forum',   'Forum • Nouvelle question soumise',              'Alice a posé une question qui attend votre réponse.',              FALSE, '{"question_id": 2}'),

-- Notifications d''Alice (utilisatrice standard)
(21, 1, 'forum',   'Forum • Bob a répondu à votre post',            'Bob a répondu dans le topic "Hello World".',                        TRUE,  '{"topic_id": 1, "post_id": 3}'),
(22, 1, 'forum',   'Forum • Nouveau topic de Charlie',              'Charlie a publié son retour de stage en startup.',                  TRUE,  '{"topic_id": 2}'),
(23, 1, 'event',   'Événement • Dans 7 jours : Soirée de Printemps', 'L''événement auquel vous êtes inscrit(e) approche !',             FALSE, '{"event_id": 1}'),
(24, 1, 'message', 'Charlie • Nouveau message',                      'Charlie vous a envoyé un message.',                                FALSE, '{"conversation_id": 2}'),
(25, 1, 'forum',   'Forum • Diana a répondu dans "Hello World"',    'Diana a répondu à votre post dans le topic "Hello World".',         FALSE, '{"topic_id": 1, "post_id": 10}');

-- ═══════════════════════════════════════════════════════════════════
-- 7. MESSAGERIE
-- conv 1 : Alice ↔ Bob  (bug report → contexte admin)
-- conv 2 : Charlie ↔ Alice → démo : alice répond en live
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO conversations (id, title) VALUES
(1, 'Alice & Bob'),
(2, 'Charlie & Alice');

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, 2), (1, 1),
(2, 3), (2, 1);

INSERT INTO messages (conversation_id, sender_id, content) VALUES
(1, 1, 'Hey Bob, j''ai trouvé un bug sur la page des notifications !'),
(1, 2, 'Merci Alice ! Tu peux ouvrir un ticket sur le forum ? Je regarde ça rapidement.'),
(1, 1, 'C''est fait ! J''ai posté dans le topic "Hello World".'),
(2, 3, 'Salut Alice ! Tu veux rejoindre mon équipe pour le tournoi de foot ?'),
(2, 1, 'Avec plaisir Charlie ! On s''entraîne quand ?'),
(2, 3, 'Samedi matin sur le terrain annexe, 10h ? Je t''envoie l''adresse.');

-- ═══════════════════════════════════════════════════════════════════
-- 8. SUGGESTIONS
-- Démo alice : peut voter sur 2, 3, 4 en live (elle n'a voté que sur 1)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO suggestions (id, user_id, title, content, upvotes, downvotes) VALUES
(1, 2, 'Forum Section',      'Ajouter une section forum à la plateforme pour favoriser les échanges entre étudiants.', 1, 0),
(2, 3, 'Mode sombre',        'Ajouter un thème sombre (dark mode) à l''interface. Indispensable pour les sessions nocturnes de coding !', 5, 1),
(3, 4, 'Calendrier partagé', 'Exporter le calendrier des événements au format .ics pour l''intégrer dans Google Calendar ou Outlook.', 3, 0),
(4, 5, 'Filtres avancés',    'Pouvoir filtrer les articles par thème (tech, vie étudiante, événements) et les trier par date ou popularité.', 2, 1);

INSERT INTO suggestion_votes (suggestion_id, user_id, type) VALUES
(1, 1, 'up'),    -- alice ↑ "Forum Section"
(2, 3, 'up'),    -- charlie ↑ "Mode sombre"
(2, 4, 'up'),    -- diana   ↑
(2, 5, 'up'),    -- eve     ↑
(2, 6, 'up'),    -- frank   ↑
(2, 7, 'up'),    -- grace   ↑
(2, 2, 'down'),  -- bob     ↓ "Mode sombre"
(3, 2, 'up'),    -- bob     ↑ "Calendrier partagé"
(3, 3, 'up'),    -- charlie ↑
(3, 4, 'up'),    -- diana   ↑
(4, 3, 'up'),    -- charlie ↑ "Filtres avancés"
(4, 7, 'up'),    -- grace   ↑
(4, 2, 'down');  -- bob     ↓ "Filtres avancés"

-- ═══════════════════════════════════════════════════════════════════
-- 9. QUESTIONS & RÉPONSES
-- questions 1, 3, 4, 5 : answered (visibles publiquement via /questions/public)
-- question 2 (alice)   : pending  → démo admin : Bob répond en live
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO questions (id, user_id, message, answer, status, created_at) VALUES
(1, 5, 'Comment fonctionne le système de connexion sécurisé ?',
 'Nous utilisons un système à double token : un access token (JWT, valide 15 minutes) pour les requêtes courantes, et un refresh token (valide 7 jours) pour en obtenir un nouveau sans se reconnecter. Le refresh token est à usage unique et se renouvelle automatiquement à chaque utilisation (rotation). En cas de déconnexion, les deux tokens sont révoqués.',
 'answered', '2025-11-20 10:00:00'),

(2, 1, 'A secret santa among all classes',
 NULL, 'pending', '2025-12-12 14:37:44.654'),

(3, 3, 'Y a-t-il des réductions pour les étudiants boursiers sur les événements payants ?',
 'Oui ! Les étudiants boursiers (échelon 3 et au-delà) bénéficient d''une réduction de 50 % sur tous les événements payants organisés par le BDJ. Il suffit de présenter votre notification de bourse lors de l''inscription. Contactez le BDJ directement si vous avez des questions.',
 'answered', '2026-01-15 14:00:00'),

(4, 4, 'Comment proposer un atelier ou un événement au BDJ ?',
 'Toute idée d''atelier ou d''événement est la bienvenue ! Vous pouvez utiliser le formulaire de suggestions sur la plateforme, ou contacter directement un membre du bureau via la messagerie. On étudie chaque proposition et on revient vers vous sous 48h.',
 'answered', '2026-02-10 09:30:00'),

(5, 6, 'Est-il possible d''être remboursé si je ne peux plus venir à un événement payant ?',
 'Oui, sous conditions. Vous pouvez demander un remboursement jusqu''à 48h avant l''événement en contactant le BDJ via la messagerie. Passé ce délai, le remboursement n''est plus possible sauf cas de force majeure (certificat médical, etc.).',
 'answered', '2026-03-01 11:00:00');

-- ═══════════════════════════════════════════════════════════════════
-- 10. RESET SEQUENCES
-- ═══════════════════════════════════════════════════════════════════
ALTER SEQUENCE users_id_seq             RESTART WITH 8;
ALTER SEQUENCE articles_id_seq          RESTART WITH 6;
ALTER SEQUENCE topics_id_seq            RESTART WITH 6;
ALTER SEQUENCE posts_id_seq             RESTART WITH 29;
ALTER SEQUENCE events_id_seq            RESTART WITH 5;
ALTER SEQUENCE notifications_id_seq     RESTART WITH 26;
ALTER SEQUENCE conversations_id_seq     RESTART WITH 3;
ALTER SEQUENCE suggestions_id_seq       RESTART WITH 5;
ALTER SEQUENCE questions_id_seq         RESTART WITH 6;

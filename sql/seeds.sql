-- ---------------------------------------------------------------------------
-- SAE301 Drone Click & Collect — Seeds (Données initiales de test)
-- Compatible avec le schéma sql/schema.sql et les images locales front/public/
-- ---------------------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Vidage des tables avant réinsertion
TRUNCATE TABLE journal_stock;
TRUNCATE TABLE ligne_commande;
TRUNCATE TABLE commande;
TRUNCATE TABLE variante;
TRUNCATE TABLE produit;
TRUNCATE TABLE categorie;
TRUNCATE TABLE utilisateur;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- 1. Utilisateurs
-- Mots de passe de test (hachés avec BCRYPT) :
-- 'admin123'  pour le compte administrateur
-- 'client123' pour les comptes clients
-- ---------------------------------------------------------------------------
INSERT INTO utilisateur (id, email, mot_de_passe_hash, nom, prenom, role) VALUES
    (1, 'admin@dji-store.fr',  '$2y$12$vBZiFn1g6CRz0EzlZx5yzu2Tw8zMyE39t/uOUEHI/aO0jxgp1LEtC', 'Admin',  'Gestionnaire', 'admin'),
    (2, 'dupont@gmail.com',    '$2y$12$8L8fFx9m3FP7IpxYWHP7DO/WkpqV2TLnrEHTYUUh7inPmGHHMn11W', 'Dupont', 'Jean',         'client'),
    (3, 'martin@yahoo.fr',     '$2y$12$8L8fFx9m3FP7IpxYWHP7DO/WkpqV2TLnrEHTYUUh7inPmGHHMn11W', 'Martin', 'Sophie',       'client');

-- ---------------------------------------------------------------------------
-- 2. Catégories
-- ---------------------------------------------------------------------------
INSERT INTO categorie (id, slug, nom) VALUES
    (1, 'drones-grand-public',  'Drones Grand Public'),
    (2, 'drones-professionnels', 'Drones Professionnels'),
    (3, 'drones-fpv',           'Drones FPV');

-- ---------------------------------------------------------------------------
-- 3. Produits
-- Reliés directement aux images officielles déposées dans front/public/images/drones/
-- ---------------------------------------------------------------------------
INSERT INTO produit (id, categorie_id, slug, nom, description, image_url) VALUES
    (1, 1, 'dji-mini-4-pro', 'DJI Mini 4 Pro',
     'Drone compact ultra-léger de moins de 249 g avec détection d''obstacles omnidirectionnelle et vidéo HDR 4K/60 fps.',
     'images/drones/dji-mini-4-pro.png'),

    (2, 1, 'dji-air-3', 'DJI Air 3',
     'Drone polyvalent doté d''un système à double caméra principale grand-angle et téléobjectif moyen 3x, avec 46 min d''autonomie.',
     'images/drones/dji-air-3.png'),

    (3, 1, 'dji-mini-3', 'DJI Mini 3',
     'L''essentiel de la prise de vue aérienne 4K dans un format pliable ultra-léger avec prise de vue verticale native.',
     'images/drones/dji-mini-3.png'),

    (4, 1, 'dji-neo', 'DJI Neo',
     'Le drone le plus léger et compact de DJI, conçu pour décoller et atterrir directement depuis le creux de votre main.',
     'images/drones/dji-neo.png'),

    (5, 1, 'dji-mini-2-se', 'DJI Mini 2 SE',
     'Compact, maniable et accessible, idéal pour les débutants avec transmission vidéo HD jusqu''à 10 km.',
     'images/drones/dji-mini-2-se.png'),

    (6, 2, 'dji-mavic-3-pro', 'DJI Mavic 3 Pro',
     'Système d''imagerie triple caméra Hasselblad et téléobjectifs multiples pour les cinéastes et créateurs exigeants.',
     'images/drones/dji-mavic-3-pro.png'),

    (7, 2, 'dji-inspire-3', 'DJI Inspire 3',
     'Chef-d''œuvre cinématographique professionnel avec caméra plein cadre 8K ProRes RAW et flux de travail intégré.',
     'images/drones/dji-inspire-3.jpg'),

    (8, 3, 'dji-avata-2', 'DJI Avata 2',
     'Expérience de vol FPV immersive à sensations fortes avec protections d''hélices intégrées et capteur ultra grand-angle.',
     'images/drones/dji-avata-2.png'),

    (9, 3, 'dji-avata-explorer', 'DJI Avata Explorer',
     'Pack dynamique prêt à voler pour le vol en immersion haute vitesse avec retour vidéo ultra-faible latence.',
     'images/drones/dji-avata-explorer.jpg'),

    -- Produits complémentaires (DoD DEC-b : 3 catégories de 4 produits).
    -- Image provisoire commune, à remplacer par les visuels officiels.
    (10, 2, 'dji-mavic-3-classic', 'DJI Mavic 3 Classic',
     'Caméra Hasselblad 4/3 CMOS 20 MP et 46 min d''autonomie pour la photographie et la vidéo aérienne exigeante.',
     'images/drones/placeholder.svg'),

    (11, 2, 'dji-matrice-30t', 'DJI Matrice 30T',
     'Drone d''entreprise robuste avec caméra thermique, zoom hybride et télémètre laser pour l''inspection et la sécurité.',
     'images/drones/placeholder.svg'),

    (12, 3, 'dji-fpv', 'DJI FPV',
     'Drone FPV haute vitesse jusqu''à 140 km/h, avec casque immersif et manette de mouvement.',
     'images/drones/placeholder.svg'),

    (13, 3, 'dji-avata', 'DJI Avata',
     'Drone FPV compact à hélices protégées, conçu pour le vol acrobatique en immersion.',
     'images/drones/placeholder.svg');

-- ---------------------------------------------------------------------------
-- 4. Variantes (prix et stock portés par chaque variante)
-- Deux variantes sont volontairement à stock = 0 pour tester l'indisponibilité.
-- ---------------------------------------------------------------------------
INSERT INTO variante (id, produit_id, nom_option, prix_ttc, stock) VALUES
    -- Variantes DJI Mini 4 Pro (produit 1)
    (1,  1, 'Unité seule (sans radiocommande)',                  659.00,  6),
    (2,  1, 'Avec radiocommande standard DJI RC-N2',             799.00, 12),
    (3,  1, 'Pack Fly More Combo (avec écran DJI RC 2)',        1129.00,  5),

    -- Variantes DJI Air 3 (produit 2)
    (4,  2, 'Avec radiocommande standard DJI RC-N2',             1099.00,  8),
    (5,  2, 'Pack Fly More Combo (avec écran DJI RC 2)',        1549.00,  4),

    -- Variantes DJI Mini 3 (produit 3)
    (6,  3, 'Avec radiocommande DJI RC-N1',                      469.00, 10),
    (7,  3, 'Pack Fly More Combo (DJI RC)',                      658.00,  0), -- Rupture de stock test

    -- Variantes DJI Neo (produit 4)
    (8,  4, 'Standard (Seul)',                                   199.00, 15),
    (9,  4, 'Pack Fly More Combo',                               349.00,  7),

    -- Variantes DJI Mini 2 SE (produit 5)
    (10, 5, 'Standard RC-N1',                                    279.00,  9),
    (11, 5, 'Fly More Combo',                                    419.00,  3),

    -- Variantes DJI Mavic 3 Pro (produit 6)
    (12, 6, 'Avec radiocommande DJI RC',                         2099.00,  3),
    (13, 6, 'Pack Fly More Combo Cine',                          2799.00,  2),

    -- Variantes DJI Inspire 3 (produit 7)
    (14, 7, 'Combo Cinéma Plein Cadre 8K',                      14999.00,  1),

    -- Variantes DJI Avata 2 (produit 8)
    (15, 8, 'Unité seule',                                       489.00,  4),
    (16, 8, 'Pack Fly More Combo (1 batterie)',                  999.00,  6),
    (17, 8, 'Pack Fly More Combo (3 batteries)',                1199.00,  0), -- Rupture de stock test

    -- Variantes DJI Avata Explorer (produit 9)
    (18, 9, 'Pack Explorer (Goggles Integra + RC Motion 2)',     899.00,  5),

    -- Variantes DJI Mavic 3 Classic (produit 10)
    (19, 10, 'Avec radiocommande DJI RC-N1',                    1749.00,  5),
    (20, 10, 'Pack Fly More Combo (DJI RC)',                    2199.00,  3),

    -- Variantes DJI Matrice 30T (produit 11)
    (21, 11, 'Combo Entreprise (caméra thermique)',            10999.00,  2),

    -- Variantes DJI FPV (produit 12)
    (22, 12, 'Combo FPV (Goggles V2 + Motion Controller)',      1299.00,  4),

    -- Variantes DJI Avata (produit 13)
    (23, 13, 'Pack Pro-View (Goggles 2)',                       1199.00,  3),
    (24, 13, 'Pack Pro-View Fly More Combo',                    1499.00,  2);

-- ---------------------------------------------------------------------------
-- 5. Journal des stocks (initialisation d'audit)
-- ---------------------------------------------------------------------------
INSERT INTO journal_stock (variante_id, commande_id, type_mouvement, quantite_delta, date_mouvement) VALUES
    (1,  NULL, 'reassort', 6,  NOW()),
    (2,  NULL, 'reassort', 12, NOW()),
    (3,  NULL, 'reassort', 5,  NOW()),
    (4,  NULL, 'reassort', 8,  NOW()),
    (5,  NULL, 'reassort', 4,  NOW()),
    (6,  NULL, 'reassort', 10, NOW()),
    (8,  NULL, 'reassort', 15, NOW()),
    (9,  NULL, 'reassort', 7,  NOW()),
    (10, NULL, 'reassort', 9,  NOW()),
    (11, NULL, 'reassort', 3,  NOW()),
    (12, NULL, 'reassort', 3,  NOW()),
    (13, NULL, 'reassort', 2,  NOW()),
    (14, NULL, 'reassort', 1,  NOW()),
    (15, NULL, 'reassort', 4,  NOW()),
    (16, NULL, 'reassort', 6,  NOW()),
    (18, NULL, 'reassort', 5,  NOW()),
    (19, NULL, 'reassort', 5,  NOW()),
    (20, NULL, 'reassort', 3,  NOW()),
    (21, NULL, 'reassort', 2,  NOW()),
    (22, NULL, 'reassort', 4,  NOW()),
    (23, NULL, 'reassort', 3,  NOW()),
    (24, NULL, 'reassort', 2,  NOW());

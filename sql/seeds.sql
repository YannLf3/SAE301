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
-- 2. Catégories (maquette Figma : Drones, Action Cams, Stabilizers)
-- ---------------------------------------------------------------------------
INSERT INTO categorie (id, slug, nom) VALUES
    (1, 'drones',      'Drones'),
    (2, 'action-cams', 'Action Cams'),
    (3, 'stabilizers', 'Stabilizers');

-- ---------------------------------------------------------------------------
-- 3. Produits (DoD DEC-b : 3 catégories de 4 produits)
-- Les images manquantes utilisent placeholder.svg en attendant les visuels.
-- ---------------------------------------------------------------------------
INSERT INTO produit (id, categorie_id, slug, nom, description, image_url) VALUES
    (1, 1, 'dji-mini-4-pro', 'DJI Mini 4 Pro',
     'Drone compact de moins de 249 g avec détection d''obstacles omnidirectionnelle et vidéo 4K/60 fps HDR.',
     'images/drones/dji-mini-4-pro.png'),
    (2, 1, 'dji-air-3', 'DJI Air 3',
     'Drone polyvalent à double caméra (grand-angle et téléobjectif 3x) avec 46 minutes d''autonomie.',
     'images/drones/dji-air-3.png'),
    (3, 1, 'dji-mavic-3-pro', 'DJI Mavic 3 Pro',
     'Système triple caméra Hasselblad pour les créateurs de contenus exigeants.',
     'images/drones/dji-mavic-3-pro.png'),
    (4, 1, 'dji-avata-2', 'DJI Avata 2',
     'Drone FPV immersif aux hélices protégées, pensé pour le vol sensations.',
     'images/drones/dji-avata-2.png'),
    (5, 2, 'osmo-action-4', 'Osmo Action 4',
     'Caméra d''action 4K/120 fps avec grand capteur 1/1,3 pouce, étanche jusqu''à 18 m.',
     'images/drones/placeholder.svg'),
    (6, 2, 'osmo-action-5-pro', 'Osmo Action 5 Pro',
     'Caméra d''action nouvelle génération, excellente en basse lumière, autonomie jusqu''à 4 h.',
     'images/drones/placeholder.svg'),
    (7, 2, 'osmo-pocket-3', 'Osmo Pocket 3',
     'Caméra de poche stabilisée sur nacelle 3 axes avec écran rotatif, idéale pour les créateurs.',
     'images/drones/placeholder.svg'),
    (8, 2, 'dji-action-2', 'DJI Action 2',
     'Caméra d''action modulaire et magnétique, ultra-compacte, avec modules écran extensibles.',
     'images/drones/placeholder.svg'),
    (9, 3, 'dji-rs-4', 'DJI RS 4',
     'Stabilisateur pour appareils photo hybrides, charge utile 3 kg, mode vertical automatique.',
     'images/drones/placeholder.svg'),
    (10, 3, 'dji-rs-4-pro', 'DJI RS 4 Pro',
     'Stabilisateur pro 4,5 kg de charge utile, compatible transmission vidéo et suivi LiDAR.',
     'images/drones/placeholder.svg'),
    (11, 3, 'dji-rs-3-mini', 'DJI RS 3 Mini',
     'Stabilisateur compact pour appareils photo légers, prise en main à une main.',
     'images/drones/placeholder.svg'),
    (12, 3, 'osmo-mobile-6', 'Osmo Mobile 6',
     'Stabilisateur de smartphone pliable avec perche télescopique intégrée et suivi intelligent.',
     'images/drones/placeholder.svg');

-- ---------------------------------------------------------------------------
-- 4. Variantes (prix et stock portés par chaque variante)
-- Stock cumulé par produit : > 5 « En stock », 1 à 5 « Bientôt épuisé »,
-- 0 « Épuisé » (DJI Action 2 : toutes ses variantes sont à 0).
-- ---------------------------------------------------------------------------
INSERT INTO variante (id, produit_id, nom_option, prix_ttc, stock) VALUES
    (1, 1, 'Standard', 799.00, 6),
    (2, 1, 'Fly More Combo', 999.00, 4),
    (3, 2, 'Standard', 1099.00, 5),
    (4, 2, 'Fly More Combo', 1399.00, 3),
    (5, 3, 'Standard', 2099.00, 2),
    (6, 3, 'Fly More Combo', 2799.00, 1),
    (7, 4, '1 batterie', 999.00, 6),
    (8, 4, 'Combo 3 batteries', 1199.00, 4),
    (9, 5, 'Standard', 299.00, 8),
    (10, 5, 'Combo Aventure', 399.00, 5),
    (11, 6, 'Standard', 379.00, 7),
    (12, 6, 'Combo Aventure', 479.00, 4),
    (13, 7, 'Standard', 539.00, 2),
    (14, 7, 'Combo Créateur', 679.00, 1),
    (15, 8, 'Power', 249.00, 0),
    (16, 8, 'Double écran', 329.00, 0),
    (17, 9, 'Standard', 549.00, 6),
    (18, 9, 'Combo', 729.00, 4),
    (19, 10, 'Standard', 869.00, 2),
    (20, 10, 'Combo', 1049.00, 2),
    (21, 11, 'Standard', 299.00, 7),
    (22, 11, 'Pack accessoires', 349.00, 4),
    (23, 12, 'Gris ardoise', 149.00, 10),
    (24, 12, 'Gris platine', 149.00, 8);

-- ---------------------------------------------------------------------------
-- 5. Journal des stocks (initialisation d'audit)
-- ---------------------------------------------------------------------------
INSERT INTO journal_stock (variante_id, commande_id, type_mouvement, quantite_delta, date_mouvement) VALUES
    (1, NULL, 'reassort', 6, NOW()),
    (2, NULL, 'reassort', 4, NOW()),
    (3, NULL, 'reassort', 5, NOW()),
    (4, NULL, 'reassort', 3, NOW()),
    (5, NULL, 'reassort', 2, NOW()),
    (6, NULL, 'reassort', 1, NOW()),
    (7, NULL, 'reassort', 6, NOW()),
    (8, NULL, 'reassort', 4, NOW()),
    (9, NULL, 'reassort', 8, NOW()),
    (10, NULL, 'reassort', 5, NOW()),
    (11, NULL, 'reassort', 7, NOW()),
    (12, NULL, 'reassort', 4, NOW()),
    (13, NULL, 'reassort', 2, NOW()),
    (14, NULL, 'reassort', 1, NOW()),
    (17, NULL, 'reassort', 6, NOW()),
    (18, NULL, 'reassort', 4, NOW()),
    (19, NULL, 'reassort', 2, NOW()),
    (20, NULL, 'reassort', 2, NOW()),
    (21, NULL, 'reassort', 7, NOW()),
    (22, NULL, 'reassort', 4, NOW()),
    (23, NULL, 'reassort', 10, NOW()),
    (24, NULL, 'reassort', 8, NOW());

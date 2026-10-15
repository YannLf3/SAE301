-- ---------------------------------------------------------------------------
-- SAE301 Drone Click & Collect — Schéma SQL minimal et fonctionnel
-- Moteur : InnoDB | Encodage : utf8mb4
-- ---------------------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS journal_stock;
DROP TABLE IF EXISTS ligne_commande;
DROP TABLE IF EXISTS commande;
DROP TABLE IF EXISTS variante;
DROP TABLE IF EXISTS produit;
DROP TABLE IF EXISTS categorie;
DROP TABLE IF EXISTS utilisateur;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Utilisateurs (authentification & rôles)
CREATE TABLE utilisateur (
    id                INT UNSIGNED         NOT NULL AUTO_INCREMENT,
    email             VARCHAR(191)         NOT NULL,
    mot_de_passe_hash VARCHAR(255)         NOT NULL,
    nom               VARCHAR(80)          NOT NULL,
    prenom            VARCHAR(80)          NOT NULL,
    role              ENUM('client', 'admin') NOT NULL DEFAULT 'client',

    PRIMARY KEY (id),
    UNIQUE KEY uq_utilisateur_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. Catégories
CREATE TABLE categorie (
    id   TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(60)      NOT NULL,
    nom  VARCHAR(80)      NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_categorie_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3. Produits
CREATE TABLE produit (
    id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    categorie_id TINYINT UNSIGNED  NOT NULL,
    slug         VARCHAR(120)      NOT NULL,
    nom          VARCHAR(160)      NOT NULL,
    description  TEXT              NULL,
    image_url    VARCHAR(255)      NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_produit_slug (slug),
    KEY idx_produit_categorie (categorie_id),

    CONSTRAINT fk_produit_categorie
        FOREIGN KEY (categorie_id) REFERENCES categorie (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4. Variantes (portent le prix et le stock disponible)
CREATE TABLE variante (
    id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    produit_id INT UNSIGNED  NOT NULL,
    nom_option VARCHAR(120)  NOT NULL,
    prix_ttc   DECIMAL(10,2) NOT NULL,
    stock      INT UNSIGNED  NOT NULL DEFAULT 0,

    PRIMARY KEY (id),
    KEY idx_variante_produit (produit_id),

    CONSTRAINT fk_variante_produit
        FOREIGN KEY (produit_id) REFERENCES produit (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 5. Commandes
CREATE TABLE commande (
    id              INT UNSIGNED         NOT NULL AUTO_INCREMENT,
    numero_commande VARCHAR(32)          NOT NULL,
    utilisateur_id  INT UNSIGNED         NOT NULL,
    statut          ENUM('en_attente', 'validee', 'prete_retrait', 'retiree', 'annulee') NOT NULL DEFAULT 'en_attente',
    total_ttc       DECIMAL(10,2)        NOT NULL,
    date_commande   DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_commande_numero (numero_commande),
    KEY idx_commande_utilisateur (utilisateur_id),

    CONSTRAINT fk_commande_utilisateur
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateur (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 6. Lignes de commande (variantId, option et prix unitaire figés)
CREATE TABLE ligne_commande (
    id                INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    commande_id       INT UNSIGNED      NOT NULL,
    variante_id       INT UNSIGNED      NOT NULL,
    nom_option        VARCHAR(120)      NOT NULL,
    prix_unitaire_ttc DECIMAL(10,2)     NOT NULL,
    quantite          SMALLINT UNSIGNED NOT NULL DEFAULT 1,

    PRIMARY KEY (id),
    KEY idx_ligne_commande (commande_id),
    KEY idx_ligne_variante (variante_id),

    CONSTRAINT fk_ligne_commande
        FOREIGN KEY (commande_id) REFERENCES commande (id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_ligne_variante
        FOREIGN KEY (variante_id) REFERENCES variante (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 7. Journal des stocks (traçabilité décrément / recrédit)
CREATE TABLE journal_stock (
    id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    variante_id    INT UNSIGNED NOT NULL,
    commande_id    INT UNSIGNED NULL,
    type_mouvement ENUM('reassort', 'validation_commande', 'annulation_commande') NOT NULL,
    quantite_delta INT          NOT NULL,
    date_mouvement DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_journal_variante (variante_id),
    KEY idx_journal_commande (commande_id),

    CONSTRAINT fk_journal_variante
        FOREIGN KEY (variante_id) REFERENCES variante (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_journal_commande
        FOREIGN KEY (commande_id) REFERENCES commande (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

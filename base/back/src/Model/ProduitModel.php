<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

/**
 * Accès aux données du catalogue de produits (DEC-b).
 *
 * Le prix et le stock sont portés par les variantes : un produit expose donc
 * son prix « à partir de » (variante la moins chère) et son stock cumulé.
 * Cette couche exécute les requêtes et renvoie des tableaux, sans règle de
 * présentation.
 */
final class ProduitModel
{
    /** Connexion à la base, fournie à la construction. */
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Tous les produits du catalogue (DEC-b : pas de pagination).
     *
     * @param string $ordre Fragment SQL de tri, par exemple « produit.nom ASC ».
     *                      ATTENTION : inséré tel quel dans la requête, il ne
     *                      doit JAMAIS provenir directement de l'utilisateur
     *                      (liste blanche du contrôleur).
     *
     * @return array<int, array{id: int, slug: string, nom: string, image_url: string,
     *                          categorie: string, prix_min: ?float, stock_total: int,
     *                          disponible: bool}>
     */
    public function lister(string $ordre): array
    {
        $sql = "SELECT produit.id,
                       produit.slug,
                       produit.nom,
                       produit.image_url,
                       categorie.nom           AS categorie,
                       MIN(variante.prix_ttc)  AS prix_min,
                       COALESCE(SUM(variante.stock), 0) AS stock_total
                  FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
             LEFT JOIN variante  ON variante.produit_id = produit.id
              GROUP BY produit.id, categorie.nom
              ORDER BY {$ordre}, produit.id";

        return array_map(
            static function (array $ligne): array {
                return [
                    'id'          => (int) $ligne['id'],
                    'slug'        => $ligne['slug'],
                    'nom'         => $ligne['nom'],
                    'image_url'   => $ligne['image_url'],
                    'categorie'   => $ligne['categorie'],
                    // MySQL renvoie les nombres en chaînes : le JSON doit contenir
                    // de vrais nombres. Un produit sans variante n'a pas de prix.
                    'prix_min'    => $ligne['prix_min'] === null ? null : (float) $ligne['prix_min'],
                    'stock_total' => (int) $ligne['stock_total'],
                    'disponible'  => (int) $ligne['stock_total'] > 0,
                ];
            },
            $this->pdo->query($sql)->fetchAll(),
        );
    }

    /**
     * Fiche d'un produit (DEC-c) : informations et variantes.
     *
     * @param string $slug Identifiant lisible du produit, lié par une requête préparée.
     *
     * @return array{id: int, slug: string, nom: string, description: ?string,
     *               image_url: string, categorie: string, prix_min: ?float,
     *               disponible: bool,
     *               variantes: array<int, array{id: int, nom_option: string,
     *                                           prix_ttc: float, disponible: bool}>}|null
     *         null si aucun produit ne porte ce slug.
     */
    public function trouverParSlug(string $slug): ?array
    {
        $requete = $this->pdo->prepare(
            'SELECT produit.id,
                    produit.slug,
                    produit.nom,
                    produit.description,
                    produit.image_url,
                    categorie.nom AS categorie
               FROM produit
         INNER JOIN categorie ON categorie.id = produit.categorie_id
              WHERE produit.slug = :slug'
        );
        $requete->execute(['slug' => $slug]);
        $ligne = $requete->fetch();

        if ($ligne === false) {
            return null;
        }

        $requeteVariantes = $this->pdo->prepare(
            'SELECT id, nom_option, prix_ttc, stock
               FROM variante
              WHERE produit_id = :produit
           ORDER BY prix_ttc ASC, id ASC'
        );
        $requeteVariantes->execute(['produit' => (int) $ligne['id']]);

        $variantes = array_map(
            static function (array $variante): array {
                return [
                    'id'         => (int) $variante['id'],
                    'nom_option' => $variante['nom_option'],
                    'prix_ttc'   => (float) $variante['prix_ttc'],
                    'disponible' => (int) $variante['stock'] > 0,
                ];
            },
            $requeteVariantes->fetchAll(),
        );

        $prix = array_map(
            static function (array $variante): float {
                return $variante['prix_ttc'];
            },
            $variantes,
        );
        $disponibles = array_filter(
            $variantes,
            static function (array $variante): bool {
                return $variante['disponible'];
            },
        );

        return [
            'id'          => (int) $ligne['id'],
            'slug'        => $ligne['slug'],
            'nom'         => $ligne['nom'],
            'description' => $ligne['description'],
            'image_url'   => $ligne['image_url'],
            'categorie'   => $ligne['categorie'],
            'prix_min'    => count($prix) === 0 ? null : min($prix),
            'disponible'  => count($disponibles) > 0,
            'variantes'   => $variantes,
        ];
    }
}

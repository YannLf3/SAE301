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
    /**
     * Stock cumulé à partir duquel un produit est « bientôt épuisé ».
     * Valeur provisoire : GOF-a la rendra configurable par produit.
     */
    private const SEUIL_STOCK_BAS = 5;

    /** Connexion à la base, fournie à la construction. */
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Les produits du catalogue (DEC-b : pas de pagination), éventuellement
     * limités à une catégorie (DEC-a).
     *
     * @param string  $ordre     Fragment SQL de tri, par exemple « produit.nom ASC ».
     *                           ATTENTION : inséré tel quel dans la requête, il ne
     *                           doit JAMAIS provenir directement de l'utilisateur
     *                           (liste blanche du contrôleur).
     * @param ?string $categorie Slug de la catégorie à afficher, lié par une requête
     *                           préparée ; null pour tous les produits.
     *
     * @return array<int, array{id: int, slug: string, nom: string, image_url: string,
     *                          categorie: string, categorie_slug: string,
     *                          resume_options: string, prix_min: ?float,
     *                          stock_total: int, disponible: bool, statut_stock: string}>
     */
    public function lister(string $ordre, ?string $categorie = null): array
    {
        $filtre = $categorie === null ? '' : 'WHERE categorie.slug = :categorie';

        $sql = "SELECT produit.id,
                       produit.slug,
                       produit.nom,
                       produit.image_url,
                       categorie.nom           AS categorie,
                       categorie.slug          AS categorie_slug,
                       MIN(variante.prix_ttc)  AS prix_min,
                       COALESCE(SUM(variante.stock), 0) AS stock_total,
                       GROUP_CONCAT(variante.nom_option
                                    ORDER BY variante.prix_ttc, variante.id
                                    SEPARATOR '||') AS options
                  FROM produit
            INNER JOIN categorie ON categorie.id = produit.categorie_id
             LEFT JOIN variante  ON variante.produit_id = produit.id
                 {$filtre}
              GROUP BY produit.id, categorie.nom, categorie.slug
              ORDER BY {$ordre}, produit.id";

        $requete = $this->pdo->prepare($sql);
        $requete->execute($categorie === null ? [] : ['categorie' => $categorie]);

        return array_map(
            function (array $ligne): array {
                $stock = (int) $ligne['stock_total'];

                return [
                    'id'             => (int) $ligne['id'],
                    'slug'           => $ligne['slug'],
                    'nom'            => $ligne['nom'],
                    'image_url'      => $ligne['image_url'],
                    'categorie'      => $ligne['categorie'],
                    'categorie_slug' => $ligne['categorie_slug'],
                    'resume_options' => $this->resumerOptions($ligne['options']),
                    // MySQL renvoie les nombres en chaînes : le JSON doit contenir
                    // de vrais nombres. Un produit sans variante n'a pas de prix.
                    'prix_min'       => $ligne['prix_min'] === null ? null : (float) $ligne['prix_min'],
                    'stock_total'    => $stock,
                    'disponible'     => $stock > 0,
                    'statut_stock'   => $this->statutStock($stock),
                ];
            },
            $requete->fetchAll(),
        );
    }

    /**
     * Niveau de stock d'un produit, d'après son stock cumulé.
     *
     * @param int $stock Stock cumulé de toutes les variantes.
     *
     * @return string « disponible », « bientot_epuise » ou « epuise ».
     */
    private function statutStock(int $stock): string
    {
        if ($stock <= 0) {
            return 'epuise';
        }

        return $stock <= self::SEUIL_STOCK_BAS ? 'bientot_epuise' : 'disponible';
    }

    /**
     * Résumé des options d'un produit : première et dernière variante par prix
     * (« Standard / Fly More Combo »), ou la seule variante s'il n'y en a qu'une.
     *
     * @param ?string $options Noms d'options séparés par « || », triés par prix.
     */
    private function resumerOptions(?string $options): string
    {
        if ($options === null || $options === '') {
            return '';
        }

        $noms = explode('||', $options);

        return count($noms) === 1 ? $noms[0] : $noms[0] . ' / ' . $noms[count($noms) - 1];
    }

    /**
     * Fiche d'un produit (DEC-c) : informations et variantes.
     *
     * @param string $slug Identifiant lisible du produit, lié par une requête préparée.
     *
     * @return array{id: int, slug: string, nom: string, description: ?string,
     *               image_url: string, categorie: string, categorie_slug: string,
     *               prix_min: ?float, disponible: bool,
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
                    categorie.nom  AS categorie,
                    categorie.slug AS categorie_slug
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
            'categorie_slug' => $ligne['categorie_slug'],
            'prix_min'    => count($prix) === 0 ? null : min($prix),
            'disponible'  => count($disponibles) > 0,
            'variantes'   => $variantes,
        ];
    }
}

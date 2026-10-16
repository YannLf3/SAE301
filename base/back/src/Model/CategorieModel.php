<?php

declare(strict_types=1);

namespace App\Model;

use PDO;

/**
 * Accès aux données des catégories de produits (DEC-a).
 *
 * Cette couche exécute les requêtes et renvoie des tableaux, sans règle de
 * présentation.
 */
final class CategorieModel
{
    /** Connexion à la base, fournie à la construction. */
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Toutes les catégories, avec leur nombre de produits.
     *
     * Une catégorie vide est renvoyée avec un total de 0 (LEFT JOIN) : la
     * navigation ne doit pas la faire disparaître silencieusement.
     *
     * @return array<int, array{slug: string, nom: string, total: int}>
     */
    public function lister(): array
    {
        $sql = 'SELECT categorie.slug,
                       categorie.nom,
                       COUNT(produit.id) AS total
                  FROM categorie
             LEFT JOIN produit ON produit.categorie_id = categorie.id
              GROUP BY categorie.id, categorie.slug, categorie.nom
              ORDER BY categorie.id';

        return array_map(
            static function (array $ligne): array {
                return [
                    'slug'  => $ligne['slug'],
                    'nom'   => $ligne['nom'],
                    // MySQL renvoie les nombres en chaînes : le JSON doit contenir
                    // de vrais nombres.
                    'total' => (int) $ligne['total'],
                ];
            },
            $this->pdo->query($sql)->fetchAll(),
        );
    }

    /**
     * Indique si une catégorie porte ce slug.
     *
     * @param string $slug Identifiant lisible de la catégorie, lié par une requête préparée.
     */
    public function existe(string $slug): bool
    {
        $requete = $this->pdo->prepare('SELECT COUNT(*) FROM categorie WHERE slug = :slug');
        $requete->execute(['slug' => $slug]);

        return (int) $requete->fetchColumn() > 0;
    }
}

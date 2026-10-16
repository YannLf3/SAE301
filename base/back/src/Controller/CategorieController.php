<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\CategorieModel;

/**
 * Navigation par catégories (DEC-a) : liste des catégories et de leurs effectifs.
 */
final class CategorieController
{
    /** Le modèle qui interroge la base, fourni à la construction. */
    private CategorieModel $categories;

    public function __construct(CategorieModel $categories)
    {
        $this->categories = $categories;
    }

    /**
     * GET /api/categories
     *
     * La réponse contient aussi le total de produits toutes catégories
     * confondues, pour l'entrée « Tous les produits » de la navigation.
     */
    public function index(Request $requete): void
    {
        $categories = $this->categories->lister();

        $total = array_sum(array_map(
            static function (array $categorie): int {
                return $categorie['total'];
            },
            $categories,
        ));

        Response::json([
            'categories' => $categories,
            'total'      => $total,
        ]);
    }
}

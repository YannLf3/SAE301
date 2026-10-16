<?php

declare(strict_types=1);

namespace App\Controller;

use App\Core\Request;
use App\Core\Response;
use App\Model\CategorieModel;
use App\Model\ProduitModel;

/**
 * Catalogue de produits (DEC-b) : produits triés, filtrés par catégorie (DEC-a) ;
 * fiche produit (DEC-c).
 *
 * Aucune pagination ni préférence mémorisée : le catalogue est assez court
 * pour être renvoyé en entier.
 */
final class CatalogueController
{
    /**
     * Liste blanche des tris autorisés.
     *
     * La clé vient du client, la valeur est écrite par nous. Le client ne choisit
     * donc jamais un nom de colonne : il choisit une entrée dans un tableau que
     * nous contrôlons entièrement.
     */
    private const TRIS = [
        'nom'       => 'produit.nom ASC',
        'prix_asc'  => 'prix_min ASC',
        'prix_desc' => 'prix_min DESC',
    ];

    private const TRI_PAR_DEFAUT = 'nom';

    /** Le modèle qui interroge la base, fourni à la construction. */
    private ProduitModel $produits;

    /** Sert à valider le slug de catégorie reçu du client. */
    private CategorieModel $categories;

    public function __construct(ProduitModel $produits, CategorieModel $categories)
    {
        $this->produits   = $produits;
        $this->categories = $categories;
    }

    /**
     * GET /api/produits?tri=nom|prix_asc|prix_desc&categorie=drones
     *
     * Un tri inconnu ou absent retombe sur le tri par défaut. La réponse
     * rappelle le tri réellement appliqué. Sans « categorie », tous les
     * produits sont renvoyés ; avec un slug inconnu, la réponse est une 404
     * (contrairement au tri, un filtre erroné ne doit pas afficher tout le
     * catalogue comme si de rien n'était).
     */
    public function index(Request $requete): void
    {
        $tri = $requete->parametre('tri') ?? self::TRI_PAR_DEFAUT;
        $tri = array_key_exists($tri, self::TRIS) ? $tri : self::TRI_PAR_DEFAUT;

        $categorie = $requete->parametre('categorie');

        if ($categorie === '') {
            $categorie = null;
        }

        if ($categorie !== null && !$this->categories->existe($categorie)) {
            Response::erreur('Catégorie introuvable.', 404);
        }

        $produits = $this->produits->lister(self::TRIS[$tri], $categorie);

        Response::json([
            'produits'  => $produits,
            'tri'       => $tri,
            'categorie' => $categorie,
            'total'     => count($produits),
        ]);
    }

    /**
     * GET /api/produit?slug=dji-mini-4-pro (DEC-c)
     *
     * 400 si le slug est absent, 404 si aucun produit ne le porte.
     */
    public function show(Request $requete): void
    {
        $slug = $requete->parametre('slug');

        if ($slug === null || $slug === '') {
            Response::erreur('Le paramètre « slug » est obligatoire.', 400);
        }

        $produit = $this->produits->trouverParSlug($slug);

        if ($produit === null) {
            Response::erreur('Produit introuvable.', 404);
        }

        Response::json($produit);
    }
}

import { getRequest } from "../lib/api-request.js";

let ProduitData = {};

/**
 * Les produits du catalogue : GET /api/produits?tri=…&categorie=…
 *
 * tri ("nom", "prix_asc" ou "prix_desc") est facultatif : sans lui, le serveur
 * trie par nom. Le serveur ignore un tri inconnu et renvoie celui appliqué.
 * categorie (slug) est facultatif : sans lui, tous les produits sont renvoyés ;
 * un slug inconnu lève une ErreurApi de statut 404.
 *
 * { produits: [ { id, slug, nom, image_url, categorie, categorie_slug,
 *                 resume_options, prix_min, stock_total, disponible,
 *                 statut_stock }, ... ],
 *   tri: "nom", categorie: "drones" | null, total: 12 }
 *
 * statut_stock vaut "disponible", "bientot_epuise" ou "epuise".
 */
ProduitData.fetchAll = async function (tri, categorie) {
  let parametres = [];

  if (tri !== undefined) {
    parametres.push(`tri=${encodeURIComponent(tri)}`);
  }

  if (categorie !== undefined && categorie !== null) {
    parametres.push(`categorie=${encodeURIComponent(categorie)}`);
  }

  let uri = parametres.length === 0 ? "produits" : `produits?${parametres.join("&")}`;

  return getRequest(uri);
};

/**
 * Fiche d'un produit : GET /api/produit?slug=…
 *
 * { id, slug, nom, description, image_url, categorie, categorie_slug, prix_min, disponible,
 *   variantes: [ { id, nom_option, prix_ttc, disponible }, ... ] }
 *
 * Lève une ErreurApi de statut 404 si le produit n'existe pas.
 */
ProduitData.fetchOne = async function (slug) {
  return getRequest(`produit?slug=${encodeURIComponent(slug)}`);
};

export { ProduitData };

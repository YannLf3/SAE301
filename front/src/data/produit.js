import { getRequest } from "../lib/api-request.js";

let ProduitData = {};

/**
 * Tous les produits du catalogue : GET /api/produits?tri=…
 *
 * tri ("nom", "prix_asc" ou "prix_desc") est facultatif : sans lui, le serveur
 * trie par nom. Le serveur ignore un tri inconnu et renvoie celui appliqué.
 *
 * { produits: [ { id, slug, nom, image_url, categorie, prix_min, stock_total,
 *                 disponible }, ... ],
 *   tri: "nom", total: 13 }
 */
ProduitData.fetchAll = async function (tri) {
  let uri = "produits";

  if (tri !== undefined) {
    uri += `?tri=${encodeURIComponent(tri)}`;
  }

  return getRequest(uri);
};

/**
 * Fiche d'un produit : GET /api/produit?slug=…
 *
 * { id, slug, nom, description, image_url, categorie, prix_min, disponible,
 *   variantes: [ { id, nom_option, prix_ttc, disponible }, ... ] }
 *
 * Lève une ErreurApi de statut 404 si le produit n'existe pas.
 */
ProduitData.fetchOne = async function (slug) {
  return getRequest(`produit?slug=${encodeURIComponent(slug)}`);
};

export { ProduitData };

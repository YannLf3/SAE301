import { getRequest } from "../lib/api-request.js";

let CategorieData = {};

/**
 * Toutes les catégories avec leur nombre de produits : GET /api/categories
 *
 * { categories: [ { slug, nom, total }, ... ], total: 12 }
 *
 * total est le nombre de produits toutes catégories confondues.
 */
CategorieData.fetchAll = async function () {
  return getRequest("categories");
};

export { CategorieData };

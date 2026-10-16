import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Fil d'Ariane d'une fiche produit : Tous les produits › Catégorie › Produit.
// Masqué sous 768 px, où la page propose le lien « Retour au catalogue ».
let FilArianeView = {
  /**
   * . produit : fiche produit de l'API ({ nom, categorie, categorie_slug })
   * > fragment du fil d'Ariane
   */
  dom: function (produit) {
    return htmlToFragment(
      genericRenderer(template, {
        nom: produit.nom,
        categorie: produit.categorie,
        categorie_slug: encodeURIComponent(produit.categorie_slug),
      }),
    );
  },
};

export { FilArianeView };

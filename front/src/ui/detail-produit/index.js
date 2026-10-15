import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";
import templateVariante from "./variante.html?raw";

/**
 * Règle la couleur d'un statut de stock. Le texte porte aussi l'information,
 * la couleur n'est qu'un renfort.
 */
function colorerStock(element, disponible) {
  element.classList.add(disponible ? "text-status-stock" : "text-status-danger-stock");
}

// Fiche d'un produit, telle que la renvoie l'API :
// { nom, description, image_url, categorie, prix_min, disponible,
//   variantes: [ { nom_option, prix_ttc, disponible } ] }
let DetailProduitView = {
  /**
   * . produit : fiche produit de l'API
   * > fragment de la fiche, variantes comprises
   */
  dom: function (produit) {
    let fragment = htmlToFragment(
      genericRenderer(template, {
        nom: produit.nom,
        categorie: produit.categorie,
        description: produit.description ?? "",
        image: import.meta.env.BASE_URL + produit.image_url,
        prix: produit.prix_min === null ? "Prix indisponible" : `À partir de ${formaterPrix(produit.prix_min)}`,
        stock: produit.disponible ? "En stock" : "Rupture de stock",
      }),
    );
    colorerStock(fragment.querySelector('[data-role="stock"]'), produit.disponible);

    let lignes = produit.variantes.map(function (variante) {
      let ligne = htmlToFragment(
        genericRenderer(templateVariante, {
          nom_option: variante.nom_option,
          prix: formaterPrix(variante.prix_ttc),
          stock: variante.disponible ? "En stock" : "Rupture de stock",
        }),
      );
      colorerStock(ligne.querySelector('[data-role="stock"]'), variante.disponible);
      return ligne;
    });
    fragment.querySelector('slot[name="variantes"]').replaceWith(...lignes);

    return fragment;
  },
};

export { DetailProduitView };

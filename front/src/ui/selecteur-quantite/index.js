import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Sélecteur de quantité − / n / +, partagé par le panier et la fiche produit.
let SelecteurQuantiteView = {
  /**
   * . data : { quantite, minimum, maximum, libelle } ; le bouton « − » est
   *   désactivé à partir de minimum, « + » à partir de maximum
   * . callbacks : { surQuantite(quantite, action) }, action vaut
   *   "diminuer" ou "augmenter"
   * > fragment du sélecteur
   */
  dom: function (data, callbacks) {
    let fragment = htmlToFragment(genericRenderer(template, { quantite: data.quantite, libelle: data.libelle }));
    let moins = fragment.querySelector('[data-action="diminuer"]');
    let plus = fragment.querySelector('[data-action="augmenter"]');

    moins.disabled = data.quantite <= data.minimum;
    plus.disabled = data.quantite >= data.maximum;

    moins.addEventListener("click", function () {
      callbacks.surQuantite(data.quantite - 1, "diminuer");
    });
    plus.addEventListener("click", function () {
      callbacks.surQuantite(data.quantite + 1, "augmenter");
    });

    return fragment;
  },
};

export { SelecteurQuantiteView };

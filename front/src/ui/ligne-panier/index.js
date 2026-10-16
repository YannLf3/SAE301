import { formaterPrix } from "../../lib/format.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { SelecteurQuantiteView } from "../selecteur-quantite/index.js";
import template from "./template.html?raw";

// Une ligne du panier : { variantId, produitSlug, nom, option, image_url,
// prix_unitaire, quantite }.
let LignePanierView = {
  /**
   * . ligne : ligne du panier
   * . quantiteMax : quantité maximale par ligne
   * . callbacks : { surQuantite(variantId, quantite), surSupprimer(variantId) }
   * > fragment <li> de la ligne
   */
  dom: function (ligne, quantiteMax, callbacks) {
    let fragment = htmlToFragment(
      genericRenderer(template, {
        slug: encodeURIComponent(ligne.produitSlug),
        nom: ligne.nom,
        option: ligne.option,
        image: import.meta.env.BASE_URL + ligne.image_url,
        quantite: ligne.quantite,
        prix_unitaire: formaterPrix(ligne.prix_unitaire),
        sous_total: formaterPrix(Math.round(ligne.prix_unitaire * 100 * ligne.quantite) / 100),
      }),
    );
    let element = fragment.firstElementChild;

    element.dataset.variantId = String(ligne.variantId);
    fragment.querySelector('slot[name="quantite"]').replaceWith(
      SelecteurQuantiteView.dom(
        {
          quantite: ligne.quantite,
          minimum: 1,
          maximum: quantiteMax,
          libelle: `Quantité de ${ligne.nom}, ${ligne.option}`,
        },
        {
          surQuantite: function (quantite, action) {
            callbacks.surQuantite(ligne.variantId, quantite, action);
          },
        },
      ),
    );

    element.querySelector('[data-action="supprimer"]').addEventListener("click", function () {
      callbacks.surSupprimer(ligne.variantId);
    });

    return fragment;
  },
};

export { LignePanierView };

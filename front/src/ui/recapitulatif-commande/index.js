import { formaterPrix } from "../../lib/format.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Rappel de la commande en cours, sans action (maquette « 04 Authentification »).
let RecapitulatifCommandeView = {
  /**
   * . data : { nombre: string, lignes: string[], total: number }
   *          nombre : « 2 articles » ; lignes : une ligne de texte par article
   * > fragment du récapitulatif
   */
  dom: function (data) {
    let fragment = htmlToFragment(
      genericRenderer(template, { nombre: data.nombre, total: formaterPrix(data.total) }),
    );

    let items = data.lignes.map(function (texte) {
      let li = document.createElement("li");
      // textContent : le nom d'un produit n'est jamais du HTML.
      li.textContent = texte;
      return li;
    });
    fragment.querySelector("ul").append(...items);

    return fragment;
  },
};

export { RecapitulatifCommandeView };

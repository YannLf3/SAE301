import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Barre de réglages du catalogue : critère de tri.
// Le composant ne décide de rien : il affiche les valeurs reçues, et signale
// le changement par la fonction reçue dans actions.
let BarreOutilsView = {
  html: function (data) {
    return genericRenderer(template, data);
  },

  /**
   * @param {{tri: string, total: number}} data
   * @param {{surTri: function(string): void}} actions
   */
  dom: function (data, actions) {
    let fragment = htmlToFragment(BarreOutilsView.html(data));
    let tri = fragment.querySelector('select[name="tri"]');

    // Un template n'a pas de condition : l'option choisie se règle ici.
    tri.value = data.tri;

    tri.addEventListener("change", function () {
      actions.surTri(tri.value);
    });

    return fragment;
  },
};

export { BarreOutilsView };

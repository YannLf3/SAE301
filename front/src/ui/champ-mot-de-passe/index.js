import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Champ mot de passe avec bouton « œil ». Le bouton ne change que l'affichage
// du champ (type password ↔ text) : aucune donnée n'est conservée ici.
let ChampMotDePasseView = {
  /**
   * . data : { id, autocomplete, minimum, aide } (id unique dans la page)
   * > fragment du champ
   */
  dom: function (data) {
    let fragment = htmlToFragment(genericRenderer(template, data));
    let champ = fragment.querySelector("input");
    let bouton = fragment.querySelector('[data-action="afficher"]');

    bouton.addEventListener("click", function () {
      let visible = champ.type === "password";
      champ.type = visible ? "text" : "password";
      bouton.setAttribute("aria-pressed", String(visible));
      bouton.setAttribute("aria-label", visible ? "Masquer le mot de passe" : "Afficher le mot de passe");
    });

    return fragment;
  },
};

export { ChampMotDePasseView };

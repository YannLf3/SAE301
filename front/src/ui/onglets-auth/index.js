import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Choix entre « Se connecter » et « Créer un compte ».
let OngletsAuthView = {
  /**
   * . data : { mode: "connexion" | "inscription" } onglet actif
   * . callbacks : { surMode(mode) }
   * > fragment des onglets
   */
  dom: function (data, callbacks) {
    let fragment = htmlToFragment(template);
    let groupe = fragment.firstElementChild;

    groupe.querySelector(`[data-mode="${data.mode}"]`).setAttribute("aria-pressed", "true");

    // Délégation : un seul écouteur sur le groupe.
    groupe.addEventListener("click", function (ev) {
      let bouton = ev.target.closest("button[data-mode]");
      if (bouton !== null && bouton.getAttribute("aria-pressed") !== "true") {
        callbacks.surMode(bouton.dataset.mode);
      }
    });

    return fragment;
  },
};

export { OngletsAuthView };

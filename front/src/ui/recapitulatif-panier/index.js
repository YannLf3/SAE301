import { formaterPrix } from "../../lib/format.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Frais de retrait : gratuit en magasin (maquette Figma).
const FRAIS_RETRAIT = 0;

let RecapitulatifPanierView = {
  /**
   * . data : { sousTotal: number }
   * . callbacks : { surCommander() }
   * > fragment du récapitulatif
   */
  dom: function (data, callbacks) {
    let fragment = htmlToFragment(
      genericRenderer(template, {
        sous_total: formaterPrix(data.sousTotal),
        frais: formaterPrix(FRAIS_RETRAIT),
        total: formaterPrix(data.sousTotal + FRAIS_RETRAIT),
      }),
    );

    fragment.querySelector('[data-action="commander"]').addEventListener("click", callbacks.surCommander);
    return fragment;
  },
};

export { RecapitulatifPanierView };

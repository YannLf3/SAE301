import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// État vide du panier : message et lien vers le catalogue.
let PanierVideView = {
  /**
   * > fragment de l'état vide
   */
  dom: function () {
    return htmlToFragment(template);
  },
};

export { PanierVideView };

import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

// Rappel du parcours Click & Collect : contenu fixe, aucune donnée à recevoir.
let EtapesRetraitView = {
  dom: function () {
    return htmlToFragment(template);
  },
};

export { EtapesRetraitView };

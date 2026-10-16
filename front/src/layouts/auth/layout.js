import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * Layout des écrans d'authentification (maquette Figma « 04 Authentification ») :
 * en-tête et pied de page épurés, sans navigation ni panier, pour garder
 * l'attention sur le formulaire.
 *
 * Le layout est statique : il n'a ni état ni donnée à charger. M reste donc
 * vide, et C.init se contente de demander la Vue.
 */

let M = {};

let C = {};

C.init = function () {
  return V.init(M);
};

let V = {};

/**
 * . etat : état du layout (voir M)
 * > fragment du layout ; le slot sans nom reçoit la page (routeur)
 */
V.init = function (etat) {
  return htmlToFragment(template);
};

/**
 * @returns {DocumentFragment}
 */
export function AuthLayout() {
  return C.init();
}

import { PanierData } from "../../data/panier.js";
import { htmlToFragment } from "../../lib/utils.js";
import { HeaderView } from "../../ui/header/index.js";
import template from "./template.html?raw";

/**
 * Layout principal : l'en-tête, puis la page affichée.
 *
 * Le router reconstruit le layout à chaque navigation. L'en-tête ne dépend
 * que du panier : le compteur est relu depuis le stockage à chaque fois.
 *
 * Le slot nommé « header » est remplacé ici. Le slot sans nom est laissé au
 * routeur, qui y place la page.
 */

let M = {
  quantitePanier: 0, // nombre d'articles au panier (compteur de l'en-tête)
  abonne: false, // true une fois le layout abonné aux changements du panier
};

/**
 * > rien ; relit le nombre d'articles du panier dans M.quantitePanier
 */
M.loadPanier = function () {
  M.quantitePanier = PanierData.compter();
};

let C = {};

/**
 * Le panier a changé (cette page ou un autre onglet) : met le compteur à jour.
 */
C.handler_panierChange = function () {
  M.loadPanier();
  V.rafraichir(M);
};

C.init = function () {
  M.loadPanier();
  // Le layout est reconstruit à chaque navigation : on ne s'abonne qu'une fois.
  if (!M.abonne) {
    PanierData.abonner(C.handler_panierChange);
    M.abonne = true;
  }
  let fragment = V.init(M);
  return fragment;
};

let V = {};

V.header = null; // élément <header> affiché

/**
 * . etat : état du layout (voir M)
 * > fragment du layout complet ; mémorise l'élément <header>
 */
V.init = function (etat) {
  let layout = htmlToFragment(template);
  let header = HeaderView.dom(etat);

  V.header = header.firstElementChild;
  layout.querySelector('slot[name="header"]').replaceWith(header);
  return layout;
};

/**
 * Remplace l'en-tête par une version construite à partir de l'état reçu.
 * . etat : état du layout (voir M)
 */
V.rafraichir = function (etat) {
  let header = HeaderView.dom(etat);
  let nouveauHeader = header.firstElementChild;

  V.header.replaceWith(header);
  V.header = nouveauHeader;
};

/**
 * @returns {DocumentFragment}
 */
export function RootLayout() {
  return C.init();
}

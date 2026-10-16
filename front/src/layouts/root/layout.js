import { CategorieData } from "../../data/categorie.js";
import { htmlToFragment } from "../../lib/utils.js";
import { HeaderView } from "../../ui/header/index.js";
import template from "./template.html?raw";

/**
 * Layout principal : l'en-tête, puis la page affichée.
 *
 * Le router reconstruit le layout à chaque navigation : les catégories de
 * l'en-tête sont donc gardées dans M, et chargées une seule fois. Tant
 * qu'elles ne sont pas là, l'en-tête n'affiche que « Tous les produits ».
 *
 * Le slot nommé « header » est remplacé ici. Le slot sans nom est laissé au
 * routeur, qui y place la page.
 */

let M = {
  etat: "chargement", // "chargement" | "pret" | "erreur"
  categories: [], // [ { slug, nom, total } ]
  total: null, // produits toutes catégories confondues, null tant qu'inconnu
};

/**
 * > rien ; range la réponse de l'API dans M, ou lève l'erreur
 */
M.load = async function () {
  let reponse = await CategorieData.fetchAll();
  M.categories = reponse.categories;
  M.total = reponse.total;
};

let C = {};

/**
 * Charge les catégories si elles ne le sont pas déjà, puis rafraîchit l'en-tête.
 * Une erreur n'est pas bloquante : la navigation reste utilisable, et le
 * chargement sera retenté à la prochaine navigation.
 */
C.charger = async function () {
  if (M.etat === "pret") {
    return;
  }

  try {
    await M.load();
    M.etat = "pret";
  } catch (erreur) {
    M.etat = "erreur";
  }
  V.rafraichir(M);
};

C.init = function () {
  let fragment = V.init(M);
  C.charger();
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

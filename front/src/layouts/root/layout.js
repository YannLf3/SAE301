import { AuthData } from "../../data/auth.js";
import { PanierData } from "../../data/panier.js";
import { htmlToFragment } from "../../lib/utils.js";
import { HeaderView } from "../../ui/header/index.js";
import template from "./template.html?raw";

/**
 * Layout principal : l'en-tête, puis la page affichée.
 *
 * Le router reconstruit le layout à chaque navigation. L'en-tête dépend du
 * panier (compteur relu depuis le stockage) et de l'utilisateur connecté
 * (demandé au serveur une seule fois, puis tenu à jour par AuthData).
 *
 * Le slot nommé « header » est remplacé ici. Le slot sans nom est laissé au
 * routeur, qui y place la page.
 */

let M = {
  quantitePanier: 0, // nombre d'articles au panier (compteur de l'en-tête)
  utilisateur: null, // { prenom, … } de l'utilisateur connecté, ou null
  abonne: false, // true une fois le layout abonné aux changements (panier, session)
};

/**
 * > rien ; relit le nombre d'articles du panier dans M.quantitePanier
 */
M.loadPanier = function () {
  M.quantitePanier = PanierData.compter();
};

let C = {};

/**
 * La session a changé (connexion, inscription, déconnexion) : met l'en-tête à jour.
 * . utilisateur : nouvel utilisateur connecté, ou null
 */
C.handler_sessionChange = function (utilisateur) {
  M.utilisateur = utilisateur;
  V.rafraichir(M);
};

/**
 * Demande au serveur qui est connecté. Une erreur réseau laisse l'en-tête
 * en visiteur : le serveur reste seul juge à chaque action protégée.
 */
C.loadSession = async function () {
  try {
    M.utilisateur = await AuthData.me();
  } catch (erreur) {
    M.utilisateur = null;
  }
  V.rafraichir(M);
};

/**
 * Clic sur « Se déconnecter » : la réponse du serveur met l'en-tête à jour
 * (via l'abonnement). Un échec laisse l'utilisateur connecté.
 */
C.handler_deconnexion = async function () {
  try {
    await AuthData.logout();
  } catch (erreur) {
    // Session inchangée : l'en-tête reste tel quel.
  }
};

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
    AuthData.abonner(C.handler_sessionChange);
    M.abonne = true;
    C.loadSession();
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
  let header = HeaderView.dom(etat, { surDeconnexion: C.handler_deconnexion });

  V.header = header.firstElementChild;
  layout.querySelector('slot[name="header"]').replaceWith(header);
  return layout;
};

/**
 * Remplace l'en-tête par une version construite à partir de l'état reçu.
 * . etat : état du layout (voir M)
 */
V.rafraichir = function (etat) {
  let header = HeaderView.dom(etat, { surDeconnexion: C.handler_deconnexion });
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

import { ProduitData } from "../../data/produit.js";
import { htmlToFragment } from "../../lib/utils.js";
import { BarreOutilsView } from "../../ui/barre-outils/index.js";
import { GrilleProduitsView } from "../../ui/grille-produits/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";

/**
 * Page « Catalogue » (DEC-b).
 *
 * Tous les produits sont chargés d'un coup, sans pagination. Au premier
 * chargement, le serveur applique son tri par défaut ; ensuite, le tri choisi
 * accompagne chaque requête.
 */

let M = {
  etat: "chargement", // "chargement" | "pret" | "erreur"
  catalogue: null, // dernière réponse de l'API : { produits, tri, total }
  message: null, // { type, texte }, ou null
};

/**
 * . tri : critère de tri facultatif ("nom", "prix_asc", "prix_desc")
 * > rien ; range la réponse de l'API dans M.catalogue, ou lève l'erreur
 */
M.load = async function (tri) {
  M.catalogue = await ProduitData.fetchAll(tri);
};

let C = {};

/**
 * Charge le catalogue, met à jour l'état de la page puis la rafraîchit.
 * . tri : critère de tri facultatif
 */
C.charger = async function (tri) {
  try {
    await M.load(tri);
    M.etat = "pret";
    M.message = null;
  } catch (erreur) {
    M.catalogue = null;
    M.etat = "erreur";
    M.message = { type: "erreur", texte: `Impossible de charger le catalogue : ${erreur.message}` };
  }
  V.rafraichir(M);
};

C.handler_changerTri = async function (tri) {
  await C.charger(tri);
};

C.init = function () {
  // La page s'affiche tout de suite avec l'état « chargement », puis se
  // reconstruit quand la réponse de l'API arrive.
  let fragment = V.init(M);
  C.charger();
  return fragment;
};

let V = {};

V.racine = null; // élément racine de la page affichée

/**
 * . etat : état de la page (voir M)
 * > fragment de la page ; mémorise son élément racine
 */
V.init = function (etat) {
  let fragment = V.createPageFragment(etat);
  V.racine = fragment.firstElementChild;
  return fragment;
};

/**
 * Reconstruit toute la page à partir de l'état reçu, et remplace l'ancienne.
 * C'est le principe des frameworks : l'affichage se déduit de l'état, on ne le
 * retouche pas morceau par morceau.
 * . etat : état de la page (voir M)
 */
V.rafraichir = function (etat) {
  let fragment = V.createPageFragment(etat);
  let nouvelleRacine = fragment.firstElementChild;
  V.racine.replaceWith(fragment);
  V.racine = nouvelleRacine;
};

V.createPageFragment = function (etat) {
  let pageFragment = htmlToFragment(template);
  let message = etat.message;

  if (etat.etat === "chargement") {
    message = { type: "info", texte: "Chargement du catalogue…" };
  }

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(message));

  if (etat.etat !== "pret") {
    // Rien d'autre à afficher : on retire les emplacements restants.
    pageFragment.querySelector('slot[name="barre-outils"]').remove();
    pageFragment.querySelector('slot[name="grille"]').remove();
    pageFragment.firstElementChild.setAttribute("aria-busy", String(etat.etat === "chargement"));
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="barre-outils"]').replaceWith(
    BarreOutilsView.dom(etat.catalogue, { surTri: C.handler_changerTri })
  );

  pageFragment.querySelector('slot[name="grille"]').replaceWith(GrilleProduitsView.dom(etat.catalogue.produits));

  return pageFragment;
};

export function CataloguePage() {
  return C.init();
}

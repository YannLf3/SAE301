import { ProduitData } from "../../data/produit.js";
import { htmlToFragment } from "../../lib/utils.js";
import { DetailProduitView } from "../../ui/detail-produit/index.js";
import { FilArianeView } from "../../ui/fil-ariane/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";

/**
 * Page « Détail produit » (DEC-c) : /produits/:slug.
 *
 * Affiche la fiche du produit et ses variantes. Un slug inconnu donne un
 * message d'erreur explicite (404 de l'API).
 */

let M = {
  etat: "chargement", // "chargement" | "pret" | "erreur"
  produit: null, // fiche renvoyée par l'API
  message: null, // { type, texte }, ou null
};

/**
 * . slug : identifiant lisible du produit
 * > rien ; range la fiche dans M.produit, ou lève l'erreur
 */
M.load = async function (slug) {
  M.produit = await ProduitData.fetchOne(slug);
};

let C = {};

/**
 * Charge la fiche, met à jour l'état de la page puis la rafraîchit.
 * . slug : identifiant lisible du produit
 */
C.charger = async function (slug) {
  try {
    await M.load(slug);
    M.etat = "pret";
    M.message = null;
  } catch (erreur) {
    M.produit = null;
    M.etat = "erreur";
    M.message = {
      type: "erreur",
      texte: erreur.statut === 404 ? "Ce produit n'existe pas." : `Impossible de charger le produit : ${erreur.message}`,
    };
  }
  V.rafraichir(M);
};

C.init = function (params) {
  // Le module est partagé entre les visites : on repart d'un état neuf.
  M.etat = "chargement";
  M.produit = null;
  M.message = null;

  let fragment = V.init(M);
  C.charger(params.slug);
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
    message = { type: "info", texte: "Chargement du produit…" };
  }

  pageFragment.querySelector('slot[name="message"]').replaceWith(MessageView.dom(message));

  if (etat.etat !== "pret") {
    pageFragment.querySelector('slot[name="fil-ariane"]').remove();
    pageFragment.querySelector('slot[name="detail"]').remove();
    pageFragment.firstElementChild.setAttribute("aria-busy", String(etat.etat === "chargement"));
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="fil-ariane"]').replaceWith(FilArianeView.dom(etat.produit));
  pageFragment.querySelector('slot[name="detail"]').replaceWith(DetailProduitView.dom(etat.produit));

  return pageFragment;
};

export function ProduitPage(params) {
  return C.init(params);
}

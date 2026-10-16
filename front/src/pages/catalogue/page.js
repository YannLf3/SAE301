import { CategorieData } from "../../data/categorie.js";
import { ProduitData } from "../../data/produit.js";
import { htmlToFragment } from "../../lib/utils.js";
import { BarreOutilsView } from "../../ui/barre-outils/index.js";
import { EtapesRetraitView } from "../../ui/etapes-retrait/index.js";
import { FiltresCategoriesView } from "../../ui/filtres-categories/index.js";
import { GrilleProduitsView } from "../../ui/grille-produits/index.js";
import { MessageView } from "../../ui/message/index.js";
import template from "./template.html?raw";

/**
 * Page « Catalogue » (DEC-b) et navigation par catégories (DEC-a).
 *
 * Deux routes partagent cette page : « / » (tous les produits) et
 * « /categories/:slug » (une catégorie). Les produits sont chargés d'un coup,
 * sans pagination. Au premier chargement, le serveur applique son tri par
 * défaut ; ensuite, le tri choisi accompagne chaque requête.
 */

let M = {
  etat: "chargement", // "chargement" | "pret" | "erreur"
  categorie: null, // slug de la catégorie affichée, ou null pour tous les produits
  catalogue: null, // dernière réponse de l'API : { produits, tri, categorie, total }
  categories: null, // réponse de l'API des catégories : { categories, total }
  message: null, // { type, texte }, ou null
};

/**
 * . tri : critère de tri facultatif ("nom", "prix_asc", "prix_desc")
 * > rien ; range les réponses de l'API dans M.catalogue et M.categories, ou
 *   lève l'erreur
 */
M.load = async function (tri) {
  // Les deux requêtes sont indépendantes : on les lance ensemble.
  let reponses = await Promise.all([ProduitData.fetchAll(tri, M.categorie), CategorieData.fetchAll()]);
  M.catalogue = reponses[0];
  M.categories = reponses[1];
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
    M.categories = null;
    M.etat = "erreur";
    M.message = {
      type: "erreur",
      texte:
        erreur.statut === 404
          ? "Cette catégorie n'existe pas. Choisissez-en une dans le menu."
          : `Impossible de charger le catalogue : ${erreur.message}`,
    };
  }
  V.rafraichir(M);
};

C.handler_changerTri = async function (tri) {
  await C.charger(tri);
};

/**
 * . params : paramètres de la route ({ slug } sur « /categories/:slug »)
 */
C.init = function (params) {
  // Le module est partagé entre les visites : on repart d'un état neuf.
  M.etat = "chargement";
  M.categorie = params.slug ?? null;
  M.catalogue = null;
  M.categories = null;
  M.message = null;

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
    pageFragment.querySelector('slot[name="filtres"]').remove();
    pageFragment.querySelector('slot[name="barre-outils"]').remove();
    pageFragment.querySelector('slot[name="grille"]').remove();
    pageFragment.querySelector('slot[name="etapes"]').remove();
    pageFragment.firstElementChild.setAttribute("aria-busy", String(etat.etat === "chargement"));
    return pageFragment;
  }

  pageFragment.querySelector('slot[name="filtres"]').replaceWith(FiltresCategoriesView.dom(etat.categories));

  pageFragment.querySelector('slot[name="barre-outils"]').replaceWith(
    BarreOutilsView.dom(etat.catalogue, { surTri: C.handler_changerTri })
  );

  pageFragment.querySelector('slot[name="grille"]').replaceWith(GrilleProduitsView.dom(etat.catalogue.produits));
  pageFragment.querySelector('slot[name="etapes"]').replaceWith(EtapesRetraitView.dom());

  return pageFragment;
};

export function CataloguePage(params) {
  return C.init(params);
}

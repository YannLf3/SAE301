import { PanierData, QUANTITE_MAX } from "../../data/panier.js";
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
  quantites: {}, // quantité au panier de chaque variante : { [variantId]: n }
};

/**
 * > rien ; range dans M.quantites les quantités du panier, par variante
 */
M.loadQuantites = function () {
  let quantites = {};
  let lignes = PanierData.lire();

  for (let i = 0; i < lignes.length; i++) {
    quantites[lignes[i].variantId] = lignes[i].quantite;
  }
  M.quantites = quantites;
};

/**
 * . slug : identifiant lisible du produit
 * > rien ; range la fiche dans M.produit, ou lève l'erreur
 */
M.load = async function (slug) {
  M.produit = await ProduitData.fetchOne(slug);
  M.loadQuantites();
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

/**
 * Ajoute une unité de la variante choisie au panier, au prix affiché.
 * . variante : variante de la fiche ({ id, nom_option, prix_ttc })
 */
C.handler_ajouterAuPanier = function (variante) {
  let ajoute = PanierData.ajouter({
    variantId: variante.id,
    produitSlug: M.produit.slug,
    nom: M.produit.nom,
    option: variante.nom_option,
    image_url: M.produit.image_url,
    prix_unitaire: Number(variante.prix_ttc),
  });

  M.loadQuantites();
  M.message = ajoute
    ? { type: "succes", texte: `${M.produit.nom} (${variante.nom_option}) a été ajouté au panier.` }
    : { type: "erreur", texte: "Impossible d'ajouter cet article au panier." };
  V.rafraichir(M);
  V.focus(variante.id, "augmenter");
};

/**
 * Change la quantité d'une variante déjà au panier ; 0 la retire.
 * . variante : variante de la fiche
 * . quantite : nouvelle quantité
 * . action : "diminuer" ou "augmenter", pour redonner le focus au bon bouton
 */
C.handler_changerQuantite = function (variante, quantite, action) {
  let ecrit = quantite === 0 ? PanierData.supprimer(variante.id) : PanierData.changerQuantite(variante.id, quantite);

  M.loadQuantites();
  M.message = ecrit ? null : { type: "erreur", texte: "Le panier n'a pas pu être enregistré dans votre navigateur." };
  V.rafraichir(M);
  V.focus(variante.id, action);
};

C.init = function (params) {
  // Le module est partagé entre les visites : on repart d'un état neuf.
  M.etat = "chargement";
  M.produit = null;
  M.message = null;
  M.quantites = {};

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

/**
 * Redonne le focus au contrôle de la variante, perdu par la reconstruction.
 * . variantId : identifiant de la variante
 * . action : "diminuer" ou "augmenter"
 */
V.focus = function (variantId, action) {
  let ligne = V.racine.querySelector(`li[data-variant-id="${variantId}"]`);
  let controle = ligne === null ? null : ligne.querySelector(`[data-action="${action}"], [data-action="ajouter"]`);

  if (controle !== null && !controle.disabled) {
    controle.focus();
  } else if (ligne !== null) {
    let secours = ligne.querySelector("button:not(:disabled)");
    if (secours !== null) {
      secours.focus();
    }
  }
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
  pageFragment.querySelector('slot[name="detail"]').replaceWith(DetailProduitView.dom(
      etat.produit,
      { quantites: etat.quantites, quantiteMax: QUANTITE_MAX },
      { surAjout: C.handler_ajouterAuPanier, surQuantite: C.handler_changerQuantite },
    ));

  return pageFragment;
};

export function ProduitPage(params) {
  return C.init(params);
}

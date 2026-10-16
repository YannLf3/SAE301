import { PanierData, QUANTITE_MAX } from "../../data/panier.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { LignePanierView } from "../../ui/ligne-panier/index.js";
import { MessageView } from "../../ui/message/index.js";
import { PanierVideView } from "../../ui/panier-vide/index.js";
import { RecapitulatifPanierView } from "../../ui/recapitulatif-panier/index.js";
import template from "./template.html?raw";

/**
 * Page « Panier » (CMD-b) : /panier.
 *
 * Le panier vit dans le localStorage (voir data/panier.js). Après chaque
 * modification, la page est reconstruite depuis M. La validation de la
 * commande (CMD-a) n'existe pas encore : le bouton l'indique.
 */

let M = {
  lignes: [], // lignes du panier (voir data/panier.js)
  description: "", // texte sous le titre
  sousTotal: 0, // total TTC des lignes
  message: null, // { type, texte }, ou null
};

/**
 * > rien ; range le panier enregistré dans M.lignes
 */
M.load = function () {
  M.lignes = PanierData.lire();
  M.description = M.getDescription();
  M.sousTotal = PanierData.total(M.lignes);
};

/**
 * > nombre d'articles (somme des quantités)
 */
M.countArticles = function () {
  return M.lignes.reduce(function (somme, ligne) {
    return somme + ligne.quantite;
  }, 0);
};

/**
 * > texte « 2 articles · … » sous le titre
 */
M.getDescription = function () {
  let nombre = M.countArticles();

  if (nombre === 0) {
    return "Aucun article pour le moment.";
  }
  return `${nombre} ${nombre > 1 ? "articles" : "article"} · Un seul magasin de retrait pour votre commande.`;
};

let C = {};

/**
 * Applique une modification du panier puis rafraîchit la page. Un stockage
 * refusé est signalé à l'utilisateur.
 * . ecrit : résultat de la modification (true si elle a réussi)
 * . focus : { variantId, action } du bouton à refocaliser, ou null
 */
C.appliquer = function (ecrit, focus) {
  M.load();
  M.message = ecrit ? null : { type: "erreur", texte: "Le panier n'a pas pu être enregistré dans votre navigateur." };
  V.rafraichir(M);
  if (focus !== null) {
    V.focus(focus.variantId, focus.action);
  }
};

C.handler_changerQuantite = function (variantId, quantite, action) {
  C.appliquer(PanierData.changerQuantite(variantId, quantite), { variantId: variantId, action: action });
};

C.handler_supprimer = function (variantId) {
  C.appliquer(PanierData.supprimer(variantId), null);
};

C.handler_commander = function () {
  M.message = { type: "info", texte: "La validation de commande sera disponible prochainement." };
  V.rafraichir(M);
};

C.init = function () {
  // Le module est partagé entre les visites : on repart d'un état neuf.
  M.load();
  M.message = null;
  return V.init(M);
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
 * Redonne le focus au bouton utilisé, perdu par la reconstruction de la page.
 * . variantId : variante de la ligne
 * . action : "diminuer" ou "augmenter"
 */
V.focus = function (variantId, action) {
  let ligne = V.racine.querySelector(`li[data-variant-id="${variantId}"]`);
  let bouton = ligne === null ? null : ligne.querySelector(`[data-action="${action}"]`);

  if (bouton !== null && !bouton.disabled) {
    bouton.focus();
  } else if (ligne !== null) {
    ligne.querySelector('[data-action="supprimer"]').focus();
  }
};

V.createPageFragment = function (etat) {
  let page = htmlToFragment(genericRenderer(template, { description: etat.description }));

  page.querySelector('slot[name="message"]').replaceWith(MessageView.dom(etat.message));

  if (etat.lignes.length === 0) {
    page.querySelector('.grid').replaceWith(PanierVideView.dom());
    return page;
  }

  let callbacks = { surQuantite: C.handler_changerQuantite, surSupprimer: C.handler_supprimer };
  let items = etat.lignes.map(function (ligne) {
    return LignePanierView.dom(ligne, QUANTITE_MAX, callbacks);
  });
  let liste = htmlToFragment(
    `<section aria-labelledby="titre-articles" class="rounded-ui-12 border border-border-default bg-surface-card p-card-padding md:p-ui-24">
      <h2 id="titre-articles" class="mb-ui-16 text-heading-md font-medium text-text-primary">Vos articles</h2>
      <ul></ul>
    </section>`,
  );
  liste.querySelector("ul").append(...items);

  page.querySelector('slot[name="articles"]').replaceWith(liste);
  page.querySelector('slot[name="information"]').replaceWith(
    MessageView.dom({
      type: "info",
      texte: "Votre panier ne réserve pas encore le stock. La disponibilité et les prix seront vérifiés à la validation de la commande.",
    }),
  );
  page.querySelector('slot[name="recapitulatif"]').replaceWith(
    RecapitulatifPanierView.dom({ sousTotal: etat.sousTotal }, { surCommander: C.handler_commander }),
  );

  return page;
};

export function PanierPage() {
  return C.init();
}

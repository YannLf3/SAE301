import { AuthData } from "../../data/auth.js";
import { PanierData } from "../../data/panier.js";
import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { naviguer } from "../../lib/navigation.js";
import { FormulaireInscriptionView } from "../../ui/formulaire-inscription/index.js";
import { FormulaireSeConnecterView } from "../../ui/formulaire-se-connecter/index.js";
import { MessageView } from "../../ui/message/index.js";
import { OngletsAuthView } from "../../ui/onglets-auth/index.js";
import { ProgressionEtapesView } from "../../ui/progression-etapes/index.js";
import { RecapitulatifCommandeView } from "../../ui/recapitulatif-commande/index.js";
import template from "./template.html?raw";

/**
 * Page « Connexion / Création de compte » (CMD-c) : /connexion.
 *
 * Deux formulaires sur la même route, choisis par des onglets. Le serveur
 * valide tout et ouvre la session ; la page n'affiche que sa réponse. Le
 * panier vit dans le navigateur : il survit à la connexion et résume la
 * commande en cours.
 */

const MODES = ["connexion", "inscription"];
const MOT_DE_PASSE_MIN = 8;

let M = {
  mode: "connexion", // "connexion" ou "inscription"
  champs: { prenom: "", nom: "", email: "" }, // saisie conservée (jamais le mot de passe)
  lignes: [], // lignes du panier
  enCours: false, // true pendant l'appel au serveur
  message: null, // { type, texte }, ou null
};

/**
 * > rien ; repart d'un état neuf et relit le panier
 */
M.reset = function () {
  M.mode = "connexion";
  M.champs = { prenom: "", nom: "", email: "" };
  M.lignes = PanierData.lire();
  M.enCours = false;
  M.message = null;
};

/**
 * . mode : valeur demandée
 * > true si le mode existe (liste blanche) et a été appliqué
 */
M.setMode = function (mode) {
  if (!MODES.includes(mode)) {
    return false;
  }
  M.mode = mode;
  M.message = null;
  return true;
};

/**
 * > true si le panier contient au moins un article
 */
M.hasPanier = function () {
  return M.lignes.length > 0;
};

/**
 * > chemin où aller après la connexion : le panier s'il n'est pas vide
 */
M.getDestination = function () {
  return M.hasPanier() ? "/panier" : "/";
};

/**
 * > texte « 2 articles » (somme des quantités)
 */
M.getNombreArticles = function () {
  let nombre = M.lignes.reduce(function (somme, ligne) {
    return somme + ligne.quantite;
  }, 0);
  return `${nombre} ${nombre > 1 ? "articles" : "article"}`;
};

/**
 * > une ligne de texte par article du panier
 */
M.getLignesResume = function () {
  return M.lignes.map(function (ligne) {
    return `${ligne.nom} · ${ligne.option}`;
  });
};

/**
 * > total TTC du panier
 */
M.getTotal = function () {
  return PanierData.total(M.lignes);
};

/**
 * Contrôle de confort avant l'envoi : le serveur refait toutes les vérifications.
 * . donnees : { prenom, nom, email, mdp }
 * > message d'erreur, ou null si la saisie est acceptable
 */
M.validerInscription = function (donnees) {
  if (donnees.prenom === "" || donnees.nom === "") {
    return "Le prénom et le nom sont obligatoires.";
  }
  if (donnees.mdp.length < MOT_DE_PASSE_MIN) {
    return `Le mot de passe doit faire au moins ${MOT_DE_PASSE_MIN} caractères.`;
  }
  return null;
};

/**
 * . erreur : exception levée par AuthData
 * > texte à afficher ; une erreur sans statut HTTP est une panne réseau
 */
M.getTexteErreur = function (erreur) {
  if (typeof erreur.statut !== "number") {
    return "Le serveur est injoignable. Réessayez dans un instant.";
  }
  return erreur.message;
};

let C = {};

C.handler_changerMode = function (mode) {
  if (M.setMode(mode)) {
    V.rafraichir(M);
    V.focusOnglet(M.mode);
  }
};

/**
 * Exécute un appel d'authentification, puis redirige ou affiche l'erreur.
 * . appel : fonction qui retourne la promesse d'AuthData
 */
C.envoyer = async function (appel) {
  M.enCours = true;
  M.message = null;
  V.rafraichir(M);

  try {
    await appel();
  } catch (erreur) {
    M.enCours = false;
    M.message = { type: "erreur", texte: M.getTexteErreur(erreur) };
    V.rafraichir(M);
    return;
  }

  V.naviguer(M.getDestination());
};

C.handler_connexion = function (email, mdp) {
  M.champs.email = email;
  return C.envoyer(function () {
    return AuthData.login(email, mdp);
  });
};

C.handler_inscription = function (donnees) {
  M.champs = { prenom: donnees.prenom, nom: donnees.nom, email: donnees.email };

  let erreur = M.validerInscription(donnees);
  if (erreur !== null) {
    M.message = { type: "erreur", texte: erreur };
    V.rafraichir(M);
    return Promise.resolve();
  }

  return C.envoyer(function () {
    return AuthData.register(donnees);
  });
};

C.init = function () {
  // Le module est partagé entre les visites : on repart d'un état neuf.
  M.reset();
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
 * Redonne le focus à l'onglet utilisé, perdu par la reconstruction de la page.
 * . mode : onglet actif
 */
V.focusOnglet = function (mode) {
  let bouton = V.racine.querySelector(`button[data-mode="${mode}"]`);
  if (bouton !== null) {
    bouton.focus();
  }
};

/**
 * . chemin : chemin de route où aller
 */
V.naviguer = function (chemin) {
  naviguer(chemin);
};

/**
 * . etat : état de la page (voir M)
 * > fragment de la page complète
 */
V.createPageFragment = function (etat) {
  let connexion = etat.mode === "connexion";
  let avecPanier = connexion && etat.hasPanier();

  let page = htmlToFragment(
    genericRenderer(template, {
      titre: connexion ? "Connectez-vous pour continuer" : "Créez votre compte",
      description: connexion ? "Retrouvez votre commande et recevez les informations de retrait." : "",
      retour_href: avecPanier ? "/panier" : "/",
      retour_libelle: avecPanier ? "← Retour au panier" : "← Retour au site",
    }),
  );

  page.querySelector('slot[name="etapes"]').replaceWith(
    ProgressionEtapesView.dom({
      etapes: connexion ? ["Connexion", "Vérification", "Confirmation"] : ["Création", "Connexion"],
    }),
  );
  page.querySelector('slot[name="onglets"]').replaceWith(
    OngletsAuthView.dom({ mode: etat.mode }, { surMode: C.handler_changerMode }),
  );
  page.querySelector('slot[name="message"]').replaceWith(MessageView.dom(etat.message));

  let formulaire = connexion
    ? FormulaireSeConnecterView.dom(
        { email: etat.champs.email, enCours: etat.enCours },
        { surConnexion: C.handler_connexion },
      )
    : FormulaireInscriptionView.dom(
        {
          prenom: etat.champs.prenom,
          nom: etat.champs.nom,
          email: etat.champs.email,
          enCours: etat.enCours,
          motDePasseMin: MOT_DE_PASSE_MIN,
        },
        { surInscription: C.handler_inscription },
      );
  page.querySelector('slot[name="formulaire"]').replaceWith(formulaire);

  page.querySelector('slot[name="information"]').replaceWith(
    MessageView.dom(
      avecPanier
        ? { type: "info", texte: "Votre panier est conservé après connexion. Le stock n'est pas encore réservé." }
        : null,
    ),
  );

  let recapitulatif = page.querySelector('slot[name="recapitulatif"]');
  if (avecPanier) {
    recapitulatif.replaceWith(
      RecapitulatifCommandeView.dom({
        nombre: etat.getNombreArticles(),
        lignes: etat.getLignesResume(),
        total: etat.getTotal(),
      }),
    );
  } else {
    // Sans récapitulatif, le formulaire occupe toute la largeur (maquette).
    recapitulatif.remove();
    page.querySelector('[data-slot="grille"]').classList.remove("lg:grid-cols-[minmax(0,1fr)_24.375rem]");
  }

  return page;
};

export function ConnexionPage() {
  return C.init();
}

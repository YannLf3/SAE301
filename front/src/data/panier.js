/**
 * Le panier (CMD-b), conservé dans le localStorage du navigateur.
 *
 * Une ligne est identifiée par sa variante et fige le prix au moment de
 * l'ajout :
 * { variantId, produitSlug, nom, option, image_url, prix_unitaire, quantite }
 *
 * Le navigateur ne fait pas foi : CMD-a revérifiera variante, stock et prix
 * côté serveur à la validation de la commande. La limite de quantité par
 * ligne est provisoire, en attendant le stock réel (STK-b).
 */

const CLE = "panier";
const QUANTITE_MAX = 99;

let PanierData = {};

let abonnes = [];

/**
 * . ligne : valeur lue dans le stockage
 * > true si la ligne a la forme attendue (le stockage peut avoir été modifié)
 */
function estLigneValide(ligne) {
  return (
    ligne !== null &&
    typeof ligne === "object" &&
    Number.isInteger(ligne.variantId) &&
    typeof ligne.produitSlug === "string" &&
    typeof ligne.nom === "string" &&
    typeof ligne.option === "string" &&
    typeof ligne.image_url === "string" &&
    typeof ligne.prix_unitaire === "number" &&
    ligne.prix_unitaire >= 0 &&
    Number.isInteger(ligne.quantite) &&
    ligne.quantite >= 1 &&
    ligne.quantite <= QUANTITE_MAX
  );
}

/**
 * Le panier enregistré. Un stockage absent, inaccessible ou corrompu donne un
 * panier vide, sans erreur.
 * > [ { variantId, produitSlug, nom, option, image_url, prix_unitaire, quantite } ]
 */
PanierData.lire = function () {
  try {
    let valeur = JSON.parse(localStorage.getItem(CLE));
    return Array.isArray(valeur) ? valeur.filter(estLigneValide) : [];
  } catch (erreur) {
    return [];
  }
};

/**
 * Enregistre les lignes puis prévient les abonnés.
 * . lignes : le nouveau contenu du panier
 * > true si l'écriture a réussi, false si le stockage est refusé ou plein
 */
function ecrire(lignes) {
  try {
    localStorage.setItem(CLE, JSON.stringify(lignes));
  } catch (erreur) {
    return false;
  }

  for (let i = 0; i < abonnes.length; i++) {
    abonnes[i]();
  }
  return true;
}

/**
 * Ajoute une unité d'une variante ; si elle est déjà au panier, sa quantité
 * augmente et son prix figé d'origine est conservé.
 * . variante : { variantId, produitSlug, nom, option, image_url, prix_unitaire }
 * > true si l'ajout a eu lieu, false si le stockage est refusé ou la quantité
 *   maximale est atteinte
 */
PanierData.ajouter = function (variante) {
  let lignes = PanierData.lire();
  let index = lignes.findIndex(function (ligne) {
    return ligne.variantId === variante.variantId;
  });

  if (index === -1) {
    let nouvelle = { ...variante, quantite: 1 };
    if (!estLigneValide(nouvelle)) {
      return false;
    }
    lignes.push(nouvelle);
  } else {
    if (lignes[index].quantite >= QUANTITE_MAX) {
      return false;
    }
    lignes[index].quantite += 1;
  }

  return ecrire(lignes);
};

/**
 * Fixe la quantité d'une ligne, bornée entre 1 et la limite. Retirer une ligne
 * passe par supprimer().
 * . variantId : identifiant de la variante
 * . quantite : nouvelle quantité
 * > true si l'écriture a réussi
 */
PanierData.changerQuantite = function (variantId, quantite) {
  let lignes = PanierData.lire().map(function (ligne) {
    if (ligne.variantId !== variantId) {
      return ligne;
    }
    return { ...ligne, quantite: Math.min(QUANTITE_MAX, Math.max(1, quantite)) };
  });

  return ecrire(lignes);
};

/**
 * . variantId : identifiant de la variante à retirer
 * > true si l'écriture a réussi
 */
PanierData.supprimer = function (variantId) {
  return ecrire(
    PanierData.lire().filter(function (ligne) {
      return ligne.variantId !== variantId;
    }),
  );
};

/**
 * > nombre total d'articles (somme des quantités)
 */
PanierData.compter = function () {
  return PanierData.lire().reduce(function (somme, ligne) {
    return somme + ligne.quantite;
  }, 0);
};

/**
 * . lignes : lignes du panier
 * > total TTC, arrondi au centime
 */
PanierData.total = function (lignes) {
  let centimes = lignes.reduce(function (somme, ligne) {
    return somme + Math.round(ligne.prix_unitaire * 100) * ligne.quantite;
  }, 0);
  return centimes / 100;
};

/**
 * Enregistre une fonction appelée après chaque modification du panier.
 * . fonction : callback sans paramètre
 * > rien
 */
PanierData.abonner = function (fonction) {
  abonnes.push(fonction);
};

export { PanierData, QUANTITE_MAX };

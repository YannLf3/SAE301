import { getRequest, postRequest, ErreurApi } from "../lib/api-request.js";

let AuthData = {};

let abonnes = [];

/**
 * Prévient les abonnés que l'utilisateur connecté a changé.
 * . utilisateur : { id, email, nom, prenom, role }, ou null si déconnecté
 */
function notifier(utilisateur) {
  abonnes.map(function (fonction) {
    return fonction(utilisateur);
  });
}

/**
 * Connexion : POST /api/login
 * En cas de succès, le serveur ouvre une session ; le cookie PHPSESSID qu'il
 * renvoie accompagnera ensuite chaque requête.
 * . email : adresse e-mail du compte
 * . mdp : mot de passe saisi
 * > { connecte, utilisateur }
 */
AuthData.login = async function (email, mdp) {
  let reponse = await postRequest("login", { email, mdp });
  notifier(reponse.utilisateur);
  return reponse;
};

/**
 * Création de compte : POST /api/register (le serveur ouvre la session).
 * . donnees : { prenom, nom, email, mdp }
 * > { connecte, utilisateur }
 */
AuthData.register = async function (donnees) {
  let reponse = await postRequest("register", donnees);
  notifier(reponse.utilisateur);
  return reponse;
};

/**
 * Utilisateur de la session : GET /api/me
 * > { id, email, nom, prenom, role }, ou null si personne n'est connecté
 */
AuthData.me = async function () {
  try {
    let reponse = await getRequest("me");
    return reponse.utilisateur;
  } catch (erreur) {
    if (erreur instanceof ErreurApi && erreur.statut === 401) {
      return null;
    }
    throw erreur;
  }
};

/**
 * Déconnexion : POST /api/logout
 */
AuthData.logout = async function () {
  let reponse = await postRequest("logout");
  notifier(null);
  return reponse;
};

/**
 * . fonction : appelée avec l'utilisateur (ou null) à chaque changement
 */
AuthData.abonner = function (fonction) {
  abonnes.push(fonction);
};

export { AuthData };

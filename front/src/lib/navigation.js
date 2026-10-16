/**
 * Change de page depuis du code (après une connexion réussie, par exemple),
 * sans recharger le navigateur. Le routeur écoute « popstate » : on lui
 * signale le changement d'adresse comme pour un clic sur Précédent.
 *
 * . chemin : chemin de route, sans le chemin du projet (« /panier »)
 */
export function naviguer(chemin) {
  let base = import.meta.env.BASE_URL.replace(/\/$/, "");
  window.history.pushState(null, "", base + chemin);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

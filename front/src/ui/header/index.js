import { htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";

/**
 * Vue du composant Header (barre de navigation supérieure).
 * Composant de présentation : il affiche le logo, le lien catalogue, le
 * compte et le compteur du panier. Les catégories ne sont pas ici : elles
 * se choisissent avec les filtres de la page catalogue.
 */
let HeaderView = {
  /**
   * . data : { quantitePanier: number, utilisateur: { prenom: string }|null }
   * . callbacks : { surDeconnexion() }
   * > fragment contenant l'élément <header>
   */
  dom: function (data, callbacks) {
    let fragment = htmlToFragment(template);

    let lienPanier = fragment.querySelector('a[href="/panier"]');
    fragment.querySelector('[data-slot="cart-count"]').textContent = String(data.quantitePanier);
    lienPanier.setAttribute("aria-label", `Voir le panier, ${data.quantitePanier} article(s)`);

    if (data.utilisateur !== null) {
      let session = fragment.querySelector('[data-slot="session"]');
      // textContent : le prénom saisi par l'utilisateur n'est jamais du HTML.
      session.querySelector('[data-slot="prenom"]').textContent = data.utilisateur.prenom;
      session.classList.remove("hidden");
      session.classList.add("flex");
      fragment.querySelector('[data-slot="connexion"]').remove();
      session.querySelector('[data-action="deconnexion"]').addEventListener("click", callbacks.surDeconnexion);
    }

    return fragment;
  },
};

export { HeaderView };

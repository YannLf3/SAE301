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
   * . data : { quantitePanier: number }
   * > fragment contenant l'élément <header>
   */
  dom: function (data) {
    let fragment = htmlToFragment(template);

    let lienPanier = fragment.querySelector('a[href="/panier"]');
    fragment.querySelector('[data-slot="cart-count"]').textContent = String(data.quantitePanier);
    lienPanier.setAttribute("aria-label", `Voir le panier, ${data.quantitePanier} article(s)`);

    return fragment;
  },
};

export { HeaderView };

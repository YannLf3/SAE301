import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import templateLien from "./lien-categorie.html?raw";
import template from "./template.html?raw";

// Le router place aria-current="page" sur le lien de la page affichée.
const CLASSES_BUREAU =
  "block text-body text-text-primary transition-colors hover:text-text-brand focus-visible:outline-2 focus-visible:outline-border-focus aria-[current=page]:font-semibold aria-[current=page]:text-text-brand";
const CLASSES_MENU =
  "flex min-h-11 items-center rounded-ui-8 px-ui-8 text-body text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-border-focus aria-[current=page]:font-semibold aria-[current=page]:text-text-brand";

/**
 * Entrées de navigation à partir des catégories reçues. L'entrée « Tous les
 * produits » vient en dernier, comme dans la maquette ; tant que les effectifs
 * ne sont pas connus (chargement, erreur), elle seule est affichée.
 *
 * . data : { categories: [ { slug, nom, total } ], total: number | null }
 * . classes : classes des liens
 * > liste de fragments <li>
 */
function creerLiens(data, classes) {
  let entrees = data.categories.map(function (categorie) {
    return {
      href: `/categories/${encodeURIComponent(categorie.slug)}`,
      libelle: `${categorie.nom} (${categorie.total})`,
    };
  });

  entrees.push({
    href: "/",
    libelle: data.total === null ? "Tous les produits" : `Tous les produits (${data.total})`,
  });

  return entrees.map(function (entree) {
    return htmlToFragment(genericRenderer(templateLien, { ...entree, classes: classes }));
  });
}

/**
 * Vue du composant Header (barre de navigation supérieure).
 * Composant de présentation : il affiche les catégories reçues et gère
 * l'ouverture et la fermeture du menu mobile.
 */
let HeaderView = {
  /**
   * . data : { categories: [ { slug, nom, total } ], total: number | null }
   * > fragment contenant l'élément <header>
   */
  dom: function (data) {
    let fragment = htmlToFragment(template);

    fragment.querySelector('slot[name="categories"]').replaceWith(...creerLiens(data, CLASSES_BUREAU));
    fragment.querySelector('slot[name="categories-menu"]').replaceWith(...creerLiens(data, CLASSES_MENU));

    // Gestion de l'accordéon du menu mobile
    let toggleBtn = fragment.querySelector('[data-action="toggle-menu"]');
    let mobileNav = fragment.querySelector("#mobile-nav");

    toggleBtn.addEventListener("click", function () {
      let ouvert = !mobileNav.classList.contains("hidden");
      mobileNav.classList.toggle("hidden");
      toggleBtn.setAttribute("aria-expanded", String(!ouvert));
    });

    // Délégation d'événement sur l'ancêtre commun : ferme le menu si on clique sur un lien
    mobileNav.addEventListener("click", function (event) {
      if (event.target.closest("a[data-link]")) {
        mobileNav.classList.add("hidden");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    return fragment;
  },
};

export { HeaderView };

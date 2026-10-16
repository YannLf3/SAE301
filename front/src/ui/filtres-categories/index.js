import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import templatePastille from "./pastille.html?raw";

// Pastilles de filtre par catégorie. Ce sont de vrais liens : la catégorie
// choisie est dans l'adresse (/categories/drones), et le router signale la
// pastille active par aria-current="page". Le composant n'a donc aucun
// événement à gérer.
let FiltresCategoriesView = {
  /**
   * . data : { categories: [ { slug, nom, total } ], total: number }
   * > fragment de la barre de pastilles, « Tous les produits » en premier
   */
  dom: function (data) {
    let fragment = htmlToFragment(template);

    let entrees = [{ href: "/", libelle: `Tous les produits (${data.total})` }].concat(
      data.categories.map(function (categorie) {
        return {
          href: `/categories/${encodeURIComponent(categorie.slug)}`,
          libelle: `${categorie.nom} (${categorie.total})`,
        };
      }),
    );

    let pastilles = entrees.map(function (entree) {
      return htmlToFragment(genericRenderer(templatePastille, entree));
    });
    fragment.querySelector('slot[name="pastilles"]').replaceWith(...pastilles);

    return fragment;
  },
};

export { FiltresCategoriesView };

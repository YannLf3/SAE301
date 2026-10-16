import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import template from "./template.html?raw";
import item from "./item.html?raw";

// Classes écrites en entier pour que Tailwind les détecte.
const CLASSES = {
  actif: "border-text-primary font-medium text-text-primary",
  suivant: "border-border-default text-text-muted",
};

// Barre de progression d'un parcours : la première étape est l'étape courante.
let ProgressionEtapesView = {
  /**
   * . data : { etapes: string[] } libellés, dans l'ordre du parcours
   * > fragment de la barre de progression
   */
  dom: function (data) {
    let fragment = htmlToFragment(template);
    let liste = fragment.querySelector("ol");

    let items = data.etapes.map(function (libelle, index) {
      return htmlToFragment(
        genericRenderer(item, {
          numero: index + 1,
          libelle: libelle,
          classes: index === 0 ? CLASSES.actif : CLASSES.suivant,
          courant: index === 0 ? 'aria-current="step"' : "",
        }),
      );
    });
    liste.append(...items);

    return fragment;
  },
};

export { ProgressionEtapesView };

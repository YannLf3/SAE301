import { htmlToFragment } from "../../lib/utils.js";
import { basculerTheme } from "../../lib/theme.js";
import template from "./template.html?raw";

/**
 * Vue du composant Header (barre de navigation supérieure).
 * Composant de présentation : il gère ses interactions d'affichage
 * (ouverture/fermeture du menu mobile et bascule du thème).
 */
let HeaderView = {
  html: function () {
    return template;
  },

  dom: function () {
    let fragment = htmlToFragment(template);

    // Bouton de bascule de thème
    const themeBtn = fragment.querySelector('[data-action="theme"]');
    if (themeBtn) {
      themeBtn.addEventListener("click", basculerTheme);
    }

    // Gestion de l'accordéon du menu mobile
    const toggleBtn = fragment.querySelector('[data-action="toggle-menu"]');
    const mobileNav = fragment.querySelector("#mobile-nav");
    if (toggleBtn && mobileNav) {
      toggleBtn.addEventListener("click", function () {
        const isOpen = !mobileNav.classList.contains("hidden");
        mobileNav.classList.toggle("hidden");
        toggleBtn.setAttribute("aria-expanded", String(!isOpen));
      });

      // Délégation d'événement sur l'ancêtre commun : ferme le menu si on clique sur un lien
      mobileNav.addEventListener("click", function (event) {
        if (event.target.closest("a[data-link]")) {
          mobileNav.classList.add("hidden");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    return fragment;
  },
};

export { HeaderView };

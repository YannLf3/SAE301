import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { ChampMotDePasseView } from "../champ-mot-de-passe/index.js";
import template from "./template.html?raw";

// Formulaire de connexion client. Il ne décide de rien : il transmet les
// identifiants saisis, et c'est le serveur qui accepte ou refuse.
let FormulaireSeConnecterView = {
  /**
   * . data : { email: string, enCours: boolean } e-mail à pré-remplir, envoi en cours
   * . callbacks : { surConnexion(email, mdp) }
   * > fragment du formulaire
   */
  dom: function (data, callbacks) {
    let fragment = htmlToFragment(
      genericRenderer(template, {
        email: data.email,
        libelle_bouton: data.enCours ? "Connexion en cours…" : "Se connecter et continuer",
      }),
    );
    let formulaire = fragment.querySelector("form");

    fragment.querySelector('slot[name="mdp"]').replaceWith(
      ChampMotDePasseView.dom({
        id: "connexion-mdp",
        autocomplete: "current-password",
        minimum: 1,
        aide: "Afficher le mot de passe avec l'icône œil.",
      }),
    );

    if (data.enCours) {
      formulaire.setAttribute("aria-busy", "true");
      formulaire.querySelector('button[type="submit"]').disabled = true;
    }

    formulaire.addEventListener("submit", function (ev) {
      // Sans cela, le navigateur enverrait le formulaire de manière classique.
      ev.preventDefault();
      callbacks.surConnexion(formulaire.elements.email.value.trim(), formulaire.elements.mdp.value);
    });

    return fragment;
  },
};

export { FormulaireSeConnecterView };

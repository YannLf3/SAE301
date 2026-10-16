import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { ChampMotDePasseView } from "../champ-mot-de-passe/index.js";
import template from "./template.html?raw";

// Formulaire de création de compte. Le serveur valide les champs : les
// attributs HTML ne servent qu'à guider la saisie.
let FormulaireInscriptionView = {
  /**
   * . data : { prenom, nom, email, enCours, motDePasseMin } valeurs à pré-remplir,
   *          envoi en cours, longueur minimale du mot de passe
   * . callbacks : { surInscription({ prenom, nom, email, mdp }) }
   * > fragment du formulaire
   */
  dom: function (data, callbacks) {
    let fragment = htmlToFragment(
      genericRenderer(template, {
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        libelle_bouton: data.enCours ? "Création en cours…" : "Valider la création",
      }),
    );
    let formulaire = fragment.querySelector("form");

    fragment.querySelector('slot[name="mdp"]').replaceWith(
      ChampMotDePasseView.dom({
        id: "inscription-mdp",
        autocomplete: "new-password",
        minimum: data.motDePasseMin,
        aide: `${data.motDePasseMin} caractères minimum. Afficher le mot de passe avec l'icône œil.`,
      }),
    );

    if (data.enCours) {
      formulaire.setAttribute("aria-busy", "true");
      formulaire.querySelector('button[type="submit"]').disabled = true;
    }

    formulaire.addEventListener("submit", function (ev) {
      ev.preventDefault();
      callbacks.surInscription({
        prenom: formulaire.elements.prenom.value.trim(),
        nom: formulaire.elements.nom.value.trim(),
        email: formulaire.elements.email.value.trim(),
        mdp: formulaire.elements.mdp.value,
      });
    });

    return fragment;
  },
};

export { FormulaireInscriptionView };

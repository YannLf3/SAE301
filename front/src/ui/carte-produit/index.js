import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";

// Carte d'un produit, tel que le renvoie l'API :
// { slug, nom, image_url, categorie, prix_min, disponible }
let CarteProduitView = {
  html: function (produit) {
    // Les valeurs sont mises en forme avant d'être passées au template.
    return genericRenderer(template, {
      nom: produit.nom,
      slug: encodeURIComponent(produit.slug),
      categorie: produit.categorie,
      image: import.meta.env.BASE_URL + produit.image_url,
      prix: produit.prix_min === null ? "Prix indisponible" : `À partir de ${formaterPrix(produit.prix_min)}`,
      stock: produit.disponible ? "En stock" : "Rupture de stock",
    });
  },

  dom: function (produit) {
    let fragment = htmlToFragment(CarteProduitView.html(produit));
    let stock = fragment.querySelector('[data-role="stock"]');

    // Un template n'a pas de condition : la couleur du statut se règle ici.
    // Le texte porte aussi l'information, la couleur n'est qu'un renfort.
    stock.classList.add(produit.disponible ? "text-status-stock" : "text-status-danger-stock");

    return fragment;
  },
};

export { CarteProduitView };

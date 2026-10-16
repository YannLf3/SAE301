import { genericRenderer, htmlToFragment } from "../../lib/utils.js";
import { formaterPrix } from "../../lib/format.js";
import template from "./template.html?raw";

// Magasin de retrait : un seul pour l'instant, comme dans la maquette.
const MAGASIN = "Lyon République";

// Texte et couleur de chaque statut de stock. Les classes sont écrites en
// entier : Tailwind ne génère que celles qu'il trouve telles quelles. Le texte
// porte aussi l'information, la couleur n'est qu'un renfort.
const STATUTS_STOCK = {
  disponible: { texte: "En stock", retrait: `Retrait à ${MAGASIN}`, classes: "border-status-stock text-status-stock" },
  bientot_epuise: {
    texte: "Bientôt épuisé",
    retrait: `Dernières unités · ${MAGASIN}`,
    classes: "border-status-alerte-stock text-status-alerte-stock",
  },
  epuise: {
    texte: "Épuisé",
    retrait: `Indisponible · ${MAGASIN}`,
    classes: "border-status-danger-stock text-status-danger-stock",
  },
};

// Carte d'un produit, tel que le renvoie l'API :
// { slug, nom, image_url, categorie, resume_options, prix_min, statut_stock }
let CarteProduitView = {
  html: function (produit) {
    let statut = STATUTS_STOCK[produit.statut_stock] ?? STATUTS_STOCK.epuise;

    // Les valeurs sont mises en forme avant d'être passées au template.
    return genericRenderer(template, {
      nom: produit.nom,
      slug: encodeURIComponent(produit.slug),
      description: produit.resume_options === "" ? produit.categorie : `${produit.categorie} · ${produit.resume_options}`,
      image: import.meta.env.BASE_URL + produit.image_url,
      prix: produit.prix_min === null ? "Prix indisponible" : formaterPrix(produit.prix_min),
      stock: statut.texte,
      retrait: statut.retrait,
    });
  },

  dom: function (produit) {
    let fragment = htmlToFragment(CarteProduitView.html(produit));
    let statut = STATUTS_STOCK[produit.statut_stock] ?? STATUTS_STOCK.epuise;

    // Un template n'a pas de condition : la couleur du statut se règle ici.
    fragment.querySelector('[data-role="stock"]').classList.add(...statut.classes.split(" "));

    return fragment;
  },
};

export { CarteProduitView };

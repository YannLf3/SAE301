---
name: ajouter-page
description: "Ajoute une nouvelle page front dans front/src/pages avec son template HTML, son modèle, sa vue et son contrôleur MVC. Utiliser pour créer une route, une page catalogue, détail, administration, commande ou toute nouvelle vue navigable."
argument-hint: "Décrire la route, le contenu et les actions attendues de la page"
user-invocable: true
---

# Ajouter une page front

## Quand utiliser ce skill

Utiliser ce skill lorsqu'une nouvelle page doit être créée dans
`front/src/pages/`, avec une route client et éventuellement des composants
réutilisables. Ne pas l'utiliser pour modifier uniquement un composant UI ou un
module `data/`.

## Avant d'écrire

Accéder à mon fichier Figma pour vérifier le design et les interactions attendues. lien figma file : https://www.figma.com/design/5Ot7tScvEYz4YJ4SciXjQ5/LE-FLOHIC_Yann?node-id=18-2384&t=8avGZnMQjKYokH3Z-1 Ensuite, suivre ces étapes :

1. Lire `AGENTS.md` et `ARCHITECTURE.md` à la racine du dépôt.
2. Identifier l'US concernée dans `analyse-user-stories.md` si elle existe et
   vérifier l'ordre métier et les dépendances.
3. Lire les pages existantes, `front/src/main.js`, le routeur, le layout utilisé,
   les modules `front/src/data/` concernés, `front/src/lib/utils.js` et les
   composants UI réutilisables.
4. Présenter le découpage avant toute écriture lorsque le comportement ou le
   contrat de la page n'est pas entièrement explicite :
   - **M** : état, chargement des données et transformations ;
   - **V** : template, rendu DOM, accessibilité et branchement des événements ;
   - **C** : orchestration, handlers, navigation et gestion des erreurs.
5. M'expliquer clairement ton plan d'implémentation avant d'écrire le code.
6. Ne pas modifier le back-end, le SQL ou une dépendance sans demande
   explicite liée au contrat de la page.

## Structure à créer

Créer, sans déplacer les fichiers existants :

```text
front/src/pages/<nom-page>/
├── page.js
└── template.html
```

Le nom du dossier est en minuscules avec des tirets, comme les pages existantes.
Le module `page.js` exporte une fonction de page utilisée par le routeur.

## Implémentation obligatoire

### Modèle

- Conserver l'état de la page dans un objet `M` privé au module.
- Mettre dans `M` les données, appels aux modules `data/`, filtres,
  transformations et règles métier.
- Faire retourner des données par les fonctions de `M`, jamais du HTML.
- Ne jamais utiliser `document`, `window`, un élément DOM ou un événement dans
  `M`.
- Utiliser `async/await` et laisser les erreurs remonter vers le contrôleur.
- Documenter les fonctions avec leurs paramètres et leur valeur de retour,
  selon les conventions déjà présentes.

### Contrôleur

- Conserver un objet `C` privé au module.
- Faire de `C.init(params)` l'unique point d'entrée de la page.
- Initialiser l'état, appeler `V.init`, charger les données et déclencher le
  premier rafraîchissement.
- Nommer les handlers selon la convention existante, par exemple
  `C.handler_changerTri` ou `C.handler_valider`.
- Lire l'information d'un événement uniquement dans le handler qui le reçoit,
  puis interroger ou modifier `M` et appeler `V`.
- Ne pas stocker les données métier dans `C`.
- Passer les callbacks du contrôleur aux composants UI ; un composant ne doit
  pas connaître `M`.

### Vue

- Conserver un objet `V` privé au module.
- Garder tout accès au DOM, `querySelector`, template, `innerHTML`,
  `addEventListener` et `replaceWith` dans `V` ou dans un composant UI.
- Faire recevoir les données à `V.render...` ou `V.rafraichir` en paramètre ;
  la vue ne choisit pas les données.
- Construire l'affichage depuis l'état après une mutation importante plutôt que
  de disperser des mises à jour DOM.
- Utiliser `htmlToFragment`, `genericRenderer` et les composants existants.
- Échapper toute valeur injectée dans un placeholder. Ne jamais concaténer une
  valeur utilisateur dans du HTML.
- Prévoir les états concernés : chargement, succès, vide, erreur,
  authentification et stock indisponible.
- Prévoir les attributs d'accessibilité, les textes lisibles et les images avec
  `alt`, dimensions et chargement différé lorsque pertinent.

## Route et navigation

1. Ajouter l'import et la route dans `front/src/main.js`, en conservant le
   layout, `data-link`, `import.meta.env.BASE_URL` et la route 404.
2. Utiliser les paramètres fournis par le routeur sans reconstruire la base URL.
3. Vérifier qu'une navigation interne ne provoque pas de rechargement inutile.

## Contraintes du dépôt

- Utiliser des modules ES et les fonctions classiques `function` ; ne jamais
  utiliser de fonction fléchée.
- Ne jamais utiliser `foreach` ni `fn` PHP.
- Respecter les noms anglais des variables et méthodes ; les textes métier
  peuvent rester en français.
- Ne créer ni dépendance, ni couche, ni objet global pour contourner le MVC.
- Ne jamais faire confiance au front pour un prix, un rôle, une permission, une
  quantité, un stock ou un état de commande.
- Ne jamais commit ou push automatiquement.

## Validation

Après l'implémentation :

1. Relire `page.js`, `template.html`, les imports directs et la route ajoutée.
2. Depuis la racine, exécuter :

   ```bash
   node .agents/skills/verifier-mvc/scripts/check-mvc.js .
   ```

3. Depuis `front/`, exécuter `npm run build`.
4. Pour une vérification visuelle, lancer `npm run dev` depuis `front/` puis
   ouvrir `http://localhost:5174/~le-flohic4/SAE301/base/` et vérifier au minimum
   320/375 px, 768 px et 1440 px.
5. Signaler les fichiers contrôlés, la séparation M/V/C, les états traités, la
   route, le résultat du contrôle MVC et du build.

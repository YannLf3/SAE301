---
name: ajouter-composant
description: "Ajoute un composant UI réutilisable dans front/src/ui avec template HTML et index.js, en respectant le MVC, l'échappement, l'accessibilité et les conventions existantes. Utiliser pour créer une carte, un formulaire, un message, une grille ou tout composant présentatif."
argument-hint: "Décrire le composant, ses données d'entrée et ses callbacks"
user-invocable: true
---

# Ajouter un composant UI

## Quand utiliser ce skill

Utiliser ce skill lorsqu'un élément présentatif réutilisable doit être créé dans
`front/src/ui/`. Le composant reçoit ses données et ses callbacks depuis une
page ou un autre contrôleur ; il ne possède pas l'état global de l'application.

## Avant d'écrire

Accéder à mon fichier Figma pour vérifier le design et les interactions attendues. lien figma file : https://www.figma.com/design/5Ot7tScvEYz4YJ4SciXjQ5/LE-FLOHIC_Yann?node-id=18-2384&t=8avGZnMQjKYokH3Z-1 Ensuite, suivre ces étapes :

1. Lire `AGENTS.md` et `ARCHITECTURE.md`.
2. Lire deux composants proches dans `front/src/ui/`, leur `template.html`, les
   pages qui les utilisent, `front/src/lib/utils.js` et les tokens/classes
   existants dans `front/src/global.css`.
3. Définir explicitement :
   - les données simples ou objets reçus ;
   - les callbacks d'action reçus depuis le contrôleur ;
   - les états d'affichage et les slots éventuels ;
   - le contrat de sortie (`html` et/ou `dom`).
4. Vérifier qu'un composant existant ne peut pas être étendu ou réutilisé avant
   d'en créer un nouveau.
5. M'expliquer clairement ton plan d'implémentation avant d'écrire le code.
6. Demander une validation avant d'écrire si le comportement ou l'API du
   composant est ambigu.

## Structure à créer

Créer, sans déplacer les fichiers existants :

```text
front/src/ui/<nom-composant>/
├── index.js
└── template.html
```

Le nom du dossier est en minuscules avec des tirets. Ajouter seulement des
templates spécialisés supplémentaires lorsque le composant existant le
justifie, comme `variante.html`, `vide.html` ou `pastille.html`.

## Contrat et responsabilités

### Vue du composant

- Le module `index.js` est une vue présentative : il transforme les données
  reçues en HTML ou `DocumentFragment`.
- Utiliser `genericRenderer` pour remplacer les placeholders et
  `htmlToFragment` pour obtenir un fragment DOM.
- Échapper toutes les valeurs injectées ; ne jamais concaténer directement une
  valeur externe dans du HTML.
- Si une classe ou une variante dépend d'une donnée, utiliser une table de
  correspondance explicite et écrire toutes les classes Tailwind en entier pour
  que Tailwind les détecte.
- Utiliser `data-*` pour transmettre une information d'action au handler et
  déléguer les événements sur un ancêtre stable lorsque le contenu est recréé.
- Les écouteurs éventuels doivent appeler un callback fourni par le contrôleur ;
  ils ne doivent jamais contenir de logique métier.
- Ne pas référencer `M`, une page, l'API, `fetch`, `api-request.js`,
  `document` en dehors du rendu nécessaire, ni `window` pour gérer des données.
- Ne pas choisir quelle donnée afficher : le composant affiche exactement les
  données reçues.

### Template HTML

- Garder la structure et les classes dans `template.html`, pas dans une longue
  chaîne JavaScript.
- Prévoir une structure sémantique, le focus clavier, les labels associés et
  les messages accessibles.
- Ajouter `alt` aux images, des dimensions et `loading="lazy"` lorsque
  pertinent.
- Utiliser des `<slot>` lorsqu'un autre composant doit être inséré ; remplacer
  ensuite le slot avec `replaceWith` sur le fragment.
- Ne jamais utiliser une valeur utilisateur non échappée dans un attribut,
  notamment `href`, `src`, `alt`, `id` ou `aria-*`.

## Conventions JavaScript

- Utiliser des modules ES et des fonctions classiques `function`, jamais de
  fonction fléchée.
- Exporter un objet nommé de vue selon le domaine, par exemple
  `CarteProduitView`, `MessageView` ou `NouveauComposantView`.
- Préférer les méthodes `html(data)` et `dom(data, callbacks)` des composants
  existants ; documenter les fonctions publiques avec paramètres et valeur de
  retour.
- Utiliser les helpers et formats existants (`utils.js`, `format.js`) plutôt
  que les dupliquer.
- Ne jamais utiliser `foreach`, `fn`, un objet global ou une nouvelle
  dépendance.

## Utilisation depuis une page

1. Importer le composant dans la page concernée.
2. Construire ses données dans le modèle ou le contrôleur, jamais dans le
   composant.
3. Passer les callbacks du contrôleur au composant.
4. Insérer le fragment dans la vue de la page et reconstruire l'affichage après
   une mutation importante.
5. Ne pas ajouter d'appel API dans `front/src/ui/` : les appels passent par
   `front/src/data/` et `front/src/lib/api-request.js`.

## Validation

Après l'implémentation :

1. Relire `index.js`, `template.html`, la page appelante et les imports directs.
2. Vérifier que toutes les données injectées sont échappées et que le
   composant ne contient ni appel réseau ni règle métier.
3. Depuis la racine, exécuter :

   ```bash
   node .agents/skills/verifier-mvc/scripts/check-mvc.js .
   ```

4. Depuis `front/`, exécuter `npm run build`.
5. Pour une vérification visuelle, lancer `npm run dev` depuis `front/` puis
   ouvrir `http://localhost:5174/~le-flohic4/SAE301/base/` et vérifier au
   minimum 320/375 px, 768 px et 1440 px.
6. Rendre compte des fichiers créés ou modifiés, du contrat de données et
   callbacks, de l'accessibilité, du contrôle MVC et du build.

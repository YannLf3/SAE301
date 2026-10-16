# AGENTS.md — SAE301 Drone Click & Collect

## 0. Mission du projet

Ce dépôt est un projet full-stack de site web responsive de click & collect
de drones. Le code actuel est encore un catalogue de films pédagogique : il
sert de base technique, mais le produit cible est une boutique de drones,
d'accessoires et de variantes, inspirée du site [DJI France](https://www.dji.com/fr).

Le résultat attendu doit fonctionner sur mobile, tablette et desktop. Il doit
conserver les principes de navigation, d'accessibilité, de sécurité et de
séparation front/back existants, tout en remplaçant progressivement le domaine
film par le domaine produit drone.

Ne réorganise, ne renomme et ne déplace jamais un fichier existant sans demande
explicite. Respecte l'architecture présente avant de proposer une évolution.
Parcours l'intégralité du dépôt, y compris `front/`, `base/back/`, `sql/`, les
configurations et les sous-dossiers, avant une modification structurante.

## 1. Règles d'exécution impératives

- À chaque fois que je te demande d'implémenter quelque chose, va regarder dans .agents sur des skills sont utiles pour la création : 'ajouter-composant', 'ajouter-fonctionnalite-mvc', 'ajouter-page' et 'verifier-mvc'.

- Ne committe et ne pousse jamais automatiquement. Le commit, le push et toute
  action Git distante ne sont effectués que si l'utilisateur le demande
  explicitement.
- Ne crée pas de dépendance, bibliothèque ou outil de build supplémentaire sans
  justification et accord lorsque l'impact est significatif.
- Ne modifie pas des secrets ou identifiants réels. Les valeurs sensibles
  restent dans la configuration locale et ne doivent jamais être ajoutées au
  dépôt.
- Avant une modification importante, lis les fichiers concernés et leurs
  appelants. Propose moi toujours un plan d'implémentation. Après modification, valide le comportement avec les commandes
  adaptées.
- Si deux architectures sont raisonnables et que le choix change fortement le
  code, arrête-toi et demande une décision.
- Les commentaires expliquent uniquement l'intention d'un choix non évident.
  Toute fonction, méthode ou classe publique doit être documentée en JSDoc ou
  PHPDoc.
- JAMAIS DE foreach.
- JAMAIS DE fn en php toujours des function classiques simples.
- JAMAIS de fonctions fléchées (`=>`) en JavaScript : toujours des `function` classiques.
- Les noms de méthodes et variables sont en anglais dans le code ; les données
  et commentaires pédagogiques peuvent rester en français comme dans
  l'existant.
- Pour chaque test que tu veux faire ou choses que tu veux vérifier : "cd front/ puis npm run dev puis ouverture du lien 'http://localhost:5175/~le-flohic4/SAE301/base/' grâce à la config vite.config.js tout fonctionne sur ce lien

## 2. Architecture actuelle à respecter

| Zone        | Rôle                                                                         | Emplacement      |
| ----------- | ---------------------------------------------------------------------------- | ---------------- |
| Front       | SPA Vite, Tailwind CSS 4, routeur client, pages et composants                | `front/`         |
| Back        | API JSON PHP, routage, contrôleurs et accès PDO/MySQL                        | `base/back/`     |
| Données     | Schéma et seeds SQL, à faire évoluer vers produits/variantes/stock/commandes | `sql/`           |
| Entrée HTTP | Réécriture `/api/...` vers PHP et du reste vers `front/dist/`                | `base/.htaccess` |

Le front conserve le découpage `layouts/`, `pages/`, `ui/`, `data/` et `lib/`.
Le back conserve `Core/`, `Controller/`, `Model/`, `routes.php` et son point
d'entrée `base/back/index.php`. Ne crée pas une nouvelle couche ou un nouveau
framework seulement pour contourner cette structure.

Respect stricte de l'architecture obligatoire décrite dans ce fichier que tu liras : ARCHITECTURE.md

## 3. MVC strict

Pour chaque page dynamique, respecter strictement :

- **M — Modèle** : état de la page, données reçues, appels et transformations
  métier. Il ne référence jamais la Vue et ne touche jamais au DOM.
- **V — Vue** : templates, rendu, accès DOM et déclaration des événements. Elle
  reçoit les données en paramètre et ne référence jamais le Modèle.
- **C — Contrôleur** : orchestre M et V, charge les données, valide les actions
  et contient les handlers. C est le seul objet qui référence M et V.

En JavaScript vanilla, `C.init()` est appelé après toutes les déclarations
comme point d'entrée de la page. Dans le front modulaire actuel, la fonction de
page peut retourner `C.init()` au routeur, mais la séparation M/C/V reste
obligatoire.

Lorsqu'une fonctionnalité est ajoutée, la découper ainsi :

1. donnée, règle ou calcul → M ;
2. affichage, template ou écouteur → V ;
3. réaction à l'action → C.

Un composant UI ne décide pas de la donnée à afficher : il reçoit ses données
et signale l'action via des callbacks. Une page est reconstruite depuis son
état après une mutation importante ; évite les modifications DOM dispersées.

**Toute modification ou ajout respecte strictement ce découpage.** En cas de doute
sur l'emplacement d'une fonction, s'arrêter et demander plutôt que de mélanger les rôles.

```
data (M) ----get----
                    |
                 C (Contrôleur) ------> page web
                    |
template (V) --get--
```

Le MVC est à respecter strictement y compris dans la création des pages dans chaque fichier Javascript de chaque page.

### M — le Modèle : les données et leur manipulation

- Contient les données de l'application (`M.xxx`) et les fonctions qui les lisent,
  filtrent ou transforment (`M.xxx(xx)`).
- Ses fonctions reçoivent des valeurs simples en paramètre et **retournent des données**
  (tableaux, objets), jamais du HTML.
- **Interdit :** toute référence à `V`, tout accès au DOM (`document`, `window`, éléments HTML,
  événements).
- Autorisé : appeler `C` si besoin.

### V — la Vue : la page web

- Seul endroit où l'on touche au DOM : `document.querySelector`, lecture des `<template>`,
  `innerHTML`, `addEventListener`.
- `V.formatOne...(valeur)` remplit un template (`{{nom}}` → valeur) et retourne une chaîne.
- `V.render...(data)` reçoit les données **en paramètre** et les affiche ; elle ne décide
  pas quelles données afficher.
- `V.init()` enregistre les événements à surveiller et leur associe un gestionnaire de `C`.
- **Interdit :** toute référence à `M`, toute logique métier (filtrer, trier, calculer sur les
  données), tout gestionnaire d'événement qui ne soit pas une méthode de `C`.

### C — le Contrôleur : le lien entre M et V

- `C.init()` lance l'application : initialise la Vue (et le Modèle s'il en a besoin), puis fait
  le premier affichage. L'appel `C.init();` en dernière ligne est l'unique point d'entrée.
- `C.handler_<action>(ev)` gère un événement : lit l'information utile dans `ev`
  (ex. `ev.target.dataset.filter`), interroge ou met à jour `M`, puis appelle `V` pour
  rafraîchir l'affichage.
- C est le seul objet autorisé à référencer à la fois `M` et `V`.
- **Interdit :** accéder au DOM autrement que par l'objet `ev` reçu ; stocker les données de
  l'application (elles vont dans `M`).

### Conventions à suivre

- Une fonction par propriété : `M.xxx = function(...) { ... }`, précédée d'un commentaire
  qui donne ses paramètres (`. paramètre ...`) et sa valeur de retour (`> valeur de retour ...`),
  comme dans le code existant.
- Noms : `M.filter...`, `V.formatOne...`, `V.render...`, `V.init`, `C.init`, `C.handler_clickOn...`.
- Un nouveau besoin se découpe toujours ainsi : donnée ou calcul → M ; affichage ou
  événement → V ; réaction à l'événement → C.

## 4. Front-end JavaScript

- Utilise ES modules et les conventions déjà présentes dans `front/src/`.
- Privilégie la délégation d'événements sur un ancêtre commun lorsque des
  éléments sont recréés dynamiquement.
- Toutes les données injectées dans un placeholder doivent être échappées.
  N'utilise `innerHTML` brut que via les helpers existants et jamais avec une
  valeur utilisateur non échappée.
- Les appels réseau passent par `front/src/data/` et
  `front/src/lib/api-request.js`, avec `async/await`, gestion explicite des
  erreurs et des statuts HTTP.
- Le routeur doit conserver les liens `data-link`, le `basename` Vite et la
  page 404.
- Les états loading, vide, erreur, succès, authentification et indisponibilité
  du stock doivent être visibles et accessibles.

## 5. Design responsive et direction artistique

Le site cible reprend les principes visuels observables sur DJI France mais en gardant sa touche personnelle :

lien vers ma maquette figma : https://www.figma.com/design/5Ot7tScvEYz4YJ4SciXjQ5/LE-FLOHIC_Yann?node-id=18-2384&t=8avGZnMQjKYokH3Z-1

- interface premium, sobre et orientée produit ;
- navigation claire, barre supérieure compacte, menus utilisables au clavier ;
- grands visuels de drones, hero éditorial, cartes produit nettes et espaces
  généreux ;
- palette principalement blanc/noir/gris, avec une couleur d'accent contrôlée
  par le design system ;
- typographie lisible, contrastes conformes à l'accessibilité, animations
  discrètes et utiles ;
- grilles et composants Mobile First : une colonne mobile, composition
  intermédiaire tablette, grille et navigation étendues desktop ;
- aucune largeur, image ou interaction ne doit casser entre 320 px et desktop ;
- les images doivent prévoir `alt`, ratio, lazy-loading lorsque pertinent et
  état de chargement.

Il doit se différencier du site de base de DJI.

Le responsive est une contrainte fonctionnelle, pas une finition. Vérifie au
minimum les vues à 320/375 px, 768 px et 1440 px lorsque l'UI est modifiée.
Utilise Tailwind en Mobile First et garde les classes écrites en entier pour
que le compilateur les détecte.

### CSS, Tailwind et Sass

- Le projet actuel utilise Tailwind CSS 4 via `@tailwindcss/vite`.
- Configure les tokens dans `@theme inline`, en séparant tokens primitifs et
  tokens sémantiques.
- Utilise des variables CSS privées de composant (`--_bg`, `--_fg`, etc.) ;
  les modifiers ne font que réassigner les variables.
- Ne pas introduire Sass ou CSS basique on reste sur Tailwind V4.
- Architecture Tailwind v4 à respecter (c'est un exemple): @import "tailwindcss";

@theme inline {
--color-....: var(--clr-....);
}

@layer base {
:root {
/_Token primitives (couleurs de base) _/
--clr-indigo-600: oklch(51.1% 0.262 276.966);

    /*Token semantic (il dit à quoi li va servir)*/
    --clr-card-background: var(--clr-indigo-600);

}
}

.bouton--white {
--clr-text-btn: var(--clr-indigo-600);
}

## 6. Back-end PHP

- `declare(strict_types=1)` dans chaque fichier PHP.
- Conserve `base/back/index.php` comme point d'entrée unique : autoload,
  configuration, connexion, session, contrôleurs et routeur.
- Les contrôleurs valident la requête et orchestrent ; les modèles interrogent
  la base ; `Core/` contient les abstractions HTTP, DB et routage.
- Type toutes les propriétés, paramètres et valeurs de retour.
- Encapsule l'état avec `private`/`protected`, getters/setters validants et
  fluent setters uniquement lorsqu'ils correspondent au besoin.
- Préfère abstraction et polymorphisme pour les comportements réellement
  partagés.
- N'utilise jamais `foreach` ; utilise `for`, `while`, `array_map` ou un autre
  itérateur explicite.
- Ne renvoie jamais de HTML depuis l'API : les réponses restent JSON via
  `Response::json()` ou `Response::erreur()`.

## 7. Données, commandes et sécurité

Le futur modèle métier doit préserver les décisions déjà documentées dans
`analyse-user-stories.md` :

- une variante par produit au minimum, avec stock porté par la variante ;
- panier et lignes de commande identifiés par `variantId`, avec option choisie
  et prix unitaire figé ;
- validation de commande dans une transaction SQL dès la première version ;
- décrément et journal du stock à la validation, recrédit lors de l'annulation ;
- authentification par session serveur et rôle non fiable côté client ;
- seeds disponibles dès le début pour débloquer les écrans de lecture.

Règles obligatoires :

- requêtes PDO préparées pour les valeurs ;
- liste blanche serveur pour tout identifiant SQL dynamique (`ORDER BY`,
  colonnes, filtres structurants) ;
- `session_start()` une seule fois, après configuration du cookie (`Path`,
  `HttpOnly`, `Secure`, `SameSite`) et avant toute sortie ;
- `session_regenerate_id(true)` après connexion réussie ou élévation de
  privilège ;
- aucun rôle, droit, prix ou état de commande de confiance dans un cookie ;
- réponses JSON centralisées avec code HTTP explicite et terminaison via `exit` ;
- validation serveur de toute quantité, variante, disponibilité, prix et état
  de commande ; le front ne fait jamais foi ;
- les écritures de commande et de stock sont atomiques, idempotentes lorsque
  nécessaire et protégées contre la survente.

## 8. Ordre de réalisation métier

Respecte l'ordre de `analyse-user-stories.md` sauf décision explicite :

1. Fondations : dépôt, schéma complet, variantes, stock, commandes, seeds,
   layout et tokens ;
2. `DEC-b` catalogue ;
3. `DEC-c` détail produit ;
4. `DEC-a` catégories ;
5. `CMD-c` authentification ;
6. `CMD-b` panier ;
7. `CMD-a` validation de commande — jalon 1 ;
8. `GOF-b` back-office ;
9. `STK-b` affichage stock ;
10. `STK-a` décrément et journal ;
11. `STK-c` contraintes de stock ;
12. `PIL-b` gestion des commandes ;
13. `STK-a` recrédit à l'annulation — jalon 2 ;
14. `OPT-c`, puis `OPT-b`, puis `OPT-a` — jalon 3 ;
15. `SUI-b`, `SUI-c`, puis `SUI-a` ;
16. `GOF-a`, puis `GOF-c` — jalon 4 ;
17. `PIL-a` statistiques — jalon 5 ;
18. `PRO-a/b/c` uniquement en bonus, après stabilisation.

Ne commence pas une US si ses dépendances du tableau source ne sont pas
terminées, sauf demande explicite. Pour chaque US, conserve la traçabilité
entre interface, API, modèle SQL, critères d'acceptation et validation. Ne code pas sans mon accord et mes demandes. Je te demande de coder des fonctions ou fonctionnalités par si par là, pas de tout faire à ma place.

## 9. Vérification obligatoire

Toujours à la fin de chaque requête, vérifier le découpage : `node .agents/skills/verifier-mvc/scripts/check-mvc.js .`

## 10. Documentation et compte rendu

Toute documentation générée doit être pédagogique : sections numérotées,
tableaux récapitulatifs, check-lists et diagnostic

## 11. Après chaque modifications

Fournis un résumé clair et epxliqué avec :

1. la liste des fichier modifiés, créés ou supprimés avec leur chemin d'accès
2. le détail des modifications apportées avec les lignes
3. les éventuels points d'attention et/ou étapes suivantes recommandées en respectant toujours l'ordre qui doit être suivi
4. les éventuels impacts sur le reste de l'application

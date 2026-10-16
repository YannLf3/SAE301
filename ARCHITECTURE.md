# SAE301 — Organisation et fonctionnement de l'application

## 1. Présentation générale

SAE301 est un prototype full-stack de site de click & collect. Le code
fonctionnel actuel repose encore sur un catalogue de films pédagogique, mais
l'architecture est destinée à accueillir progressivement un catalogue de
drones, d'accessoires et de variantes.

L'application est composée de trois parties principales :

| Partie | Rôle | Emplacement |
|---|---|---|
| Front-end | Application web monopage, affichage, navigation et interactions | [`front/`](./front/) |
| Back-end | API PHP JSON, authentification, catalogue et statistiques | [`base/back/`](./base/back/) |
| Données | Schéma et données initiales de la base | [`sql/`](./sql/) |

Le projet n'utilise pas de framework applicatif. Le front est construit avec
Vite, JavaScript en modules ES et Tailwind CSS 4. Le back-end utilise PHP,
PDO et une organisation en couches `Core`, `Controller` et `Model`.

## 2. Organisation globale du dépôt

```text
SAE301/
├── AGENTS.md                 règles générales pour les modifications
├── .agents/                  règles et skills de développement
├── base/
│   ├── .htaccess             point d'entrée HTTP déployé
│   └── back/
│       ├── index.php         point d'entrée unique de l'API
│       ├── config/           configuration PHP et protection des fichiers
│       └── src/
│           ├── Core/         requête, réponse, routeur et base de données
│           ├── Controller/   orchestration des cas d'utilisation
│           ├── Model/        accès et transformations des données
│           └── routes.php    déclaration des routes API
├── front/
│   ├── index.html            document HTML initial
│   ├── vite.config.js        base URL, proxy API et configuration Vite
│   ├── package.json          scripts et dépendances front
│   └── src/                  code source de l'application web
└── sql/
    ├── schema.sql            schéma complet (produits, variantes, commandes, stock)
    └── seeds.sql             données initiales
```

Le déplacement du back-end dans `base/back/` est important : les règles de
réécriture et l'autoload PHP utilisent ce chemin. Il ne faut pas recréer un
répertoire `back/` à la racine pour ajouter une fonctionnalité.

## 3. Fonctionnement d'une requête

### 3.1 En production

Le fichier [`base/.htaccess`](./base/.htaccess) sert de point d'aiguillage :

1. une URL commençant par `/api/` est réécrite vers
   [`base/back/index.php`](./base/back/index.php) ;
2. les fichiers compilés du front sont servis depuis `front/dist/` ;
3. une route front qui ne correspond pas à un fichier réel reçoit
   `front/dist/index.html`, afin que le routeur JavaScript puisse afficher la
   page demandée ;
4. les autres fichiers internes, comme `front/src/` ou la configuration PHP,
   ne sont pas exposés directement.

Le back-end renvoie uniquement des réponses JSON. Il ne génère pas de HTML.

### 3.2 Au démarrage du back-end

[`base/back/index.php`](./base/back/index.php) :

1. active le typage strict ;
2. enregistre l'autoload des classes `App\` depuis `base/back/src/` ;
3. charge la configuration de [`config.php`](./base/back/config/config.php) ;
4. ouvre la connexion PDO à MySQL ;
5. instancie les modèles et contrôleurs ;
6. charge les routes depuis [`routes.php`](./base/back/src/routes.php) ;
7. configure une seule fois le cookie de session et démarre la session ;
8. transmet la requête au routeur.

Le routeur compare la méthode HTTP et le chemin reçus avec la table des routes,
puis appelle la méthode du contrôleur correspondant.

### 3.3 Au démarrage du front

Le fichier [`front/src/main.js`](./front/src/main.js) est le point d'entrée
JavaScript :

1. il crée un routeur avec `import.meta.env.BASE_URL` comme base ;
2. il associe le layout principal à toutes les routes ;
3. il déclare la page catalogue sur `/` ;
4. il déclare la page administration sur `/admin` ;
5. il déclare la page 404 avec `*` en dernier ;
6. il lance le routeur.

Une navigation interne ne recharge pas la page. Le routeur intercepte les liens
portant `data-link`, modifie l'historique avec `pushState`, puis rend la page
associée à la nouvelle URL.

## 4. Organisation de `front/src/`

Le front est séparé en quatre familles principales : `pages`, `ui`, `data` et
`lib`. Cette organisation applique une séparation MVC adaptée à JavaScript
modulaire.

```text
front/src/
├── main.js
├── global.css
├── layouts/
│   └── root/
├── pages/
│   ├── 404/
│   ├── catalogue/
│   └── admin/
├── ui/
│   ├── header/
│   ├── barre-outils/
│   ├── carte-produit/
│   ├── grille-produits/
│   ├── formulaire-connexion/
│   ├── message/
│   └── statistiques/
├── data/
│   ├── categorie.js
│   ├── produit.js
│   ├── auth.js
│   └── stats.js
└── lib/
    ├── api-request.js
    ├── format.js
    ├── router.js
    ├── theme.js
    └── utils.js
```

### 4.1 `main.js`

[`main.js`](./front/src/main.js) assemble les routes et le layout, mais ne
contient pas le rendu détaillé des pages. Il sert de bootstrap de l'application.

Les routes actuellement disponibles sont :

| Route front | Page |
|---|---|
| `/` | catalogue de produits (tous) |
| `/categories/:slug` | catalogue filtré par catégorie (DEC-a) |
| `/produits/:slug` | fiche produit (DEC-c) |
| `/admin` | connexion et statistiques d'administration |
| toute route inconnue | page 404 |

### 4.2 `layouts/`

Un layout définit une structure commune à plusieurs pages. Le layout
[`root/layout.js`](./front/src/layouts/root/layout.js) :

- charge son template HTML ;
- insère le composant d'en-tête ;
- conserve un `<slot>` sans nom pour recevoir la page courante.

Le layout ne charge pas lui-même les données métier d'une page.

### 4.3 `pages/`

Chaque page dynamique regroupe son modèle, son contrôleur et sa vue dans un
module de page. Cette proximité facilite le suivi d'une route tout en
conservant les responsabilités séparées.

#### Page catalogue

[`pages/catalogue/page.js`](./front/src/pages/catalogue/page.js) :

- **Modèle (`M`)** : mémorise l'état de la page (chargement, prêt, erreur), la
  réponse du catalogue et le message courant ;
- **Contrôleur (`C`)** : charge tous les produits et modifie le tri ;
- **Vue (`V`)** : compose la barre d'outils, la grille et les messages à partir
  de l'état reçu en paramètre.

Après une action importante, la page est reconstruite depuis l'état du modèle.
Cela évite de disperser des modifications DOM dans les gestionnaires
d'événements.

#### Page administration

[`pages/admin/page.js`](./front/src/pages/admin/page.js) :

- charge les statistiques auprès du serveur ;
- affiche le formulaire de connexion ;
- traite la connexion et la déconnexion ;
- distingue les erreurs `401` (non connecté) et `403` (accès refusé) ;
- affiche les statistiques uniquement lorsque le serveur les renvoie.

La page ne considère pas le rôle présent dans le navigateur comme une preuve de
droit : l'autorisation est décidée par l'API.

#### Page 404

[`pages/404/`](./front/src/pages/404/) contient le template et le rendu de la
page affichée lorsqu'aucune route ne correspond.

### 4.4 `ui/`

Les dossiers de [`front/src/ui/`](./front/src/ui/) contiennent des composants
présentatifs réutilisables. En général, chaque composant possède :

- un `template.html` pour sa structure et ses classes Tailwind ;
- un `index.js` pour produire une chaîne HTML ou un `DocumentFragment`.

Les composants actuellement présents sont :

| Composant | Fonction |
|---|---|
| `header` | navigation, lien vers l'administration et changement de thème |
| `barre-outils` | sélection du tri (nom, prix croissant, prix décroissant) |
| `carte-produit` | affichage d'un produit : image, catégorie, nom, prix, stock |
| `grille-produits` | composition des cartes du catalogue, ou état vide |
| `formulaire-connexion` | saisie et envoi des identifiants |
| `message` | états de succès, d'erreur ou d'information |
| `statistiques` | synthèse des statistiques et répartition par genre |

Un composant UI reçoit ses données et ses callbacks depuis la page. Il ne doit
pas appeler directement l'API, choisir une route métier ou posséder l'état
global du catalogue.

### 4.5 `data/`

Les modules de [`front/src/data/`](./front/src/data/) sont la couche modèle
orientée API. Ils ne touchent pas au DOM.

| Module | Appels actuels |
|---|---|
| [`categorie.js`](./front/src/data/categorie.js) | `GET /api/categories` (catégories et effectifs) |
| [`produit.js`](./front/src/data/produit.js) | `GET /api/produits` avec tri et catégorie facultatifs, `GET /api/produit` |
| [`auth.js`](./front/src/data/auth.js) | `POST /api/login` et `POST /api/logout` |
| [`stats.js`](./front/src/data/stats.js) | `GET /api/admin/stats` |

Les modules `data/` délèguent l'appel HTTP à
[`lib/api-request.js`](./front/src/lib/api-request.js). La page reçoit les
résultats ou les erreurs et décide de l'affichage à produire.

### 4.6 `lib/`

Les modules de [`front/src/lib/`](./front/src/lib/) fournissent les fonctions
techniques partagées :

| Module | Responsabilité |
|---|---|
| `router.js` | routes, layouts, navigation sans rechargement, paramètres et 404 |
| `api-request.js` | requêtes HTTP JSON et erreurs contenant le statut HTTP |
| `utils.js` | échappement HTML, rendu de placeholders et conversion en fragment |
| `format.js` | formatage des prix en euros, et des durées et notes (statistiques) |
| `theme.js` | bascule clair/sombre et sauvegarde dans `localStorage` |

`utils.js` joue un rôle de sécurité important : les valeurs remplacées dans
`{{placeholders}}` sont échappées avant insertion dans un template. Pour insérer
un composant ou un élément calculé, le code utilise plutôt un `<slot>` et
`replaceWith`.

### 4.7 `global.css`

[`global.css`](./front/src/global.css) importe Tailwind CSS 4 et définit :

- la variante sombre activée par `.theme-dark` ;
- les utilitaires visuels utilisés par les cartes ;
- la gestion du contraste et de la couleur des contrôles natifs ;
- un anneau de focus visible au clavier ;
- le curseur des boutons activés.

Le thème sombre est conservé côté navigateur dans `localStorage`. Il ne dépend
pas de la session PHP.

## 5. Flux principaux du front

### 5.1 Chargement du catalogue

```text
Route /
  -> CataloguePage
  -> ProduitData.fetchAll()
  -> lib/api-request.js
  -> GET /api/produits
  -> modèle de la page
  -> barre d'outils + grille de produits
```

Le serveur renvoie tous les produits, le tri effectivement appliqué et leur
nombre total. Chaque produit porte son prix « à partir de » (variante la moins
chère) et son stock cumulé. Le front utilise cette réponse pour reconstruire
l'affichage ; pendant l'attente, la page affiche un état de chargement.

### 5.2 Connexion et statistiques

```text
Route /admin
  -> AdminPage
  -> StatsData.fetch()
  -> GET /api/admin/stats
  -> statistiques ou message 401/403

Formulaire
  -> AuthData.login()
  -> POST /api/login
  -> cookie de session HTTP
  -> nouvelle demande des statistiques
```

Le cookie de session est géré par le serveur. Le front ne doit pas stocker ou
déduire lui-même un rôle d'administration.

## 6. API et données actuellement présentes

Les routes API déclarées dans
[`base/back/src/routes.php`](./base/back/src/routes.php) sont :

| Méthode | Route | Contrôleur |
|---|---|---|
| `GET` | `/api/produits` | `CatalogueController` |
| `GET` | `/api/categories` | `CategorieController` |
| `POST` | `/api/login` | `AuthController` |
| `POST` | `/api/logout` | `AuthController` |
| `GET` | `/api/admin/stats` | `StatsController` |

Le catalogue utilise `ProduitModel` (produits, catégories, variantes). Seules
les statistiques d'administration s'appuient encore sur `FilmModel`, à remplacer
avec `GOF-b` / `PIL-a`. Les évolutions vers les paniers et commandes devront
modifier de façon coordonnée le SQL, les modèles, les contrôleurs, les routes,
les modules `data/` et les pages concernées.

## 7. Développement et déploiement

### 7.1 Développement local du front

Depuis [`front/`](./front/) :

```bash
npm install
npm run dev
```

Vite utilise par défaut le port `5173` et le chemin de base configuré dans
[`vite.config.js`](./front/vite.config.js) :

```text
/~le-flohic4/SAE301/base/
```

Le proxy Vite relaie les requêtes vers `https://mmi.unilim.fr` sous le même
chemin de base, notamment `/api/`. La valeur `BASE` du front doit rester
cohérente avec `chemin` dans
[`base/back/config/config.php`](./base/back/config/config.php).

### 7.2 Compilation

```bash
cd front
npm run build
```

La compilation produit les fichiers statiques dans `front/dist/`. Ce dossier
est ensuite servi par le serveur web via `base/.htaccess`.

### 7.3 Vérifications

Avant de considérer une modification front terminée :

- [ ] les appels API sont dans `front/src/data/` ou passent par
      `front/src/lib/api-request.js` ;
- [ ] les composants `ui/` ne chargent pas l'API et ne portent pas de logique
      métier ;
- [ ] les données injectées dans un template sont échappées ;
- [ ] les états de chargement, vide, erreur et succès sont traités lorsqu'ils
      sont concernés ;
- [ ] la navigation conserve `data-link`, la base Vite et la page 404 ;
- [ ] `node .agents/skills/verifier-mvc/scripts/check-mvc.js .` passe ;
- [ ] `npm run build` passe depuis `front/`.

## 8. Diagnostic rapide

| Symptôme | Vérifications à effectuer |
|---|---|
| Page blanche ou assets en 404 | vérifier `base` dans `vite.config.js` et relancer `npm run build` |
| Route `/admin` inaccessible après rechargement | vérifier que `base/.htaccess` renvoie les routes front vers `front/dist/index.html` |
| API en 404 en développement | vérifier le proxy Vite et la disponibilité du back sur `mmi.unilim.fr` |
| Catalogue impossible à charger | vérifier `base/back/config/config.php`, la connexion MySQL et l'import de `sql/schema.sql` puis `sql/seeds.sql` |
| Session ou préférences non conservées | vérifier la cohérence entre `BASE` et `chemin` |
| Statistiques refusées | vérifier la session et laisser le serveur décider des droits `401`/`403` |

## 9. Règles d'évolution

Pour ajouter une fonctionnalité front, conserver ce découpage :

1. **Données et règles** : module `data/` ou état privé de la page ;
2. **Affichage et événements DOM** : template et composant `ui/` ;
3. **Orchestration** : contrôleur de la page ;
4. **Navigation** : route déclarée dans `front/src/main.js` ;
5. **Contrat back-end** : route PHP, contrôleur, modèle et SQL si nécessaire.

Ne pas déplacer les fichiers existants sans nécessité. Lorsqu'une évolution
concerne le futur catalogue de drones, vérifier d'abord les dépendances métier
et conserver la validation côté serveur pour les prix, rôles, quantités,
variantes, stock et commandes.

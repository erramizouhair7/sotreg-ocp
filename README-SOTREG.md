# SOTREG Analytics

Application web de supervision et d'analyse du transport SOTREG / Groupe OCP.

Le projet est actuellement un **prototype frontend React/Vite** utilisant des **données locales de démonstration**. Il ne nécessite pas de backend ni de base de données pour être lancé.

## Fonctionnalités principales

- Tableau de bord transport
- Indicateurs KPI
- Analyse des trajets et des retards
- Carte de suivi en direct simulée
- Gestion et analyse des véhicules
- Performance des chauffeurs
- KPIs & OKR
- Support technique avec tickets
- Centre d'alertes
- Authentification de démonstration
- Notifications internes
- Export CSV compatible Excel
- Export PDF
- Notifications e-mail via EmailJS (optionnel)

---

## Technologies utilisées

- React
- Vite
- React Router
- Recharts
- Leaflet / React-Leaflet
- jsPDF
- jsPDF AutoTable
- EmailJS
- JavaScript
- CSS

---

# 1. Prérequis

Avant d'installer le projet, vérifier que les outils suivants sont installés :

- Node.js
- npm
- Git

Vérification :

```bash
node -v
npm -v
git --version
```

Une version récente de Node.js LTS est recommandée.

---

# 2. Télécharger le projet

## Option A — avec Git

```bash
git clone https://github.com/erramizouhair7/sotreg-ocp.git
```

Puis :

```bash
cd sotreg-ocp
```

## Option B — avec ZIP

1. Télécharger le projet depuis GitHub.
2. Extraire le fichier ZIP.
3. Ouvrir le dossier du projet dans VS Code.
4. Ouvrir un terminal dans ce dossier.

---

# 3. Installer les dépendances

À la racine du projet :

```bash
npm install
```

Il n'est pas nécessaire d'installer manuellement chaque librairie : `npm install` utilise les dépendances déclarées dans `package.json`.

---

# 4. Configuration du fichier `.env`

Le projet peut fonctionner sans EmailJS.

Pour activer les notifications par e-mail, créer un fichier `.env` à la racine du projet :

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
VITE_NOTIFICATION_EMAIL=destination@gmail.com
```

Remplacer les valeurs par celles du compte EmailJS.

## Important

Ne jamais mettre le mot de passe Gmail dans `.env`.

Le fichier `.env` est ignoré par Git et ne doit pas être envoyé sur GitHub.

Après chaque modification du fichier `.env`, redémarrer Vite :

```bash
Ctrl + C
npm run dev
```

---

# 5. Lancer le projet

```bash
npm run dev
```

Vite affichera normalement une adresse similaire à :

```text
http://localhost:5173/
```

Ouvrir cette adresse dans le navigateur.

---

# 6. Connexion à l'application

Compte de démonstration :

```text
Email : admin@sotreg.ma
Mot de passe : Sotreg2026!
```

Cette authentification est une authentification frontend de démonstration et non une authentification sécurisée de production.

---

# 7. Pages principales

| Page | Fonction |
|---|---|
| Tableau de bord | Vue globale du réseau et des KPI |
| Carte en direct | Simulation du suivi des véhicules |
| Centre d'alertes | Retards, maintenance, GPS et tickets prioritaires |
| Trajets & retards | Analyse des lignes et retards |
| Véhicules | État de la flotte et indicateurs |
| Chauffeurs | Scores et performance |
| KPIs & OKR | Indicateurs de performance |
| Support technique | Gestion des tickets techniques |

---

# 8. Centre d'alertes

Le centre d'alertes génère automatiquement des alertes à partir des données disponibles dans le prototype.

Exemples :

- retard moyen important sur une ligne ;
- retard critique ;
- véhicule nécessitant une maintenance ;
- véhicule immobilisé ;
- ticket technique avec priorité haute ;
- GPS hors ligne.

Les alertes marquées comme traitées sont mémorisées localement dans le navigateur avec `localStorage`.

---

# 9. Notifications internes

L'application possède une cloche de notifications dans la barre supérieure.

Elle permet notamment de signaler :

- la création d'un ticket ;
- un ticket prioritaire ;
- la résolution d'un ticket.

Les notifications internes sont enregistrées dans `localStorage`.

---

# 10. Notifications e-mail avec EmailJS

Cette fonctionnalité est optionnelle.

## Configuration EmailJS

1. Créer un compte EmailJS.
2. Ouvrir **Email Services**.
3. Ajouter un service Gmail.
4. Connecter le compte Gmail utilisé comme expéditeur.
5. Copier le `Service ID`.
6. Créer un template dans **Email Templates**.
7. Copier le `Template ID`.
8. Copier la `Public Key` dans les paramètres EmailJS.
9. Reporter ces valeurs dans `.env`.

Exemple de template :

### To Email

```text
{{to_email}}
```

### Subject

```text
{{subject}}
```

### Message

```text
Bonjour,

Une notification a été générée par SOTREG Analytics.

Type : {{notification_type}}

{{message}}

Date : {{sent_at}}

SOTREG Analytics
```

Le compte Gmail connecté à EmailJS correspond à l'expéditeur.

La variable :

```env
VITE_NOTIFICATION_EMAIL=destination@gmail.com
```

correspond au destinataire.

---

# 11. Export des données

Les pages suivantes proposent des exports :

- Trajets & retards
- Véhicules
- Chauffeurs

Formats disponibles :

- CSV compatible Excel
- PDF

Le projet n'utilise pas `xlsx`.

---

# 12. Données

Les données utilisées actuellement sont des données locales de démonstration.

Fichier principal :

```text
src/data/generated-data.json
```

Le prototype contient notamment des informations simulées concernant :

- lignes de transport ;
- trajets ;
- véhicules ;
- chauffeurs ;
- retards ;
- passagers ;
- incidents ;
- coûts.

Aucune base de données n'est nécessaire pour lancer cette version.

---

# 13. Structure principale du projet

```text
src/
├── components/
│   ├── ExportButtons.jsx
│   ├── ProtectedRoute.jsx
│   ├── RouteFlipCard.jsx
│   ├── Sidebar.jsx
│   └── Topbar.jsx
│
├── context/
│   ├── AuthContext.jsx
│   ├── NotificationsContext.jsx
│   └── TicketsContext.jsx
│
├── data/
│   └── generated-data.json
│
├── hooks/
│   └── useData.js
│
├── pages/
│   ├── AlertsCenter.jsx
│   ├── Dashboard.jsx
│   ├── Drivers.jsx
│   ├── KPIsOKR.jsx
│   ├── LiveMap.jsx
│   ├── Login.jsx
│   ├── RoutesPage.jsx
│   ├── TechnicalSupport.jsx
│   └── Vehicles.jsx
│
├── services/
│   └── emailService.js
│
├── utils/
│   ├── alerts.js
│   ├── analytics.js
│   ├── chartTheme.js
│   ├── exportUtils.js
│   └── geo.js
│
├── App.jsx
├── main.jsx
└── styles.css
```

---

# 14. Commandes utiles

## Démarrer en développement

```bash
npm run dev
```

## Générer une version de production

```bash
npm run build
```

## Prévisualiser le build

```bash
npm run preview
```

## Vérifier les dépendances

```bash
npm audit
```

Éviter d'utiliser directement :

```bash
npm audit fix --force
```

car cette commande peut effectuer des mises à jour majeures et introduire des incompatibilités.

---

# 15. En cas de problème

## Le projet ne démarre pas

Supprimer les dépendances locales puis les réinstaller :

### Windows PowerShell

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

Ne supprimer `package-lock.json` que si une réinstallation normale ne suffit pas.

## Le port 5173 est déjà utilisé

Vite proposera généralement automatiquement un autre port.

## Les variables `.env` ne sont pas prises en compte

Redémarrer le serveur :

```bash
Ctrl + C
npm run dev
```

## Les styles semblent anciens

Faire un rafraîchissement forcé du navigateur :

```text
Ctrl + Shift + R
```

---

# 16. Git

Après modification :

```bash
git status
git add .
git commit -m "feat: description de la modification"
git push
```

Le fichier `.gitignore` doit au minimum contenir :

```gitignore
node_modules/
dist/
.env
.env.*
```

---

# 17. Limites actuelles

La version actuelle est un prototype frontend.

Les éléments suivants ne sont pas encore implémentés comme services réels :

- backend REST ;
- base de données ;
- authentification serveur/JWT ;
- GPS réel ;
- WebSocket temps réel ;
- persistance serveur des tickets ;
- gestion multi-utilisateurs réelle.

Les données et certains comportements temps réel sont simulés dans le navigateur.

---

# 18. Évolutions possibles

Pour une version de production :

```text
React / Vite
      ↓
API REST
      ↓
Spring Boot ou Node.js
      ↓
PostgreSQL / MySQL
```

Évolutions possibles :

- authentification JWT ;
- rôles et permissions ;
- base de données ;
- API REST ;
- GPS réel ;
- WebSocket ;
- e-mails envoyés côté serveur ;
- historique et audit ;
- exports avancés ;
- maintenance prédictive.

---

# Auteur

Projet académique / stage — SOTREG Analytics  
Groupe OCP / SOTREG

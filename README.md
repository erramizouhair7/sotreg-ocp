# SOTREG — prototype local

Dashboard analytique pour le transport SOTREG (Khouribga / OCP) : retards par ligne,
état et utilisation de la flotte, performance des chauffeurs, réclamations.

**Données** : 100% générées localement pour la démo (`scripts/generate-data.mjs`) —
aucune donnée réelle SOTREG/OCP. Le fichier `src/data/generated-data.json` est déjà
généré, tu n'as rien à faire pour la première utilisation.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée (par défaut http://localhost:5174).

## Régénérer les données de démo

```bash
npm run generate:data
```

Modifie les paramètres dans `scripts/generate-data.mjs` (nombre de véhicules, lignes,
période, taux d'incidents...) pour ajuster le jeu de données.

## Pages

- **Tableau de bord** — KPIs globaux, évolution mensuelle, heures de pointe, réclamations
- **Carte en direct** — carte Leaflet avec flotte simulée en mouvement en temps réel, arrêts cliquables (prochains passages), véhicules cliquables (détail + signalement d'incident), filtre par ligne
- **Trajets & retards** — classement des lignes par retard moyen, ponctualité, coût
- **Véhicules** — statut de la flotte, kilométrage, taux d'utilisation, alertes maintenance
- **Chauffeurs** — score de performance basé sur retard / incidents / réclamations
- **KPIs & OKR** — objectifs trimestriels (OKR), analyse d'efficacité des lignes (utilisation vs retard), lignes sous-utilisées, véhicules à surveiller
- **Support technique** — tickets d'incidents (créés manuellement ou depuis la carte en direct), suivi de statut

## Notes techniques

- Interface en **dark mode "command center"** : fond navy dégradé, cartes en verre dépoli, accents teal/bleu,
  police Space Grotesk (titres) + Inter (texte). La carte en direct passe en plein écran (sans menu latéral)
  pour maximiser l'espace, avec un bouton "← Tableau de bord" pour revenir.
- La carte utilise des tuiles CARTO Dark Matter (basées sur OpenStreetMap) → une connexion internet est
  nécessaire dans le navigateur pour les voir s'afficher (pas besoin côté build).
- Les positions des véhicules sur la carte sont **simulées côté client**, animées en continu via
  `requestAnimationFrame` (pas de saccades, pas de conflit avec le glisser/zoom de la carte) — il n'y a pas
  de vrai flux GPS connecté.
- Les tickets de support sont stockés en mémoire (state React) — ils disparaissent au rechargement de la page.
  Pour les persister, brancher une vraie base de données ou une API.

## Prochaines étapes (une fois de vraies données disponibles)

1. Remplacer `generated-data.json` par un export réel (feuilles de route, GPS, main courante)
2. Ajouter une couche API (Node/Express + base de données) pour des mises à jour en direct
3. Prédiction de maintenance / demande de passagers (Phase 3 du plan de montée en gamme)
4. Assistant IA type "pose une question sur tes données" (Phase 5)

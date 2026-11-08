# Brancher le RSVP sur un Google Form

Le formulaire du site envoie les réponses à un Google Form, qui les range dans un Google Sheet. À faire une seule fois.

## 1. Créer le Google Form

Sur <https://forms.google.com>, créer un formulaire avec **10 questions, dans cet ordre** :

| # | Question | Type | Choix |
|---|---|---|---|
| 1 | Nom(s) | Réponse courte | |
| 2 | Présence | Choix multiples | `Oui` / `Non` (casse exacte) |
| 3 | Adultes | Réponse courte | |
| 4 | Enfants | Réponse courte | |
| 5 | Brunch | Choix multiples | `Oui` / `Non` (casse exacte) |
| 6 | Régimes | Paragraphe | |
| 7 | Message | Paragraphe | |
| 8 | Invités | Paragraphe | |
| 9 | Navette | Choix multiples | `Oui` / `Peut-être` / `Non` (casse exacte) |
| 10 | Chanson | Réponse courte | |

**Aucune question obligatoire** côté Google : le site vérifie déjà la saisie, et une réponse « Non » laisse volontairement des champs vides.

## 2. Relier un Google Sheet

Onglet **Réponses** → icône Sheets → « Créer une feuille de calcul ».

## 3. Récupérer les identifiants des champs

1. Menu ⋮ → **Obtenir le lien prérempli**.
2. Remplir chaque question avec une valeur repère (`a`, `Oui`, `1`, `2`, `Oui`, `b`, `c`).
3. **Obtenir le lien** → copier le lien. Il ressemble à :
   `https://docs.google.com/forms/d/e/XXXX/viewform?usp=pp_url&entry.111=a&entry.222=Oui&...`
4. Chaque `entry.NNN=valeur` donne l'identifiant de la question correspondante.

## 4. Remplir `rsvp.js`

En haut de `rsvp.js` :

- `url` : l'URL du lien ci-dessus, **jusqu'à `/viewform` exclu**, suivie de `/formResponse`.
  Ex. `https://docs.google.com/forms/d/e/XXXX/formResponse`
- `entries` : les 10 `entry.NNN`, chacun en face de son champ (`noms`, `presence`, `adultes`, `enfants`, `brunch`, `regimes`, `message`, `invites`, `navette`, `chanson`). Un `entry` laissé à `''` n'est simplement pas envoyé.
- `CONTACT_EMAIL` : l'adresse affichée si l'envoi échoue.

## 5. Tester avant de diffuser le lien

Lancer `python3 -m http.server` dans le dossier du site, ouvrir <http://localhost:8000/#rsvp>, puis envoyer :

1. **« Test Oui »** : Oui, 2 adultes, 1 enfant, brunch Oui, régime « test », message « test ».
2. **« Test Non »** : cocher d'abord Oui et mettre 3 adultes, puis repasser sur Non, et envoyer.

Dans le Sheet, on doit voir 2 lignes :
- « Test Oui » : toutes les colonnes remplies avec les bonnes valeurs.
- « Test Non » : Présence = Non, et Adultes / Enfants / Brunch / Régimes **vides**.

Si une ligne manque ou si une colonne est vide alors qu'elle devrait être remplie, un `entry.NNN` est faux : corriger `rsvp.js` et recommencer.

Une fois le test réussi, supprimer les 2 lignes de test dans le Sheet.

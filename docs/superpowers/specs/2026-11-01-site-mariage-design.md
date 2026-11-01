# Site de mariage Céline & Victor — Design

Date : 2026-11-01
Statut : validé en conversation, en attente de relecture de la spec

## Objectif

Remplacer le save-the-date à gratter par un site de mariage complet, dans le même esprit visuel. Les invités doivent y trouver toutes les infos pratiques et confirmer leur présence en ligne ; les mariés récupèrent les réponses dans un Google Sheet.

Critères de réussite :
- Un invité, depuis son téléphone (lien reçu par SMS), trouve programme, lieux, accès, hébergement et répond au RSVP en moins de 2 minutes.
- Chaque réponse RSVP arrive comme une ligne correcte dans le Google Sheet.
- Le site reste statique, sans build ni dépendance, hébergé sur GitHub Pages.

## Périmètre

Inclus (phase 1) : Accueil, Programme, Lieux & accès, Hébergement, RSVP, Voyage de noces (idées + lien cagnotte), FAQ.

Exclus :
- Galerie photos : phase ultérieure, après le 10 juillet 2027 (page `galerie.html` séparée).
- Compte à rebours, multilingue, dress code, page contacts.
- Gestion des doublons RSVP dans le code (traitée à la main dans le Sheet).
- Codes d'accès / invitations partielles : tous les invités sont conviés à tout.

## Faits de l'événement

- Samedi 10 juillet 2027
  - 14h30 : mariage civil, mairie de Talence
  - ~16h30 : cérémonie laïque, Château du Haut-Nouchet, Martillac
  - Cocktail, puis dîner et soirée au château
- Dimanche 11 juillet 2027 : brunch (heure à compléter)
- Hébergement : Akena hôtel La Brède, 6 min en voiture du château, 85 €/chambre en mentionnant le mariage.
- Navette le soir du château vers l'Akena.

## Architecture

Une seule page HTML avec menu d'ancres. HTML/CSS/JS pur, aucune dépendance, aucun build. Fonctionne en `file://` et via `python3 -m http.server`.

```
index.html   réécrit — une page, 7 sections
style.css    réécrit — même palette, même police
rsvp.js      nouveau — envoi du formulaire vers Google Form
scratch.js   supprimé
```

## Contenu par section

1. **Accueil** — « Céline & Victor », « 10 juillet 2027 », « Talence · Martillac ». Fleurs séchées SVG dans les coins (SVG existants de `index.html` réutilisés), uniquement sur cette section. Bouton « Répondre » → `#rsvp`.
2. **Programme** — frise verticale : mairie 14h30, cérémonie laïque ~16h30, cocktail, dîner & soirée, brunch dimanche.
3. **Lieux & accès** — deux cartes (mairie de Talence, Château du Haut-Nouchet), chacune avec adresse et bouton « Itinéraire » (lien Google Maps). Bloc accès : gare Bordeaux Saint-Jean, voiture, parking au château.
4. **Hébergement** — carte Akena La Brède : distance, tarif 85 €/chambre en mentionnant le mariage, téléphone, lien. Mention de la navette du soir vers l'Akena.
5. **RSVP** — formulaire (voir section RSVP), avec date limite de réponse.
6. **Voyage de noces** — 3 à 4 cartes d'idées de voyage (titre, texte court, image optionnelle) + un bouton unique « Participer à la cagnotte » vers un service externe.
7. **FAQ** — questions dépliables via `<details>`/`<summary>` natifs (enfants, photos pendant la cérémonie, horaires de fin, etc.).

**Menu** : barre fixe en haut, liens d'ancres vers chaque section. Sur mobile : ligne défilante horizontalement (`overflow-x: auto`), pas de burger, pas de JS.

**Contenu à compléter** : tout contenu inconnu à ce jour est marqué `<!-- À COMPLÉTER -->` dans le HTML : adresses exactes, heure du brunch, téléphone et lien de l'Akena, idées de voyage, lien de la cagnotte, réponses FAQ, date limite RSVP (proposition : 1er avril 2027), email de contact affiché en cas d'échec d'envoi.

## Style

Palette (reprise du save-the-date), définie en variables CSS sur `:root` :

| Variable | Valeur | Rôle |
|---|---|---|
| `--bg` | `#f5f0e8` | fond de page |
| `--card` | `#faf7f2` | cartes, blocs |
| `--text` | `#4a4035` | texte principal |
| `--text-soft` | `#5a4a3a` | texte secondaire |
| `--sage` | `#7a8c6e` | boutons, liens |
| `--beige` | `#c8b89a` | filets |
| `--gold` | `#d4c4a0` | ornements |

- Police : Cormorant Garamond (Google Fonts) pour tout ; noms en italique ; corps ~1.15rem.
- Colonne centrée `max-width: 720px`, sections séparées par un ornement (filet doré ou brin SVG).
- Cartes : fond `--card`, `border-radius: 16px`, ombre `0 4px 32px rgba(74,64,53,0.10)`.
- Boutons : bord et texte sauge, fond sauge + texte clair au survol/focus.
- Mobile-first ; grilles de cartes en 1 colonne, 2 colonnes à partir de 640px.
- Accessibilité : contraste AA, `:focus-visible` marqué, `<label>` sur chaque champ, fleurs `aria-hidden`.

## RSVP

### Champs

Une réponse par foyer.

| Champ | Type | Règle |
|---|---|---|
| Nom(s) | texte | requis |
| Présence | radio Oui / Non | requis |
| Adultes | nombre | min 1, défaut 1 — si Oui |
| Enfants | nombre | min 0, défaut 0 — si Oui |
| Brunch dimanche | radio Oui / Non | si Oui |
| Régimes / allergies | texte long | optionnel — si Oui |
| Message aux mariés | texte long | optionnel |

Les champs « si Oui » sont regroupés dans un conteneur masqué en CSS pur quand « Non » est coché (`form:has(#presence-non:checked) .si-present { display: none; }`).

### Mise en place Google (manuelle, par les mariés)

1. Créer un Google Form avec les 7 questions ci-dessus.
2. Le lier à un Google Sheet (onglet Réponses).
3. Récupérer l'URL `formResponse` et l'identifiant `entry.XXXX` de chaque question via « Obtenir le lien prérempli ».
4. Reporter ces valeurs dans l'objet de config en tête de `rsvp.js`.

### Envoi (`rsvp.js`)

- Objet `CONFIG` en tête de fichier : URL `formResponse` + correspondance champ HTML → `entry.XXXX`.
- À la soumission : `preventDefault`, construction d'un `FormData` avec les clés `entry.XXXX`. Si Présence = Non, les champs « si Oui » ne sont pas envoyés.
- `fetch(CONFIG.url, { method: 'POST', mode: 'no-cors', body })`.
- Bouton désactivé pendant l'envoi.
- Succès (promesse résolue) : le formulaire est remplacé par « Merci ! Votre réponse a bien été envoyée ♡ ».
- Échec (promesse rejetée, ex. réseau coupé) : message « Oups, l'envoi a échoué. Réessayez, ou écrivez-nous à … », bouton réactivé, saisie conservée.

### Limite connue

`no-cors` renvoie une réponse opaque : le site sait que la requête est partie, pas que Google l'a acceptée. Le seul mode de rejet réaliste (mauvais `entry.XXXX`) est éliminé par le test manuel avant mise en ligne.

## Tests

- Manuel, avant mise en ligne : un envoi « Oui » complet et un envoi « Non » ; vérifier que les deux lignes arrivent correctement dans le Sheet (bonnes colonnes, champs « si Oui » vides pour le « Non »).
- Manuel : rendu mobile (vrai téléphone ou émulation navigateur) de l'accueil, du menu et du formulaire ; navigation clavier sur le formulaire.
- Pas de framework de test : la logique est minime, le risque principal (config des identifiants) est couvert par le test manuel.

## Hébergement

GitHub Pages, comme le save-the-date actuel. Domaine personnalisé éventuel via fichier `CNAME` (hors périmètre de cette spec).

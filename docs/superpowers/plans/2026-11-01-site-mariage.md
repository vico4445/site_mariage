# Site de mariage Céline & Victor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le save-the-date à gratter par un site de mariage une page (7 sections + RSVP vers Google Form), même esprit visuel.

**Architecture:** Un `index.html` à sections ancrées, un `style.css` à variables, un `rsvp.js` qui envoie le formulaire en `fetch` `no-cors` vers l'URL `formResponse` d'un Google Form. La construction du payload est une fonction pure testée sous Node ; le reste est vérifié à la main dans le navigateur.

**Tech Stack:** HTML/CSS/JS natif, Google Fonts (Cormorant Garamond), Node 25 (`node --test`, dev uniquement), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-01-site-mariage-design.md`

## Global Constraints

- Aucune dépendance, aucun build, pas de `package.json`. Doit marcher en `file://` et via `python3 -m http.server`.
- Langue : français uniquement, `<html lang="fr">`.
- Palette, sur `:root` : `--bg #f5f0e8`, `--card #faf7f2`, `--text #4a4035`, `--text-soft #5a4a3a`, `--sage #7a8c6e`, `--beige #c8b89a`, `--gold #d4c4a0`. Aucune autre couleur en dur hors `rgba(74,64,53,0.10)` de l'ombre.
- Police : Cormorant Garamond partout ; corps ~1.15rem ; noms en italique.
- Colonne `max-width: 720px` ; cartes `border-radius: 16px`, ombre `0 4px 32px rgba(74,64,53,0.10)` ; grilles 1 colonne, 2 colonnes à partir de 640px.
- Contenu inconnu marqué `<!-- À COMPLÉTER -->` juste avant l'élément concerné.
- Faits fixes : samedi 10 juillet 2027 ; 14h30 mairie de Talence ; ~16h30 cérémonie laïque, Château du Haut-Nouchet, Martillac ; cocktail, dîner & soirée ; dimanche 11 juillet brunch ; Akena La Brède, 6 min en voiture, 85 €/chambre en mentionnant le mariage ; navette le soir du château vers l'Akena.
- Accessibilité : `:focus-visible` visible, `<label>` sur chaque champ, décor `aria-hidden="true"`.

## Review Focus

1. Invité coche « Oui », remplit adultes/enfants/brunch, puis repasse à « Non » → le payload ne contient aucun champ « si Oui » (le Sheet ne doit pas afficher 3 adultes pour un refus). Test : `buildPayload` cas « Non avec champs remplis » (Task 4).
2. Navigateur sans `:has()` (Firefox < 121, vieux Safari) → champs « si Oui » visibles même sur « Non », mais l'envoi reste correct grâce au point 1. Vérif manuelle documentée en Task 3.
3. Double tap sur « Envoyer » sur mobile → une seule requête. Bouton désactivé dès le premier submit (Task 4, vérif manuelle).
4. Réseau coupé à l'envoi → message d'erreur, saisie conservée, bouton réactivé (Task 4, vérif manuelle via DevTools « Offline »).
5. Menu sur un écran de 360px → 7 liens défilent horizontalement sans scroll horizontal de la page (Task 1, vérif manuelle).

---

## File Structure

```
index.html            réécrit — nav + 7 sections
style.css             réécrit — variables, layout, composants
rsvp.js               nouveau — CONFIG, buildPayload (pure), handler submit
rsvp.test.js          nouveau — node --test sur buildPayload
docs/google-form.md   nouveau — marche à suivre Google Form pour les mariés
scratch.js            supprimé
```

---

### Task 1: Squelette, style de base, accueil

**Files:**
- Modify: `index.html` (réécriture complète, garder les 4 `<svg class="flower ...">` des lignes 13–57)
- Modify: `style.css` (réécriture complète)
- Delete: `scratch.js`

**Interfaces:**
- Produces: ids de section `accueil`, `programme`, `lieux`, `hebergement`, `rsvp`, `voyage`, `faq` (dans cet ordre). Classes réutilisées par les tasks suivantes : `.section` (wrapper de section, colonne 720px), `.section-title` (h2), `.cards` (grille 1→2 colonnes), `.card` (bloc blanc cassé arrondi), `.btn` (bouton sauge, utilisable sur `<a>` et `<button>`), `.ornament` (séparateur entre sections).

- [ ] **Step 1: Réécrire `index.html`**
  - `<head>` : garder charset, viewport, preconnect et lien Google Fonts existants ; `<title>Céline & Victor — 10 juillet 2027</title>` ; `<meta name="description" content="Mariage de Céline & Victor, 10 juillet 2027, Talence & Martillac">`.
  - `<nav class="nav">` fixe avec 6 liens : Programme, Lieux, Hébergement, RSVP, Voyage, FAQ.
  - `<header id="accueil" class="hero">` : le bloc `.flowers` (4 SVG existants), « Céline & Victor » (`.names`), « 10 juillet 2027 », « Talence · Martillac », `<a class="btn" href="#rsvp">Répondre</a>`.
  - `<main>` : 6 `<section class="section" id="…">` avec seulement leur `<h2 class="section-title">` (contenu en Tasks 2–3), séparées par `<div class="ornament" aria-hidden="true"></div>`.
  - Aucun `<script>` pour l'instant.

- [ ] **Step 2: Réécrire `style.css`**
  - Reset existant + variables `:root` (Global Constraints) ; `body` en flux normal (supprimer `overflow:hidden` et le centrage flex du save-the-date) ; `html { scroll-behavior: smooth; }` ; sections avec `scroll-margin-top` = hauteur de la nav.
  - `.nav` : `position: sticky; top: 0`, fond `--bg`, liens en ligne, `overflow-x: auto; white-space: nowrap`.
  - `.hero` : `min-height: 100svh`, centré, `position: relative; overflow: hidden` ; `.flowers` passe de `position: fixed` à `absolute` (les fleurs restent dans l'accueil) ; reprendre les règles `.flower--tl/tr/bl/br` existantes.
  - `.card`, `.cards`, `.btn` (bord + texte `--sage`, fond `--sage` + texte `--card` sur `:hover`/`:focus-visible`), `.ornament` (filet `--gold` court centré), `:focus-visible { outline: 2px solid var(--sage); outline-offset: 3px; }`.

- [ ] **Step 3: Supprimer `scratch.js`**

Run: `git rm scratch.js`

- [ ] **Step 4: Vérifier**

Run: `grep -c 'class="flower ' index.html; grep -oE 'id="[a-z]+"' index.html; grep -n 'scratch' index.html style.css`
Expected: `4` ; les 7 ids dans l'ordre `accueil programme lieux hebergement rsvp voyage faq` ; aucune ligne `scratch`.

Puis `python3 -m http.server 8000` et ouvrir `http://localhost:8000` : fleurs dans l'accueil uniquement, clic sur chaque lien du menu = scroll vers le bon titre non masqué par la nav ; en émulation 360px, la nav défile horizontalement et la page n'a aucun scroll horizontal (Review Focus 5).

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "feat: replace save-the-date with one-page wedding site skeleton"
```

---

### Task 2: Sections de contenu (Programme, Lieux, Hébergement, Voyage, FAQ)

**Files:**
- Modify: `index.html` (sections `#programme`, `#lieux`, `#hebergement`, `#voyage`, `#faq`)
- Modify: `style.css` (ajout `.timeline`, `.faq`)

**Interfaces:**
- Consumes: `.section`, `.cards`, `.card`, `.btn` (Task 1).

- [ ] **Step 1: Programme** — `<ol class="timeline">`, une `<li>` par étape avec `<time>` + titre + lieu :
  - Samedi 10 juillet · 14h30 · Mariage civil · Mairie de Talence
  - ~16h30 · Cérémonie laïque · Château du Haut-Nouchet
  - Cocktail · Dîner & soirée (pas d'heure)
  - Dimanche 11 juillet · `<!-- À COMPLÉTER -->` heure · Brunch · lieu `<!-- À COMPLÉTER -->`
  - CSS `.timeline` : trait vertical `--beige` à gauche, pastille `--sage` par étape.

- [ ] **Step 2: Lieux & accès** — `.cards` avec deux `.card` (Mairie de Talence ; Château du Haut-Nouchet, Martillac), chacune : adresse `<!-- À COMPLÉTER -->`, `<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=…">Itinéraire</a>` (query = nom + ville encodés). Sous les cartes, un bloc « Accès » : gare Bordeaux Saint-Jean, voiture (~25 min entre mairie et château), parking au château — chaque détail inconnu marqué `<!-- À COMPLÉTER -->`.

- [ ] **Step 3: Hébergement** — une `.card` Akena La Brède : « à 6 minutes en voiture du château », « 85 € la chambre en précisant que vous venez pour le mariage », téléphone et lien `<!-- À COMPLÉTER -->`. Paragraphe : « Une navette vous ramènera le soir du château jusqu'à l'Akena. »

- [ ] **Step 4: Voyage de noces** — court texte d'intro, `.cards` avec 3 `.card` d'idées (titre + texte + `<img>` optionnelle commentée) en contenu exemple marqué `<!-- À COMPLÉTER -->`, puis un unique `<a class="btn" target="_blank" rel="noopener" href="#">Participer à la cagnotte</a>` précédé de `<!-- À COMPLÉTER : lien cagnotte -->`.

- [ ] **Step 5: FAQ** — `.faq` contenant des `<details><summary>…</summary><p>…</p></details>` : « Les enfants sont-ils les bienvenus ? », « Peut-on prendre des photos pendant la cérémonie ? », « Jusqu'à quelle heure dure la soirée ? », « Comment rejoindre l'hôtel le soir ? » (réponse : la navette, contenu connu) ; les autres réponses `<!-- À COMPLÉTER -->`. CSS : `summary` en `--text`, curseur pointeur, filet `--beige` entre questions.

- [ ] **Step 6: Vérifier**

Run: `grep -c 'À COMPLÉTER' index.html; grep -c '<details' index.html; grep -c 'rel="noopener"' index.html`
Expected: ≥ 8 ; `4` ; ≥ 3.

Navigateur : rendu mobile 360px et desktop 1280px — cartes en 1 puis 2 colonnes, FAQ dépliable au clic et au clavier (Tab + Entrée).

- [ ] **Step 7: Commit**

```bash
git add index.html style.css
git commit -m "feat: add program, venues, lodging, honeymoon and FAQ sections"
```

---

### Task 3: Formulaire RSVP (HTML + CSS)

**Files:**
- Modify: `index.html` (section `#rsvp`)
- Modify: `style.css` (ajout `.rsvp-form`, `.si-present`, `.rsvp-status`)

**Interfaces:**
- Produces (consommés par Task 4) : `<form id="rsvp-form" class="rsvp-form">` (sans `novalidate` : validation native active) ; champs avec ces `name` exacts :
  - `noms` (text, required)
  - `presence` (radio, values `oui` / `non`, required ; ids `presence-oui`, `presence-non`)
  - `adultes` (number, min 1, value 1)
  - `enfants` (number, min 0, value 0)
  - `brunch` (radio, values `oui` / `non`)
  - `regimes` (textarea)
  - `message` (textarea)
- `adultes`, `enfants`, `brunch`, `regimes` sont dans `<fieldset class="si-present">`.
- `<button type="submit">Envoyer</button>` et `<p class="rsvp-status" role="status" aria-live="polite"></p>`.

- [ ] **Step 1: HTML** — intro « Merci de nous répondre avant le » + date `<!-- À COMPLÉTER : date limite, proposition 1er avril 2027 -->`. Le formulaire ci-dessus, chaque champ avec `<label for>`, radios dans des `<fieldset>` + `<legend>`. Libellés : « Nom(s) », « Serez-vous présent·e·s ? », « Adultes », « Enfants », « Serez-vous là au brunch du dimanche ? », « Régimes alimentaires / allergies », « Un petit mot pour les mariés ».

- [ ] **Step 2: CSS** — champs pleine largeur, fond `--card`, bord `--beige`, `border-radius: 8px`, focus `--sage`. Masquage :

```css
.rsvp-form:has(#presence-non:checked) .si-present { display: none; }
```

- [ ] **Step 3: Vérifier**

Navigateur : cocher « Non » masque adultes/enfants/brunch/régimes, « Oui » les réaffiche ; « Envoyer » sans nom ni présence → bulle de validation native. Sans JS encore, l'envoi recharge la page : attendu à ce stade.
Review Focus 2 : dans Firefox ≥ 121 ou Chrome, le masquage marche ; noter dans le commit que sans `:has()` les champs restent visibles (dégradation acceptée, gérée par Task 4).

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat: add RSVP form markup and styles"
```

---

### Task 4: Envoi RSVP (`rsvp.js`) + test

**Files:**
- Create: `rsvp.js`
- Create: `rsvp.test.js`
- Modify: `index.html` (ajout `<script src="rsvp.js" defer></script>` avant `</body>`)

**Interfaces:**
- Consumes: noms de champs et ids de Task 3.
- Produces:
  - `CONFIG = { url: string, entries: { noms, presence, adultes, enfants, brunch, regimes, message } }` — valeurs placeholder `'À_REMPLIR'` / `'entry.À_REMPLIR'`, remplies en Task 5.
  - `buildPayload(values: Record<string,string>, config) -> URLSearchParams` — fonction pure. Pour chaque champ présent et non vide dans `values`, ajoute `config.entries[champ] = valeur`. Si `values.presence === 'non'`, ignore `adultes`, `enfants`, `brunch`, `regimes`. Valeurs de présence/brunch envoyées telles quelles mais avec la casse du Google Form : `oui → 'Oui'`, `non → 'Non'`.
  - Export Node : `if (typeof module !== 'undefined') module.exports = { buildPayload };`

- [ ] **Step 1: Écrire le test `rsvp.test.js`**

```js
const test = require('node:test');
const assert = require('node:assert');
const { buildPayload } = require('./rsvp.js');

const config = { url: 'x', entries: {
  noms: 'entry.1', presence: 'entry.2', adultes: 'entry.3', enfants: 'entry.4',
  brunch: 'entry.5', regimes: 'entry.6', message: 'entry.7' } };

test('oui: tous les champs envoyés, casse Google', () => {
  const p = buildPayload({ noms: 'Jean & Marie', presence: 'oui', adultes: '2',
    enfants: '1', brunch: 'oui', regimes: 'sans gluten', message: 'Bravo' }, config);
  assert.strictEqual(p.get('entry.1'), 'Jean & Marie');
  assert.strictEqual(p.get('entry.2'), 'Oui');
  assert.strictEqual(p.get('entry.3'), '2');
  assert.strictEqual(p.get('entry.4'), '1');
  assert.strictEqual(p.get('entry.5'), 'Oui');
  assert.strictEqual(p.get('entry.6'), 'sans gluten');
  assert.strictEqual(p.get('entry.7'), 'Bravo');
});

test('non avec champs si-présent remplis: ils sont ignorés', () => {
  const p = buildPayload({ noms: 'Paul', presence: 'non', adultes: '3',
    enfants: '2', brunch: 'oui', regimes: 'vegan', message: 'Désolé' }, config);
  assert.strictEqual(p.get('entry.2'), 'Non');
  for (const k of ['entry.3', 'entry.4', 'entry.5', 'entry.6']) assert.strictEqual(p.has(k), false);
  assert.strictEqual(p.get('entry.7'), 'Désolé');
});

test('champs vides non envoyés', () => {
  const p = buildPayload({ noms: 'Léa', presence: 'oui', adultes: '1', enfants: '0',
    brunch: 'non', regimes: '', message: '' }, config);
  assert.strictEqual(p.has('entry.6'), false);
  assert.strictEqual(p.has('entry.7'), false);
  assert.strictEqual(p.get('entry.4'), '0');
});
```

- [ ] **Step 2: Lancer, vérifier l'échec**

Run: `node --test rsvp.test.js`
Expected: FAIL, `Cannot find module './rsvp.js'`.

- [ ] **Step 3: Implémenter `rsvp.js`** — `CONFIG`, `buildPayload` (ci-dessus), export Node, puis le handler navigateur gardé par `if (typeof document !== 'undefined')` :
  - `submit` sur `#rsvp-form` : `preventDefault`, `if (button.disabled) return`, `button.disabled = true`, `status.textContent = 'Envoi…'`.
  - `values = Object.fromEntries(new FormData(form))`, `fetch(CONFIG.url, { method: 'POST', mode: 'no-cors', body: buildPayload(values, CONFIG) })`.
  - Résolu : remplacer le formulaire par `<p class="rsvp-status">Merci ! Votre réponse a bien été envoyée ♡</p>` (via `form.replaceWith`).
  - Rejeté : `status.textContent = "Oups, l'envoi a échoué. Réessayez, ou écrivez-nous à " + ` email `<!-- À COMPLÉTER -->` (constante `CONTACT_EMAIL` en tête de fichier, placeholder `'À_REMPLIR'`) ; `button.disabled = false` ; ne pas toucher aux champs.
  - Commentaire `// ponytail: no-cors = réponse opaque, succès Google non vérifiable ; mauvais entry.XXXX détecté par le test manuel (docs/google-form.md)`.

- [ ] **Step 4: Lancer, vérifier le succès**

Run: `node --test rsvp.test.js`
Expected: `# pass 3`, `# fail 0`.

- [ ] **Step 5: Ajouter le script et vérifier dans le navigateur**

`<script src="rsvp.js" defer></script>` avant `</body>`. Avec `python3 -m http.server` :
- DevTools Network → « Offline », envoyer → message d'erreur, saisie conservée, bouton réactivé (Review Focus 4).
- Repasser en ligne, double-cliquer vite « Envoyer » → une seule requête vers `À_REMPLIR` dans l'onglet Network (Review Focus 3). Le message « Merci » ou l'erreur dépend du placeholder : sans importance avant Task 5.
- Console sans erreur JS au chargement.

- [ ] **Step 6: Commit**

```bash
git add rsvp.js rsvp.test.js index.html
git commit -m "feat: submit RSVP to Google Form via no-cors fetch"
```

---

### Task 5: Configuration Google Form + test de bout en bout (avec les mariés)

**Files:**
- Create: `docs/google-form.md`
- Modify: `rsvp.js` (`CONFIG`, `CONTACT_EMAIL`)

**Interfaces:**
- Consumes: `CONFIG` et `CONTACT_EMAIL` de Task 4.

- [ ] **Step 1: Écrire `docs/google-form.md`** — marche à suivre en français, numérotée :
  1. Créer un Google Form avec 7 questions, dans l'ordre et aux types : Nom(s) (réponse courte), Présence (choix multiple « Oui »/« Non », casse exacte), Adultes (réponse courte), Enfants (réponse courte), Brunch (choix multiple « Oui »/« Non »), Régimes (paragraphe), Message (paragraphe). Aucune question obligatoire côté Google (le site gère, et un « Non » laisse des champs vides).
  2. Onglet Réponses → lier à une feuille Google Sheets.
  3. ⋮ → « Obtenir le lien prérempli » → remplir chaque champ avec une valeur repère → « Obtenir le lien » → copier : chaque `entry.NNN=valeur` donne l'identifiant d'un champ.
  4. URL d'envoi = URL du form avec `/viewform` remplacé par `/formResponse`.
  5. Coller l'URL et les 7 `entry.NNN` dans `CONFIG` de `rsvp.js`, et l'email de contact dans `CONTACT_EMAIL`.
  6. Faire le test du Step 3 ci-dessous, puis supprimer les lignes de test dans le Sheet.

- [ ] **Step 2: Les mariés remplissent `CONFIG`** — l'exécutant demande l'URL, les 7 ids et l'email ; ne pas inventer de valeur.

Run: `grep -c 'À_REMPLIR' rsvp.js`
Expected: `0`.

- [ ] **Step 3: Test de bout en bout**

Via `python3 -m http.server`, envoyer :
- « Test Oui » : Oui, 2 adultes, 1 enfant, brunch Oui, régime « test », message « test ».
- « Test Non » : Non, après avoir d'abord rempli adultes = 3 sous « Oui » (Review Focus 1).

Expected dans le Sheet : 2 lignes ; la ligne « Test Oui » a toutes ses colonnes remplies avec les bonnes valeurs ; la ligne « Test Non » a Présence = Non et Adultes/Enfants/Brunch/Régimes vides. Si une ligne manque ou une colonne est vide à tort → mauvais `entry.NNN`, corriger `CONFIG`.

- [ ] **Step 4: Relancer le test unitaire**

Run: `node --test rsvp.test.js`
Expected: `# pass 3`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add docs/google-form.md rsvp.js
git commit -m "feat: wire RSVP to live Google Form"
```

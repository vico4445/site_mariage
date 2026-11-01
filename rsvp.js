// Envoi du RSVP vers un Google Form (voir docs/google-form.md pour remplir CONFIG).
const CONFIG = {
  url: 'À_REMPLIR',
  entries: {
    noms: 'entry.À_REMPLIR',
    presence: 'entry.À_REMPLIR',
    adultes: 'entry.À_REMPLIR',
    enfants: 'entry.À_REMPLIR',
    brunch: 'entry.À_REMPLIR',
    regimes: 'entry.À_REMPLIR',
    message: 'entry.À_REMPLIR',
  },
};
const CONTACT_EMAIL = 'À_REMPLIR';

const SI_PRESENT = ['adultes', 'enfants', 'brunch', 'regimes'];
const LIBELLES = { oui: 'Oui', non: 'Non' }; // casse exacte des choix du Google Form

function buildPayload(values, config) {
  const body = new URLSearchParams();
  for (const [champ, entry] of Object.entries(config.entries)) {
    const v = (values[champ] || '').trim();
    if (!v) continue;
    if (values.presence === 'non' && SI_PRESENT.includes(champ)) continue;
    body.append(entry, champ === 'presence' || champ === 'brunch' ? LIBELLES[v] || v : v);
  }
  return body;
}

if (typeof module !== 'undefined') module.exports = { buildPayload };

if (typeof document !== 'undefined') {
  const form = document.getElementById('rsvp-form');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.rsvp-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = 'Envoi…';

    const values = Object.fromEntries(new FormData(form));
    // ponytail: no-cors = réponse opaque, succès Google non vérifiable ; mauvais entry.XXXX détecté par le test manuel (docs/google-form.md)
    fetch(CONFIG.url, { method: 'POST', mode: 'no-cors', body: buildPayload(values, CONFIG) })
      .then(() => {
        const merci = document.createElement('p');
        merci.className = 'rsvp-status';
        merci.textContent = 'Merci ! Votre réponse a bien été envoyée ♡';
        form.replaceWith(merci);
      })
      .catch(() => {
        status.textContent = "Oups, l'envoi a échoué. Réessayez, ou écrivez-nous à " + CONTACT_EMAIL + '.';
        button.disabled = false;
      });
  });
}

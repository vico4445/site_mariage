// Envoi du RSVP vers un Google Form (voir docs/google-form.md pour remplir CONFIG).
const CONFIG = {
  url: 'https://docs.google.com/forms/d/e/1FAIpQLSdvLLjecRvGBv4Dml2eTaStMl9FKc4WxHiwSEW_dQ9K32sRGQ/formResponse',
  entries: {
    noms: 'entry.400830446',
    presence: 'entry.1974946621',
    adultes: 'entry.1208827363',
    enfants: 'entry.952328994',
    brunch: 'entry.276555456',
    regimes: 'entry.638719467',
    message: 'entry.1221664846',
  },
};
const CONTACT_EMAIL = 'qb5shwi3x@mozmail.com'; // alias Firefox Relay (transfert vers la boîte des mariés)

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

function isConfigured(config) {
  return ![config.url, ...Object.values(config.entries)].some((v) => v.includes('À_REMPLIR'));
}

if (typeof module !== 'undefined') module.exports = { buildPayload, isConfigured };

if (typeof document !== 'undefined') {
  const form = document.getElementById('rsvp-form');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.rsvp-status');
  const siPresent = form.querySelector('.si-present');

  // Un fieldset désactivé échappe à la validation : un champ masqué invalide ne bloque plus un « Non ».
  form.addEventListener('change', () => {
    siPresent.disabled = form.presence.value === 'non';
  });

  const echec = () => {
    status.textContent = "Oups, l'envoi a échoué. Réessayez, ou écrivez-nous à " + CONTACT_EMAIL +
      " (oui, l'adresse est un peu étrange : c'est un alias anti-spam, votre message nous parviendra bien).";
    button.disabled = false;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = 'Envoi…';
    if (!isConfigured(CONFIG)) return echec(); // jamais de « Merci » tant que le Google Form n'est pas branché

    const values = Object.fromEntries(new FormData(form));
    // ponytail: no-cors = réponse opaque, succès Google non vérifiable ; mauvais entry.XXXX détecté par le test manuel (docs/google-form.md)
    fetch(CONFIG.url, { method: 'POST', mode: 'no-cors', body: buildPayload(values, CONFIG) })
      .then(() => {
        const merci = document.createElement('p');
        merci.className = 'rsvp-status';
        merci.textContent = 'Merci ! Votre réponse a bien été envoyée ♡';
        form.replaceWith(merci);
      })
      .catch(echec);
  });
}

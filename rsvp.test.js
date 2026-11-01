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

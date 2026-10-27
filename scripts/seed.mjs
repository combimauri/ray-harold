// One-time import of scripts/invitados.json into Firestore, then writes
// scripts/enlaces.csv with each guest's personal link.
//
// Firestore is the source of truth once the admin panel (/admin) is in use:
// re-seeding would undo edits and bring back deleted guests, so it refuses
// to run on a non-empty collection unless --force is passed.
//
//   gcloud auth application-default login
//   npm run seed [-- --force]
import { readFileSync, writeFileSync } from 'node:fs';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'boda-raysa-harold';
const BASE_URL = process.env.BASE_URL || `https://${PROJECT_ID}.web.app`;

const guests = JSON.parse(readFileSync(new URL('./invitados.json', import.meta.url), 'utf8'));

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();

const existing = await db.collection('invitados').count().get();
if (existing.data().count > 0 && !process.argv.includes('--force')) {
  console.error(`✗ Firestore ya tiene ${existing.data().count} invitados. Usa el panel /admin, o --force para reimportar.`);
  process.exit(1);
}

const batch = db.batch();
for (const { id, ...data } of guests) {
  batch.set(db.collection('invitados').doc(id), data, { merge: true });
}
await batch.commit();
console.log(`✓ ${guests.length} invitados guardados en Firestore`);

const csv = (v) => `"${String(v).replaceAll('"', '""')}"`;
const rows = [['grupo', 'orden', 'nombre', 'pases', 'enlace']];
for (const g of guests) rows.push([g.grupo, g.orden, g.nombre, g.pases, `${BASE_URL}/?i=${g.id}`]);
writeFileSync(new URL('./enlaces.csv', import.meta.url), rows.map((r) => r.map(csv).join(',')).join('\n') + '\n');
console.log('✓ Enlaces escritos en scripts/enlaces.csv');

// Downloads every invitation with its RSVP into scripts/confirmaciones.csv.
//
//   gcloud auth application-default login
//   npm run rsvps
import { writeFileSync } from 'node:fs';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'boda-raysa-harold' });
const snap = await getFirestore().collection('invitados').get();

const csv = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
const rows = [['grupo', 'orden', 'nombre', 'pases', 'respuesta', 'personas', 'mensaje', 'respondido']];
let si = 0;
let personas = 0;
const docs = snap.docs.map((d) => d.data()).sort((a, b) => a.grupo.localeCompare(b.grupo) || a.orden - b.orden);
for (const g of docs) {
  const r = g.rsvp;
  const respuesta = !r ? 'pendiente' : r.asiste ? 'sí' : 'no';
  if (r?.asiste) {
    si++;
    personas += r.personas;
  }
  rows.push([g.grupo, g.orden, g.nombre, g.pases, respuesta, r?.personas ?? '', r?.mensaje ?? '', r?.respondidoEn?.toDate().toISOString() ?? '']);
}
writeFileSync(new URL('./confirmaciones.csv', import.meta.url), rows.map((r) => r.map(csv).join(',')).join('\n') + '\n');
console.log(`✓ ${docs.length} invitaciones · ${si} confirmaron · ${personas} personas → scripts/confirmaciones.csv`);

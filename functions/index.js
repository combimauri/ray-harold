import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import nodemailer from 'nodemailer';

initializeApp();

// Sent through Brevo's SMTP relay. Configured in functions/.env (non-secret)
// and Secret Manager (the key):  npx firebase functions:secrets:set BREVO_SMTP_KEY
const BREVO_SMTP_LOGIN = defineString('BREVO_SMTP_LOGIN');
const SENDER_EMAIL = defineString('SENDER_EMAIL');
const NOTIFY_TO = defineString('NOTIFY_TO');
const BREVO_SMTP_KEY = defineSecret('BREVO_SMTP_KEY');

const SITE = 'https://boda-raysa-harold.web.app';
const GROUPS = { raysa: 'Raysa', harold: 'Harold', amigos: 'Amigos' };

/**
 * Emails the couple whenever a guest submits or changes their RSVP.
 *
 * Only guests set `rsvp.respondidoEn` (to the server time, enforced by the
 * rules), so admin edits in /admin — renaming, changing seats — never send mail.
 */
export const notifyRsvp = onDocumentWritten(
  { document: 'invitados/{id}', region: 'southamerica-east1', secrets: [BREVO_SMTP_KEY] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const answer = after?.rsvp;
    if (!answer?.respondidoEn) return;
    if (before?.rsvp?.respondidoEn?.isEqual(answer.respondidoEn)) return;

    const previous = before?.rsvp || null;
    const totals = await countTotals();
    const { subject, html, text } = compose(after, answer, previous, totals);

    const transport = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: { user: BREVO_SMTP_LOGIN.value(), pass: BREVO_SMTP_KEY.value() },
    });
    await transport.sendMail({
      from: `"Invitación Raysa & Harold" <${SENDER_EMAIL.value()}>`,
      to: NOTIFY_TO.value(),
      subject,
      text,
      html,
    });
    logger.info('RSVP email sent', { guest: event.params.id, asiste: answer.asiste, changed: !!previous });
  },
);

async function countTotals() {
  const snap = await getFirestore().collection('invitados').get();
  const t = { yes: 0, people: 0, no: 0, pending: 0 };
  for (const doc of snap.docs) {
    const r = doc.data().rsvp;
    if (!r) t.pending++;
    else if (r.asiste) {
      t.yes++;
      t.people += r.personas;
    } else t.no++;
  }
  return t;
}

const describe = (r) => (r.asiste ? `Sí asistirá · ${r.personas} ${r.personas === 1 ? 'persona' : 'personas'}` : 'No podrá asistir');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function compose(guest, answer, previous, totals) {
  const name = guest.nombre;
  const verdict = describe(answer);
  const subject = previous
    ? `✏️ ${name} cambió su respuesta: ${verdict}`
    : answer.asiste
      ? `✅ ${name} confirmó asistencia (${answer.personas} de ${guest.pases})`
      : `❌ ${name} no podrá asistir`;

  const rows = [
    ['Invitado', name],
    ['Grupo', GROUPS[guest.grupo] || guest.grupo],
    ['Respuesta', verdict],
    ['Pases', String(guest.pases)],
    ...(previous ? [['Respuesta anterior', describe(previous)]] : []),
    ...(answer.mensaje ? [['Mensaje', `“${answer.mensaje}”`]] : []),
  ];
  const summary = `${totals.people} personas confirmadas (${totals.yes} invitaciones) · ${totals.no} no asisten · ${totals.pending} pendientes`;

  const text = [
    previous ? `${name} cambió su respuesta.` : `${name} respondió la invitación.`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    `Resumen: ${summary}`,
    `Ver todos: ${SITE}/admin`,
  ].join('\n');

  const html = `
<div style="font-family:Georgia,serif;color:#1D2A44;max-width:520px;margin:0 auto;padding:24px;background:#F6F1E7;border-radius:16px">
  <p style="margin:0 0 4px;font:500 12px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#7A5D2E">Raysa &amp; Harold · 14.11.2026</p>
  <h1 style="margin:0 0 20px;font-size:26px;font-weight:600">${esc(previous ? `${name} cambió su respuesta` : `${name} respondió`)}</h1>
  <table style="width:100%;border-collapse:collapse;background:#FCFAF5;border-radius:12px;font:16px/1.5 Helvetica,Arial,sans-serif">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:10px 14px;color:#5A6682;font-size:13px;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:10px 14px">${esc(v)}</td></tr>`,
      )
      .join('')}
  </table>
  <p style="margin:20px 0 0;font:14px/1.5 Helvetica,Arial,sans-serif;color:#3E5780">${esc(summary)}</p>
  <p style="margin:16px 0 0;font:14px Helvetica,Arial,sans-serif"><a href="${SITE}/admin" style="color:#2E4468">Ver todos los invitados →</a></p>
</div>`;

  return { subject, html, text };
}

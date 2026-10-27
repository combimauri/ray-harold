# Raysa & Harold · Invitación

Invitación de boda (Vite + React), implementada desde el proyecto de claude.ai/design
“Invitacion Raysa y Harold” y su design system `HaroldRaysaDesignSystem`.

```bash
npm install
cp .env.example .env                       # configuración web de Firebase
cp functions/.env.example functions/.env   # remitente y destinatarios del aviso por correo
npm run dev
```

`.env`, `functions/.env` y `scripts/invitados.json` no se versionan: la lista de invitados tiene
nombres reales y cada `id` es la llave del enlace personal de esa invitación.
`scripts/invitados.example.json` muestra el formato.

## Firebase (`boda-raysa-harold`)

- **Hosting:** https://boda-raysa-harold.web.app
- **Firestore:** colección `invitados`, un documento por invitación (`nombre`, `pases`, `grupo`, `orden`, `rsvp`).
- **Reglas** (`firestore.rules`): cada invitado solo puede leer su propia invitación (no se puede listar) y solo puede escribir su `rsvp`.

```bash
npm run deploy   # build + firebase deploy (hosting y reglas)
npm run seed     # importación inicial de scripts/invitados.json (solo una vez)
npm run rsvps    # descarga las confirmaciones a scripts/confirmaciones.csv
```

`seed` y `rsvps` usan Application Default Credentials: `gcloud auth application-default login`.
Los invitados se administran desde `/admin`.

## Panel de administración

https://boda-raysa-harold.web.app/admin — lista de invitados con sus respuestas, resumen de
confirmaciones, búsqueda y filtros, agregar / editar / eliminar invitados, copiar el enlace personal
de cada uno, descargar CSV y cambiar la contraseña.

El acceso se controla con el claim `admin` de Firebase Auth (el registro público está desactivado).
Para dar acceso a otra cuenta o restablecer una contraseña olvidada:

```bash
npm run create-admin -- correo@ejemplo.com contraseña-temporal
```

Desde que se usa el panel, Firestore es la fuente de verdad: `npm run seed` ya no se vuelve a ejecutar
(se niega si la colección tiene datos, salvo con `--force`).

## Aviso por correo de cada respuesta

`functions/index.js` (Cloud Function `notifyRsvp`, plan Blaze) envía un correo a `NOTIFY_TO` cada vez
que un invitado responde o cambia su respuesta. Las ediciones hechas desde `/admin` no envían correo.
Se envía por el SMTP de Brevo:

- `functions/.env` → `BREVO_SMTP_LOGIN`, `SENDER_EMAIL` (remitente verificado en Brevo) y `NOTIFY_TO` (destinatarios, separados por coma)
- Secret Manager → `npx firebase functions:secrets:set BREVO_SMTP_KEY`
- Desplegar: `npx firebase deploy --only functions`

## Enlace personalizado

Cada invitado recibe su propio enlace (ver `scripts/enlaces.csv`):

```
https://boda-raysa-harold.web.app/?i=ana-perez-x7k2
```

## Imágenes

En `public/assets/`. Las ilustraciones son WebP con fondo transparente y trazo en `--azul-900`,
generadas a partir de los dibujos originales (fondo removido y márgenes recortados), para que se
integren con la textura de papel. La foto final es `foto-tortoni.jpg`.

## Estructura

- `src/styles/tokens/` — tokens del design system (colores, tipografía, espacio, movimiento)
- `src/ds/` — componentes del design system (core, content, forms)
- `src/App.jsx` — la invitación: portada, invitación, fecha, lugar, itinerario, RSVP, agradecimientos


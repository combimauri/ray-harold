// Creates (or updates) an admin account and grants the `admin` custom claim
// that firestore.rules checks.
//
//   gcloud auth application-default login
//   npm run create-admin -- <email> <initial-password>
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: npm run create-admin -- <email> <contraseña-inicial>');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: 'boda-raysa-harold' });
const auth = getAuth();

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password });
  console.log(`✓ ${email} ya existía; contraseña restablecida`);
} catch (e) {
  if (e.code !== 'auth/user-not-found') throw e;
  user = await auth.createUser({ email, password, emailVerified: true });
  console.log(`✓ ${email} creado`);
}
await auth.setCustomUserClaims(user.uid, { admin: true });
console.log('✓ Permiso de administrador asignado');

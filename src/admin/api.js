import {
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { app, db } from '../firebase.js';

export const GROUPS = [
  { value: 'raysa', label: 'Raysa' },
  { value: 'harold', label: 'Harold' },
  { value: 'amigos', label: 'Amigos' },
];

const auth = getAuth(app);
// Reset emails and Firebase's password-reset page are sent in Spanish.
auth.languageCode = 'es';
const guests = collection(db, 'invitados');

/** Calls back with { user, isAdmin } on every auth change (user null when signed out). */
export function watchAdmin(cb) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return cb({ user: null, isAdmin: false });
    const token = await user.getIdTokenResult();
    cb({ user, isAdmin: token.claims.admin === true });
  });
}

export const login = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);
export const logout = () => signOut(auth);

// Emails a confirmation link to set a new password; after saving it the
// "Continuar" button brings the admin back to /admin.
export const requestPasswordReset = (email) =>
  sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/admin` });

export async function changePassword(current, next) {
  const user = auth.currentUser;
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
  await updatePassword(user, next);
}

export function watchGuests(cb, onError) {
  return onSnapshot(
    guests,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  );
}

// Readable, unguessable id used in the guest's personal link, e.g. "ana-perez-x7k2".
function newGuestId(nombre) {
  const base = nombre
    .replace(/^(sra?|srta)\.\s*/i, '')
    .split(/\s+(?:y|e)\s+|"/)[0]
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `${base || 'invitado'}-${suffix}`;
}

export function addGuest({ nombre, pases, grupo }, orden) {
  return setDoc(doc(guests, newGuestId(nombre)), { nombre: nombre.trim(), pases, grupo, orden });
}

export function updateGuest(guest, { nombre, pases, grupo }) {
  const patch = { nombre: nombre.trim(), pases, grupo };
  // Keep a "yes" RSVP consistent if the number of seats shrinks.
  if (guest.rsvp?.asiste && guest.rsvp.personas > pases) patch['rsvp.personas'] = pases;
  return updateDoc(doc(guests, guest.id), patch);
}

export const deleteGuest = (id) => deleteDoc(doc(guests, id));

export const guestLink = (id) => `${window.location.origin}/?i=${id}`;

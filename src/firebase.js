import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';

// Web config is public by design; access is enforced by firestore.rules.
export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const db = getFirestore(app);

export async function fetchGuest(id) {
  const snap = await getDoc(doc(db, 'invitados', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function saveRsvp(id, { asiste, personas, mensaje }) {
  return updateDoc(doc(db, 'invitados', id), {
    rsvp: { asiste, personas: asiste ? personas : 0, mensaje, respondidoEn: serverTimestamp() },
  });
}

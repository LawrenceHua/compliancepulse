

import { initializeApp as initClient, getApps as getClientApps } from "firebase/app";
import { getAuth as getClientAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Client-side Firebase (for Auth and Firestore)
const clientApp = getClientApps().length === 0 ? initClient(firebaseConfig) : getClientApps()[0];
const auth = getClientAuth(clientApp);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(clientApp);

export { clientApp, auth, googleProvider, db };
export const provider = googleProvider;

// Admin-side Firebase (for server actions — only in server context)
export function getAdminApp() {
  // Lazy import to avoid bundling into client
  if (typeof window !== "undefined") return null;
  try {
    const { initializeApp, getApps, cert } = require("firebase-admin/app");
    const { getAuth } = require("firebase-admin/auth");
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
    return { app: getApps()[0], auth: getAuth(getApps()[0]) };
  } catch {
    return null;
  }
}

export async function verifyToken(idToken: string) {
  const admin = getAdminApp();
  if (!admin) return null;
  return admin.auth.verifyIdToken(idToken);
}

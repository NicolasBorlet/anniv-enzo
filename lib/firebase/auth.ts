import {
  getAuth as getFirebaseAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "./client";

export function getAuth() {
  return getFirebaseAuth(getFirebaseApp());
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(getAuth(), callback);
}

export async function signInAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(getAuth(), email, password);
}

export async function signOutAdmin() {
  return signOut(getAuth());
}

export async function getIdToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

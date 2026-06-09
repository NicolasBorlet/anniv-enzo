import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { isSuperAdminEmail } from "@/lib/admin";

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not configured");
  }

  const serviceAccount = JSON.parse(serviceAccountKey) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  adminApp = initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return adminApp;
}

export async function verifySuperAdminToken(token: string) {
  const decoded = await getAdminAuth(getAdminApp()).verifyIdToken(token);
  if (!isSuperAdminEmail(decoded.email)) {
    throw new Error("Forbidden");
  }
  return decoded;
}

const ALLOWED_STORAGE_PREFIXES = ["gallery/", "guest/", "special/"] as const;
const ALLOWED_UPLOAD_PREFIXES = ["gallery/"] as const;

export function isAllowedStoragePath(path: string): boolean {
  return ALLOWED_STORAGE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function isAllowedUploadPath(path: string): boolean {
  return ALLOWED_UPLOAD_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export async function deleteStorageObject(path: string) {
  if (!isAllowedStoragePath(path)) {
    throw new Error("Invalid path");
  }

  const bucket = getAdminStorage(getAdminApp()).bucket();
  await bucket.file(path).delete();
}

export async function downloadStorageObject(path: string) {
  if (!isAllowedStoragePath(path)) {
    throw new Error("Invalid path");
  }

  const bucket = getAdminStorage(getAdminApp()).bucket();
  const file = bucket.file(path);
  const [exists] = await file.exists();

  if (!exists) {
    throw new Error("Not found");
  }

  const [[buffer], [metadata]] = await Promise.all([
    file.download(),
    file.getMetadata(),
  ]);

  return {
    buffer,
    contentType: metadata.contentType ?? "application/octet-stream",
  };
}

export async function uploadStorageObject(
  path: string,
  buffer: Buffer,
  contentType: string,
) {
  if (!isAllowedUploadPath(path)) {
    throw new Error("Invalid path");
  }

  const bucket = getAdminStorage(getAdminApp()).bucket();
  const file = bucket.file(path);

  await file.save(buffer, {
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000",
    },
  });

  const [metadata] = await file.getMetadata();
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;

  return {
    id: path,
    name: path.split("/").pop() ?? path,
    url,
    uploadedAt: metadata.timeCreated ?? new Date().toISOString(),
    size: Number(metadata.size ?? buffer.length),
  };
}

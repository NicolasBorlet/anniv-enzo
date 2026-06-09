import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { isSuperAdminEmail } from "@/lib/admin";

let adminApp: App | undefined;

type ServiceAccountCredentials = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function parseServiceAccountJson(raw: string): ServiceAccountCredentials {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT credentials are empty");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    try {
      parsed = JSON.parse(Buffer.from(trimmed, "base64").toString("utf8"));
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT credentials are invalid JSON",
      );
    }
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("project_id" in parsed) ||
    !("client_email" in parsed) ||
    !("private_key" in parsed)
  ) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT credentials are missing required fields");
  }

  const serviceAccount = parsed as ServiceAccountCredentials;
  return {
    ...serviceAccount,
    private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
  };
}

function loadServiceAccountCredentials(): ServiceAccountCredentials {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (envKey) {
    return parseServiceAccountJson(envKey);
  }

  const credentialsPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath) {
    const absolutePath = resolve(
      /* turbopackIgnore: true */ process.cwd(),
      credentialsPath,
    );
    if (existsSync(absolutePath)) {
      return parseServiceAccountJson(readFileSync(absolutePath, "utf8"));
    }
  }

  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT is not configured (set FIREBASE_SERVICE_ACCOUNT_PATH locally or FIREBASE_SERVICE_ACCOUNT_KEY on Vercel)",
  );
}

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  const serviceAccount = loadServiceAccountCredentials();

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

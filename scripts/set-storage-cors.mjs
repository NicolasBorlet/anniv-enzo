import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Storage } from "@google-cloud/storage";

const credentialsPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  "./firebase-service-account.json";

const absolutePath = resolve(process.cwd(), credentialsPath);
if (!existsSync(absolutePath)) {
  console.error(`Fichier introuvable : ${absolutePath}`);
  process.exit(1);
}

const credentials = JSON.parse(readFileSync(absolutePath, "utf8"));
const bucketName =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
  `${credentials.project_id}.firebasestorage.app`;

const storage = new Storage({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, "\n"),
  },
});

const cors = [
  {
    origin: ["*"],
    method: ["GET", "HEAD"],
    responseHeader: ["Content-Type", "Content-Length", "Content-Disposition"],
    maxAgeSeconds: 3600,
  },
];

await storage.bucket(bucketName).setCorsConfiguration(cors);
console.log(`CORS configuré pour gs://${bucketName}`);

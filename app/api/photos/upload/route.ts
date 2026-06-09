import { NextResponse } from "next/server";
import {
  isAllowedUploadPath,
  uploadStorageObject,
  verifySuperAdminToken,
} from "@/lib/firebase/admin";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifySuperAdminToken(token);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    if (!IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté" },
        { status: 400 },
      );
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const path = `gallery/${safeName}`;

    if (!isAllowedUploadPath(path)) {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await uploadStorageObject(path, buffer, file.type);

    return NextResponse.json(image);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    if (message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Impossible d'envoyer la photo" },
      { status: 500 },
    );
  }
}

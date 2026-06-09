import { NextResponse } from "next/server";
import {
  deleteStorageObject,
  isAllowedStoragePath,
  verifySuperAdminToken,
} from "@/lib/firebase/admin";

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    await verifySuperAdminToken(token);

    const body = (await request.json()) as { path?: string };
    const path = body.path?.trim();

    if (!path || !isAllowedStoragePath(path)) {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
    }

    await deleteStorageObject(path);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    if (message === "Forbidden") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (message.includes("FIREBASE_SERVICE_ACCOUNT_KEY")) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Impossible de supprimer la photo" },
      { status: 500 },
    );
  }
}

import { downloadStorageObject } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Chemin manquant" }, { status: 400 });
    }

    const { buffer, contentType } = await downloadStorageObject(path);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    if (message === "Invalid path") {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
    }

    if (message === "Not found") {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }

    if (message.includes("FIREBASE_SERVICE_ACCOUNT")) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète" },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Impossible de télécharger la photo" },
      { status: 500 },
    );
  }
}

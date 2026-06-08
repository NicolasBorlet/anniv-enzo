# Anniv Enzo — Galerie photos

Application Next.js pour afficher et partager des photos d'anniversaire via Firebase Storage. Les visiteurs peuvent consulter et envoyer des photos sans créer de compte.

## Fonctionnalités

- **Galerie publique** — affichage en grille responsive avec lightbox
- **Upload sans compte** — glisser-déposer ou sélection de fichiers
- **Easter egg** — accès à une page secrète `/vault` avec des images spéciales
- **Interface soignée** — typographie Bebas Neue + Source Sans 3, mode clair/sombre

## Easter egg

Depuis la page d'accueil, deux façons d'accéder au coffre secret :

1. **Code Konami** : ↑ ↑ ↓ ↓ ← → ← → B A
2. **Mot secret** : tapez `enzo` au clavier (hors champs de saisie)

La page `/vault` affiche les images du dossier `special/` dans Firebase Storage (lecture seule côté app).

## Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Créez un projet (ou utilisez un existant)
3. Activez **Storage** (Cloud Storage)
4. Ajoutez une **application Web** dans Paramètres du projet > Général

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Renseignez les valeurs depuis la config Web Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Structure Storage

Créez deux dossiers à la racine du bucket :

| Dossier   | Usage                                      |
|-----------|--------------------------------------------|
| `gallery/` | Photos publiques (visibles + uploadables) |
| `special/` | Photos secrètes (page easter egg)         |

### 4. Règles de sécurité Storage

Dans Firebase Console > Storage > Règles, utilisez par exemple :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      allow read, write: if true;
    }
    match /special/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

> **Note :** Ces règles sont ouvertes pour un événement privé entre amis. Pour un usage plus strict, limitez les uploads par taille, type MIME, ou ajoutez Firebase App Check.

### 5. Ajouter des images spéciales

Uploadez manuellement des fichiers dans le dossier `special/` via la console Firebase (Storage > Parcourir).

## Démarrage

```bash
bun install
bun dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Scripts

| Commande      | Description              |
|---------------|--------------------------|
| `bun dev`     | Serveur de développement |
| `bun build`   | Build de production      |
| `bun start`   | Serveur de production    |
| `bun lint`    | Lint ESLint              |

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

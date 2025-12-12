# Free Books - Guide de Configuration Mis à Jour

## Changements Apportés

Votre application a été modifiée pour utiliser :
- **Authentification Admin** : Mot de passe unique au lieu d'authentification utilisateur
- **Google Drive** : Les fichiers sont stockés sur Google Drive au lieu du storage
- **Paiement Simplifié** : Les utilisateurs ne créent pas de compte, ils paient directement
- **Base de données Supabase** : Toutes les données restent dans Supabase

---

## Configuration Initiale

### Étape 1 : Initialiser le mot de passe Admin

Avant de pouvoir accéder au dashboard admin, vous devez créer le mot de passe initial.

**Option A : Via l'interface web**
1. Attendez que l'équipe technique initialise le système
2. Accédez à : `/api/init-admin` avec le mot de passe souhaité

**Option B : Via la base de données Supabase**
1. Allez à l'éditeur SQL de Supabase
2. Exécutez ce script :

```sql
-- Hash du mot de passe (remplacez VOTRE_MOT_DE_PASSE par votre mot de passe souhaité)
-- Le système utilise SHA-256
INSERT INTO admin_settings (password_hash, is_primary)
VALUES (
  -- Pour un test simple, utilisez un mot de passe test comme "admin123"
  -- La clé publique sera fournie par l'équipe technique
  'le_hash_sha256_de_votre_mot_de_passe',
  true
);
```

**Pour générer le hash SHA-256** :
- Utilisez un outil en ligne comme [SHA256 Online](https://www.sha256online.com/)
- Ou exécutez en JavaScript :
```javascript
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
// Utilisez : hashPassword('votre_mot_de_passe')
```

### Étape 2 : Configurer Flutterwave

1. Créez un compte sur [dashboard.flutterwave.com](https://dashboard.flutterwave.com/signup)
2. Obtenez votre clé publique dans Settings > API Keys
3. Mettez-à-jour votre fichier `.env` :

```env
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxx
```

Consultez [FLUTTERWAVE_SETUP.md](./FLUTTERWAVE_SETUP.md) pour la configuration du split payment 20%/80%.

---

## Flux Utilisateur

### Pour les Utilisateurs Finaux

1. **Accueil** : Les utilisateurs arrivent sur la page d'accueil
2. **Paiement** : Ils cliquent sur "Accéder à la Bibliothèque"
3. **Email** : Ils entrent leur adresse email
4. **Paiement** : Ils paient 2000 XAF via Flutterwave
5. **Bibliothèque** : Accès immédiat à tous les livres
6. **Lecture/Téléchargement** : Ils peuvent lire et télécharger via Google Drive

**Important** : Les utilisateurs ne créent pas de compte, ils paient juste une fois.

---

## Flux Admin

### 1. Accès au Dashboard

1. Sur la page d'accueil, cliquez sur le bouton **"Admin"** en haut à droite
2. Entrez votre mot de passe
3. Accédez au dashboard

### 2. Gérer les Catégories

1. Dans la section **Catégories** du dashboard
2. Cliquez sur **"Ajouter"**
3. Entrez le nom de la catégorie
4. Cliquez sur **"Ajouter"**

Exemples : Romans, Science-Fiction, Histoire, Sciences, Biographies, etc.

### 3. Ajouter des Livres

Pour ajouter un livre, vous aurez besoin de :
- **Titre** : Nom du livre
- **Description** : Résumé (10-100 mots)
- **Catégorie** : Sélectionner dans le menu déroulant
- **URL de couverture** : Lien image (PNG, JPG)
- **Lien Google Drive** : Lien du fichier PDF

#### Où trouver les URL de couverture ?

**Option 1 : Google Drive**
1. Uploadez une image sur Google Drive
2. Cliquez-droit > Partager
3. Modifiez l'accès à "N'importe qui avec le lien"
4. Copiez le lien
5. Remplacez l'ID par le format : `https://drive.google.com/uc?export=view&id=VOTRE_ID`

**Option 2 : Service d'hébergement d'images**
- [Imgur](https://imgur.com)
- [Pexels](https://www.pexels.com)
- [Unsplash](https://unsplash.com)
- [Pixabay](https://pixabay.com)

#### Comment partager un PDF Google Drive

1. Uploadez votre PDF sur Google Drive
2. Cliquez-droit > Partager
3. Modifiez l'accès à "N'importe qui avec le lien"
4. Copiez le lien de partage
5. Format du lien : `https://drive.google.com/file/d/VOTRE_ID/view?usp=sharing`

#### Exemple complet

```
Titre: Les Misérables
Description: Un chef-d'œuvre de la littérature française racontant l'histoire de Jean Valjean
Catégorie: Romans
URL Couverture: https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f7g8h9i0j
Lien Drive PDF: https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view?usp=sharing
```

### 4. Modifier/Supprimer des Livres

- **Modifier** : Cliquez sur "Modifier", changez les informations, cliquez sur "Modifier"
- **Supprimer** : Cliquez sur "Supprimer", confirmez

---

## Gestion de Google Drive

### Limites et Considérations

- Les fichiers restent accessibles tant qu'ils sont partagés
- Le lien expire si vous le rendez privé
- Google Drive a des limites de bande passante pour les fichiers très téléchargés

### Meilleure Pratique

1. Créez un dossier "Free Books" sur Google Drive
2. Organisez par catégorie
3. Partagez le dossier en lecture pour l'équipe admin
4. Utilisez des liens directs au fichier pour chaque livre

### Comment Modifier un Lien Google Drive

Si un lien cesse de fonctionner :
1. Allez dans le fichier Google Drive
2. Modifiez les paramètres de partage
3. Copiez le nouveau lien
4. Modifiez le livre dans le dashboard
5. Remplacez l'ancien lien par le nouveau

---

## Tableau de Bord Admin - Fonctionnalités Complètes

```
Dashboard Admin
├── Catégories
│   ├── Ajouter une catégorie
│   ├── Afficher la liste
│   └── Supprimer une catégorie
└── Livres
    ├── Ajouter un livre
    ├── Afficher la liste
    ├── Modifier un livre
    └── Supprimer un livre
```

---

## Sécurité

### Mot de Passe Admin

- Changez régulièrement votre mot de passe
- Utilisez un mot de passe fort (minimum 12 caractères)
- Ne partagez pas le mot de passe par email ou chat

### Google Drive

- Assurez-vous que les fichiers sont partagés avec "N'importe qui avec le lien"
- Limitez l'accès en "Lecture" pour éviter les modifications accidentelles
- N'uploadez que des fichiers légaux et autorisés

### Base de Données

- Supabase gère automatiquement la sécurité
- Row Level Security (RLS) est activé
- Les utilisateurs ne peuvent accéder qu'à leurs données

---

## Dépannage

### "Accès refusé au fichier Google Drive"

1. Vérifiez que le lien est public
2. Testez le lien dans un navigateur incognito
3. Re-partagez le fichier si nécessaire

### "Les livres n'apparaissent pas"

1. Vérifiez que les livres sont ajoutés dans le dashboard
2. Rafraîchissez la page (Ctrl + F5)
3. Vérifiez la console du navigateur pour les erreurs

### "Impossible de se connecter en admin"

1. Vérifiez le mot de passe (majuscules/minuscules)
2. Vérifiez que `admin_settings` existe dans la base de données
3. Vérifiez la configuration de Supabase

---

## Mise en Production

Avant de lancer en production :

1. **Testez le paiement** en mode test Flutterwave
2. **Testez l'accès aux fichiers** Google Drive
3. **Vérifiez la couverture** des images
4. **Testez la recherche** et les filtres
5. **Passez Flutterwave en mode live**
6. **Mettez à jour la clé publique** dans `.env`

---

## Support

- Documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
- Documentation Flutterwave : [developer.flutterwave.com](https://developer.flutterwave.com)
- Aide Google Drive : [support.google.com/drive](https://support.google.com/drive)

---

**Votre application est maintenant prête à accueillir vos utilisateurs!**

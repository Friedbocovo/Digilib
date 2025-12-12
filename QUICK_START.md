# Guide de Démarrage Rapide - Free Books

## Avant de Commencer

Assurez-vous d'avoir:
- Node.js 16+ installé
- Un compte Supabase (déjà configuré)
- Un compte Flutterwave
- Une équipe Google Drive pour les fichiers

---

## Étape 1: Initialiser le Mot de Passe Admin (5 min)

### Générer le hash SHA-256 de votre mot de passe

1. Allez sur [SHA256 Online](https://www.sha256online.com/)
2. Entrez votre mot de passe (ex: `admin123` ou un mot de passe fort)
3. Cliquez sur "Encrypt"
4. Copiez le hash généré

### Créer l'administrateur dans Supabase

1. Allez dans [Dashboard Supabase](https://app.supabase.com/)
2. Accédez à votre projet
3. Cliquez sur **SQL Editor** dans le menu latéral
4. Cliquez sur **New Query**
5. Collez ce code et remplacez `HASH_ICI` par votre hash :

```sql
INSERT INTO admin_settings (password_hash, is_primary)
VALUES ('HASH_ICI', true);
```

6. Cliquez sur **Run**
7. Vous devriez voir "Query successful"

---

## Étape 2: Configurer Flutterwave (5 min)

1. Créez un compte sur [dashboard.flutterwave.com](https://dashboard.flutterwave.com/signup)
2. Allez dans **Settings** > **API Keys**
3. Copiez votre **Public Key** en mode test (commence par `FLWPUBK_TEST-`)
4. Ouvrez le fichier `.env` du projet
5. Remplacez:
```
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here
```
par:
```
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx
```
6. Sauvegardez le fichier

---

## Étape 3: Tester l'Application (10 min)

1. Ouvrez un terminal
2. Allez dans le dossier du projet
3. Exécutez:
```bash
npm run dev
```
4. Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur

### Tester le flux complet:

1. **Page d'accueil** : Vérifiez que le bouton "Admin" est visible
2. **Cliquez "Admin"** : Vous devriez voir la page de connexion
3. **Entrez votre mot de passe** : Vous devriez accéder au dashboard
4. **Ajoutez une catégorie** : Essayez "Romans"
5. **Quittez l'admin** : Vous devriez revenir à l'accueil

---

## Étape 4: Ajouter Votre Premier Livre (15 min)

### Préparer les fichiers

#### 1. Couverture du livre

**Option A : Google Drive**
- Uploadez une image PNG ou JPG sur Google Drive
- Cliquez-droit > Partagez
- Modifiez l'accès à "N'importe qui avec le lien"
- Copiez l'ID du fichier (entre `/d/` et `/`)
- Format du lien : `https://drive.google.com/uc?export=view&id=ID_ICI`

**Option B : Service gratuit**
- Utilisez [Pexels](https://www.pexels.com) ou [Unsplash](https://unsplash.com)
- Copiez l'URL directe de l'image

#### 2. Fichier PDF

- Uploadez votre PDF sur Google Drive
- Cliquez-droit > Partagez
- Modifiez l'accès à "N'importe qui avec le lien"
- Copiez le lien de partage
- Format : `https://drive.google.com/file/d/ID_ICI/view?usp=sharing`

### Ajouter le livre dans l'admin

1. Allez sur [http://localhost:5173](http://localhost:5173)
2. Cliquez "Admin"
3. Entrez votre mot de passe
4. Dans la section "Livres", cliquez "Ajouter"
5. Remplissez les champs:
   - **Titre** : Nom du livre
   - **Description** : Résumé court
   - **Catégorie** : Sélectionnez "Romans"
   - **URL Couverture** : Collez le lien de l'image
   - **Lien Google Drive** : Collez le lien du PDF
6. Cliquez "Ajouter"

---

## Étape 5: Tester le Paiement (10 min)

1. Allez à [http://localhost:5173](http://localhost:5173)
2. Cliquez "Accéder à la Bibliothèque"
3. Entrez une adresse email
4. Cliquez "Continuer"
5. Cliquez "Payer Maintenant"
6. Utilisez la carte de test Flutterwave :

```
Numéro: 4187427415564246
CVV: 828
Expiration: 09/32
Pin: 3310
OTP: 12345
```

7. Complétez le paiement
8. Vous devriez être redirigé vers la bibliothèque
9. Vous devriez voir votre livre
10. Cliquez "Accéder au fichier" pour ouvrir le PDF dans Google Drive

---

## Checklist Avant Production

- [ ] Mot de passe admin créé
- [ ] Flutterwave configuré (mode test)
- [ ] Au moins 1 livre ajouté
- [ ] Paiement testé avec succès
- [ ] Accès aux fichiers Google Drive fonctionnel
- [ ] Images de couverture s'affichent
- [ ] Recherche et filtres fonctionnent

---

## Passage en Production

Quand vous êtes prêt:

1. **Flutterwave Live Mode**:
   - Dans le dashboard Flutterwave, passez en mode "Live"
   - Obtenez votre clé publique live
   - Mettez à jour `.env`:
   ```
   VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-xxxxxxxxxxxxx
   ```

2. **Build de production**:
   ```bash
   npm run build
   ```

3. **Déployer** sur votre serveur/hosting

---

## Support Rapide

| Problème | Solution |
|----------|----------|
| Accès Google Drive refusé | Vérifiez que le lien est public |
| Paiement échoue | Utilisez la carte de test Flutterwave |
| Admin mot de passe invalide | Regénérez le hash SHA-256 |
| Images ne s'affichent pas | Vérifiez l'URL et l'accès public |

---

**Vous êtes maintenant prêt! Bonne chance avec Free Books!**

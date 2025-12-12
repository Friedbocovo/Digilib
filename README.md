# Free Books

Application web de bibliothèque numérique avec système de paiement Flutterwave et accès via Google Drive.

## Nouvelles Fonctionnalités

- Accès utilisateur simplifié (pas de création de compte)
- Paiement unique pour accès illimité
- Authentification admin par mot de passe
- Intégration Google Drive pour les fichiers
- Split payment Flutterwave (20%/80%)

## Démarrage Rapide

### 1. Configuration du Mot de Passe Admin

Consultez le fichier `init-admin.sql` pour initialiser votre mot de passe administrateur.

### 2. Configuration de Flutterwave

```env
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx
```

Consultez `FLUTTERWAVE_SETUP.md` pour la configuration complète du split payment.

### 3. Démarrer l'Application

```bash
npm install
npm run dev
```

L'application sera disponible à `http://localhost:5173`

## Structure

- **Page d'accueil** : Présentation et bouton d'accès
- **Page de paiement** : Flux de paiement Flutterwave
- **Bibliothèque** : Affichage des livres avec accès Google Drive
- **Admin** : Gestion des livres et catégories

## Flux d'Utilisation

### Utilisateurs
1. Cliquez "Accéder à la Bibliothèque"
2. Entrez votre email
3. Payez 2000 XAF
4. Accédez à la bibliothèque
5. Lisez/téléchargez via Google Drive

### Admin
1. Cliquez "Admin"
2. Entrez votre mot de passe
3. Gérez les catégories et livres

## Documentation

- [SETUP.md](./SETUP.md) - Guide de configuration détaillé
- [FLUTTERWAVE_SETUP.md](./FLUTTERWAVE_SETUP.md) - Configuration du paiement

## Technologies

- React 18 + TypeScript
- Vite
- Supabase (base de données)
- Flutterwave (paiement)
- Google Drive (stockage fichiers)

## Déploiement

Application prête pour la production. Passez Flutterwave en mode live et mettez à jour les variables d'environnement.

---

**Consultez SETUP.md pour la guide complet.**

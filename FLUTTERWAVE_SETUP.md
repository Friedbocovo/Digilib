# Configuration Flutterwave - Split Payment (20% / 80%)

Ce guide vous explique comment configurer Flutterwave pour diviser automatiquement les paiements entre deux comptes.

## Étape 1 : Créer un compte Flutterwave

1. Allez sur [https://dashboard.flutterwave.com/signup](https://dashboard.flutterwave.com/signup)
2. Remplissez le formulaire d'inscription
3. Vérifiez votre email
4. Connectez-vous à votre dashboard

## Étape 2 : Obtenir votre clé publique

1. Dans le dashboard, allez dans **Settings** (icône d'engrenage)
2. Cliquez sur **API Keys** dans le menu latéral
3. Vous verrez deux environnements :
   - **Test Mode** : Pour les tests (recommandé au début)
   - **Live Mode** : Pour la production

4. Copiez votre **Public Key** (commence par `FLWPUBK_TEST-` pour le mode test)

5. Collez-la dans le fichier `.env` de votre projet :
```env
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxxxx
```

## Étape 3 : Configurer le Split Payment (20% / 80%)

Flutterwave offre deux méthodes pour diviser les paiements :

### Méthode 1 : Subaccounts (Recommandée)

#### 1. Créer deux sous-comptes

Dans votre dashboard Flutterwave :

1. Allez dans **Settings** > **Subaccounts**
2. Cliquez sur **Create Subaccount**

**Pour le compte 1 (20%)** :
- Business Name : "Compte 1 - 20%"
- Bank : Sélectionnez la banque
- Account Number : Numéro de compte 1
- Split Type : **Percentage**
- Split Value : **20**

**Pour le compte 2 (80%)** :
- Business Name : "Compte 2 - 80%"
- Bank : Sélectionnez la banque
- Account Number : Numéro de compte 2
- Split Type : **Percentage**
- Split Value : **80**

#### 2. Notez les IDs des subaccounts

Après création, vous verrez les IDs (format : `RS_xxxxxxxxxxxxx`)

#### 3. Modifier le code de paiement

Dans `src/pages/PaymentPage.tsx`, modifiez la configuration :

```typescript
const config = {
  public_key: FLUTTERWAVE_PUBLIC_KEY,
  tx_ref: `FRB-${Date.now()}-${user?.id}`,
  amount: LIBRARY_ACCESS_PRICE,
  currency: 'XAF',
  payment_options: 'card,mobilemoney,ussd',
  subaccounts: [
    {
      id: 'RS_xxxxxxxxxxxxx', // ID du compte 1 (20%)
    },
    {
      id: 'RS_yyyyyyyyyyyyy', // ID du compte 2 (80%)
    }
  ],
  customer: {
    email: user?.email || '',
    phone_number: '0000000000',
    name: user?.email?.split('@')[0] || 'User',
  },
  customizations: {
    title: 'Free Books',
    description: 'Accès illimité à la bibliothèque',
    logo: 'https://www.example.com/logo.png',
  },
  meta: {
    user_id: user?.id,
  },
}
```

### Méthode 2 : Split Payment Configuration

#### 1. Créer une configuration de split

Dans votre dashboard :

1. Allez dans **Settings** > **Payment Plans**
2. Créez un nouveau plan avec split
3. Configurez les pourcentages (20% et 80%)
4. Notez l'ID du plan

#### 2. Utiliser le plan dans le code

```typescript
const config = {
  public_key: FLUTTERWAVE_PUBLIC_KEY,
  tx_ref: `FRB-${Date.now()}-${user?.id}`,
  amount: LIBRARY_ACCESS_PRICE,
  currency: 'XAF',
  payment_options: 'card,mobilemoney,ussd',
  payment_plan: 'VOTRE_PLAN_ID', // Ajoutez cette ligne
  // ... reste de la configuration
}
```

## Étape 4 : Tester le paiement

1. Assurez-vous d'être en **Test Mode**
2. Utilisez les cartes de test Flutterwave :

### Cartes de test

**Carte de test réussie** :
```
Card Number: 4187427415564246
CVV: 828
Expiry Date: 09/32
Pin: 3310
OTP: 12345
```

**Carte de test échouée** :
```
Card Number: 5531886652142950
CVV: 564
Expiry Date: 09/32
Pin: 3310
OTP: 12345
```

3. Effectuez un paiement test
4. Vérifiez dans le dashboard que le split a bien fonctionné

## Étape 5 : Passer en Production

Quand tout fonctionne en mode test :

1. Dans le dashboard, passez en **Live Mode**
2. Vérifiez votre identité (KYC) si nécessaire
3. Copiez votre **Live Public Key**
4. Remplacez la clé dans `.env` :
```env
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE-xxxxxxxxxxxxxxxxxx
```
5. Recréez vos subaccounts en Live Mode avec les vrais comptes bancaires
6. Testez avec de vrais paiements de faible montant

## Vérification des Paiements

Dans le dashboard Flutterwave :

1. Allez dans **Transactions**
2. Cliquez sur une transaction
3. Vérifiez la section **Split Details**
4. Vous devriez voir :
   - 20% vers le compte 1
   - 80% vers le compte 2

## FAQ

### Comment modifier les pourcentages ?

Modifiez les valeurs dans la configuration des subaccounts ou créez une nouvelle configuration de split.

### Les frais Flutterwave sont-ils déduits avant ou après le split ?

Les frais sont généralement déduits du montant total avant le split. Vérifiez votre contrat Flutterwave.

### Puis-je split vers plus de 2 comptes ?

Oui, vous pouvez ajouter autant de subaccounts que nécessaire dans le tableau.

### Le split fonctionne-t-il avec Mobile Money ?

Oui, le split fonctionne avec tous les modes de paiement (carte, mobile money, USSD, etc.).

## Support

- Documentation Flutterwave : [https://developer.flutterwave.com/docs/split-payment](https://developer.flutterwave.com/docs/split-payment)
- Support Flutterwave : support@flutterwave.com
- Live Chat : Disponible dans le dashboard

## Notes Importantes

⚠️ **Sécurité** :
- Ne partagez jamais votre Secret Key
- Utilisez uniquement la Public Key dans le frontend
- Stockez la Secret Key uniquement côté serveur si nécessaire

⚠️ **Légal** :
- Assurez-vous d'avoir l'autorisation des propriétaires des comptes bancaires
- Respectez les réglementations locales sur les paiements
- Conservez des registres des transactions

✅ **Bonnes Pratiques** :
- Testez toujours en mode test d'abord
- Vérifiez les webhooks pour les confirmations de paiement
- Gardez une trace de tous les split payments dans votre base de données

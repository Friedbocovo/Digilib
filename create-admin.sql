-- Script pour créer un administrateur
-- Exécutez ce script dans l'éditeur SQL de Supabase après avoir créé un compte utilisateur

-- Remplacez 'votre_email@example.com' par l'email de votre compte
UPDATE profiles
SET is_admin = true
WHERE email = 'votre_email@example.com';

-- Vérifier que le compte est bien admin
SELECT id, email, is_admin, has_paid
FROM profiles
WHERE email = 'votre_email@example.com';

-- Script pour initialiser le mot de passe administrateur
-- ATTENTION: Ce script doit être exécuté UNE SEULE FOIS

-- Étape 1 : Générez le hash SHA-256 de votre mot de passe
-- Visitez : https://www.sha256online.com/
-- Entrez votre mot de passe (ex: admin123)
-- Copiez le hash SHA-256 généré

-- Étape 2 : Remplacez 'VOTRE_HASH_SHA256_ICI' par le hash que vous avez copié
-- Par exemple, si votre mot de passe est "admin123"
-- Le hash SHA-256 est : "0192023a7bbd73250516f069df18b500"

-- Étape 3 : Exécutez ce script dans l'éditeur SQL de Supabase

INSERT INTO admin_settings (password_hash, is_primary, created_at, updated_at)
VALUES (
  'VOTRE_HASH_SHA256_ICI',
  true,
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- Vérification : exécutez cette requête pour confirmer que l'admin a été créé
-- SELECT id, is_primary, created_at FROM admin_settings;

-- Données d'exemple pour démarrer rapidement
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Insérer des catégories d'exemple
INSERT INTO categories (name) VALUES
  ('Romans'),
  ('Science-Fiction'),
  ('Histoire'),
  ('Sciences'),
  ('Biographies'),
  ('Développement Personnel'),
  ('Littérature Africaine'),
  ('Poésie'),
  ('Philosophie'),
  ('Économie')
ON CONFLICT (name) DO NOTHING;

-- 2. Vérifier que les catégories ont été créées
SELECT * FROM categories ORDER BY name;

-- Note: Les livres doivent être ajoutés via le Dashboard Admin
-- car ils nécessitent l'upload de fichiers (couvertures et PDFs)

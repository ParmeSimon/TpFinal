-- Avatar de profil : stocké en data URL (image redimensionnée côté client),
-- d'où le type TEXT plutôt qu'une URL courte.
ALTER TABLE users ADD COLUMN avatar_url TEXT;
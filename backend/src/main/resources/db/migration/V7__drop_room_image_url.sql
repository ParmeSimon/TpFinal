-- La colonne image_url n'est plus utilisée : les photos des salles passent
-- désormais par les fichiers rattachés (table room_files). On retire ce résidu.
ALTER TABLE rooms DROP COLUMN image_url;
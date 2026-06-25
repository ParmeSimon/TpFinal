-- Les salles seedées avaient des photos "par défaut" codées en dur dans le front
-- (mapping par nom). On les transforme en vrais fichiers rattachés (catégorie PHOTO),
-- pour qu'elles apparaissent dans la gestion admin et soient supprimables.
--
-- L'URL pointe vers un asset statique du front (/assets/...), pas vers /api/uploads :
-- supprimer la fiche n'efface donc pas l'image partagée, elle retire juste le lien.
-- created_at légèrement croissant (base 2025) pour garder l'ordre de la galerie
-- (1re photo = couverture) et passer avant tout futur upload.
INSERT INTO room_files (room_id, url, original_name, content_type, size_bytes, category, created_at)
SELECT r.id, v.url, v.original_name, v.content_type, 0, 'PHOTO',
       TIMESTAMP '2025-01-01 00:00:00' + (v.ord * INTERVAL '1 second')
FROM rooms r
JOIN (VALUES
    ('Amphi A',          1, '/assets/AMPHI1.png',     'AMPHI1.png',     'image/png'),
    ('Amphi A',          2, '/assets/AMPHI2.png',     'AMPHI2.png',     'image/png'),
    ('Amphi A',          3, '/assets/AMPHI3.png',     'AMPHI3.png',     'image/png'),
    ('Amphi A',          4, '/assets/AMPHI4.png',     'AMPHI4.png',     'image/png'),
    ('Salle 101 - Lab',  5, '/assets/SALLEB_1.jpg',   'SALLEB_1.jpg',   'image/jpeg'),
    ('Salle 101 - Lab',  6, '/assets/SALLEB_2.jpg',   'SALLEB_2.jpg',   'image/jpeg'),
    ('Salle 101 - Lab',  7, '/assets/SALLEB_3.jpg',   'SALLEB_3.jpg',   'image/jpeg'),
    ('Salle 101 - Lab',  8, '/assets/SALLEB_4.jpg',   'SALLEB_4.jpg',   'image/jpeg'),
    ('Salle 204',        9, '/assets/SALLE204_1.png', 'SALLE204_1.png', 'image/png'),
    ('Salle 204',       10, '/assets/SALLE204_2.png', 'SALLE204_2.png', 'image/png'),
    ('Salle 204',       11, '/assets/SALLE204_3.png', 'SALLE204_3.png', 'image/png'),
    ('Salle 204',       12, '/assets/SALLE204_4.png', 'SALLE204_4.png', 'image/png'),
    ('Box Réunion 1',   13, '/assets/BOXREU1.png',    'BOXREU1.png',    'image/png'),
    ('Box Réunion 1',   14, '/assets/BOXREU2.png',    'BOXREU2.png',    'image/png'),
    ('Box Réunion 1',   15, '/assets/BOXREU3.png',    'BOXREU3.png',    'image/png'),
    ('Box Réunion 1',   16, '/assets/BOXREU4.png',    'BOXREU4.png',    'image/png'),
    ('Box Réunion 2',   17, '/assets/SALLEA_1.jpg',   'SALLEA_1.jpg',   'image/jpeg'),
    ('Box Réunion 2',   18, '/assets/SALLEA_2.jpg',   'SALLEA_2.jpg',   'image/jpeg'),
    ('Box Réunion 2',   19, '/assets/SALLEA_3.jpg',   'SALLEA_3.jpg',   'image/jpeg'),
    ('Box Réunion 2',   20, '/assets/SALLEA_4.jpg',   'SALLEA_4.jpg',   'image/jpeg')
) AS v(room_name, ord, url, original_name, content_type)
  ON r.name = v.room_name;
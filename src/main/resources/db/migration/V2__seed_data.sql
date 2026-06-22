INSERT INTO equipments (name) VALUES ('Écran 4K'),
    ('Tableau Blanc'),
    ('Vidéoprojecteur'),
    ('Tableau Blanc'),
    ('Système de Visio');


INSERT INTO users (email, password, first_name, last_name, is_active) VALUES
    ('admin.principal@ekod.school', '$2a$10$7R0ZfD7325W7hM6Jk9eUeu08OByGexH8YhI6236ZlWqgEmsH6hR0.', 'Jean', 'Dupont', true),
    ('admin.secondaire@ekod.school', '$2a$10$7R0ZfD7325W7hM6Jk9eUeu08OByGexH8YhI6236ZlWqgEmsH6hR0.', 'Claire', 'Rousseau', true),
    ('prof.lenny@ekod.school', '$2a$10$7R0ZfD7325W7hM6Jk9eUeu08OByGexH8YhI6236ZlWqgEmsH6hR0.', 'Lenny', 'Louis', true),
    ('prof.sophie@ekod.school', '$2a$10$7R0ZfD7325W7hM6Jk9eUeu08OByGexH8YhI6236ZlWqgEmsH6hR0.', 'Sophie', 'Durand', true),
    ('etudiant.thomas@ekod.school', '$2a$10$7R0ZfD7325W7hM6Jk9eUeu08OByGexH8YhI6236ZlWqgEmsH6hR0.', 'Thomas', 'Martin', true),
    ('etudiant.marie@ekod.school', '$2a$10$7R0ZfD7325W7hM6Jk9eUeu08OByGexH8YhI6236ZlWqgEmsH6hR0.', 'Marie', 'Bernard', true);

INSERT INTO user_roles (user_id, role) VALUES
    (1, 'ADMIN'),
    (2, 'ADMIN'),
    (3, 'TEACHER'),
    (4, 'TEACHER'),
    (5, 'STUDENT'),
    (6, 'STUDENT');

INSERT INTO rooms (name, capacity, description, is_available, image_url) VALUES
    ('Amphi A', 50, 'Grand amphithéâtre principal situé au rez-de-chaussée pour les cours magistraux.', true, 'https://images.ekod.school/rooms/amphi-a.jpg'),
    ('Salle 101 - Lab', 15, 'Salle informatique équipée pour les travaux pratiques et le développement.', true, 'https://images.ekod.school/rooms/salle-101.jpg'),
    ('Salle 204', 25, 'Salle de cours standard située au deuxième étage.', true, 'https://images.ekod.school/rooms/salle-204.jpg'),
    ('Box Réunion 1', 4, 'Petit espace de travail collaboratif pour les projets de groupe.', true, 'https://images.ekod.school/rooms/box-1.jpg'),
    ('Box Réunion 2', 6, 'Espace de réunion équipé d un système de visioconférence.', true, 'https://images.ekod.school/rooms/box-2.jpg');

INSERT INTO room_equipments (room_id, equipment_id) VALUES
    (1, 3),
    (1, 4),
    (2, 1),
    (2, 2),
    (3, 3),
    (4, 2),
    (5, 1),
    (5, 4);

INSERT INTO bookings (user_id, room_id, start_time, end_time, purpose, status) VALUES
    (5, 2, '2026-06-01 09:00:00', '2026-06-01 12:00:00', 'Sprint Planning Projet Annuel', 'CONFIRMED'),
    (6, 4, '2026-06-01 14:00:00', '2026-06-01 16:00:00', 'Révision examens Java', 'PENDING'),
    (3, 1, '2026-06-02 10:00:00', '2026-06-02 13:00:00', 'Cours Approfondir Java et Spring', 'CONFIRMED'),
    (4, 5, '2026-06-02 14:00:00', '2026-06-02 17:00:00', 'Soutenance de stage', 'CONFIRMED');
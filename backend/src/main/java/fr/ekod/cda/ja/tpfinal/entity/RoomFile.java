package fr.ekod.cda.ja.tpfinal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Fichier (photo ou document) rattaché à une salle et stocké sur disque local.
 * Seules les métadonnées vivent en base ; le binaire est sur le système de fichiers.
 */
@Entity
@Table(name = "room_files")
@Getter
@Setter
@NoArgsConstructor
public class RoomFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /** URL publique de service, ex. /api/uploads/rooms/12/<uuid>.pdf */
    @Column(nullable = false, length = 512)
    private String url;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "content_type", length = 150)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomFileCategory category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
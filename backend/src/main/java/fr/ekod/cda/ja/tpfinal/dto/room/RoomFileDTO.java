package fr.ekod.cda.ja.tpfinal.dto.room;

import fr.ekod.cda.ja.tpfinal.entity.RoomFileCategory;

import java.time.LocalDateTime;

public record RoomFileDTO(
        Long id,
        String url,
        String originalName,
        String contentType,
        long sizeBytes,
        RoomFileCategory category,
        LocalDateTime createdAt
) {}
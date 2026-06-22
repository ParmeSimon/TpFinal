package fr.ekod.cda.ja.tpfinal.dto.room;

import java.time.LocalDateTime;
import java.util.List;

public record RoomDTO(
        Long id,
        String name,
        Integer capacity,
        String description,
        boolean available,
        String imageUrl,
        List<String> equipments,   // les noms des équipements liés
        LocalDateTime createdAt
) {}
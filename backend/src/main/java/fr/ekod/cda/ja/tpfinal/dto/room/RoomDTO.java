package fr.ekod.cda.ja.tpfinal.dto.room;

import java.time.LocalDateTime;
import java.util.List;

public record RoomDTO(
        Long id,
        String name,
        Integer capacity,
        String description,
        boolean available,
        boolean currentlyBooked,
        List<String> equipments,   // les noms des équipements liés
        LocalDateTime createdAt,
        List<String> photoUrls     // photos uploadées par l'admin (galerie), peut être vide
) {}
package fr.ekod.cda.ja.tpfinal.dto.booking;

import java.time.LocalDateTime;

public record BookingDTO(
        Long id,
        Long roomId,
        String roomName,
        Long userId,
        String userEmail,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String purpose,
        String status,
        LocalDateTime createdAt
) {}
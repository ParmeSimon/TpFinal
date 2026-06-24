package fr.ekod.cda.ja.tpfinal.dto.booking;

import java.time.LocalDateTime;

public record BookingSummaryDTO(
        Long id,
        Long roomId,
        String roomName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status
) {}
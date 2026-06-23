package fr.ekod.cda.ja.tpfinal.dto;

public record PublicStatsDTO(
        long totalRooms,
        long availableRooms,
        long totalBookings,
        long confirmedBookings
) {}
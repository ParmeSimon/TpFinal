package fr.ekod.cda.ja.tpfinal.dto.booking;

import java.time.LocalDateTime;

/**
 * Créneau occupé exposé publiquement pour le planning d'une salle.
 * Volontairement minimal : pas d'identité du réservant ni de motif.
 */
public record PublicBookingSlotDTO(
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status
) {}
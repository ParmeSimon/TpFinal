package fr.ekod.cda.ja.tpfinal.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Admin edit of any booking (room, slot, purpose, attendees).
 * Status is preserved and changed via the confirm/reject/cancel endpoints.
 */
public record UpdateBookingDTO(

        @NotNull(message = "L'identifiant de la salle est obligatoire")
        Long roomId,

        @NotNull(message = "La date de début est obligatoire")
        LocalDateTime startTime,

        @NotNull(message = "La date de fin est obligatoire")
        LocalDateTime endTime,

        @Size(max = 255, message = "Le motif ne doit pas dépasser 255 caractères")
        String purpose,

        @Positive(message = "Le nombre de participants doit être supérieur à 0")
        Integer attendees
) {}

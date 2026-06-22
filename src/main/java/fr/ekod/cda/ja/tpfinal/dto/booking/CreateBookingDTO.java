package fr.ekod.cda.ja.tpfinal.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateBookingDTO(

        @NotNull(message = "L'identifiant de la salle est obligatoire")
        Long roomId,

        @NotNull(message = "La date de début est obligatoire")
        @Future(message = "La réservation ne peut pas être dans le passé")
        LocalDateTime startTime,

        @NotNull(message = "La date de fin est obligatoire")
        @Future(message = "La date de fin doit être dans le futur")
        LocalDateTime endTime,

        @Size(max = 255, message = "Le motif ne doit pas dépasser 255 caractères")
        String purpose
) {}
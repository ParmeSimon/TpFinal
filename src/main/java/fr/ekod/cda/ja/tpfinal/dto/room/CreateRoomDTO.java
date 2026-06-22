package fr.ekod.cda.ja.tpfinal.dto.room;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateRoomDTO(

        @NotBlank(message = "Le nom de la salle est obligatoire")
        @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
        String name,

        @NotNull(message = "La capacité est obligatoire")
        @Min(value = 1, message = "La capacité doit être d'au moins 1 personne")
        Integer capacity,

        String description,

        boolean available,

        @Size(max = 255, message = "L'URL de l'image ne doit pas dépasser 255 caractères")
        String imageUrl,

        List<Long> equipmentIds   // on référence des équipements existants par leur id
) {}
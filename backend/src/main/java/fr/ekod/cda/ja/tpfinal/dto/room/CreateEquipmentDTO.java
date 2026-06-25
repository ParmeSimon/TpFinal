package fr.ekod.cda.ja.tpfinal.dto.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateEquipmentDTO(

        @NotBlank(message = "Le nom de l'équipement est obligatoire")
        @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
        String name
) {}
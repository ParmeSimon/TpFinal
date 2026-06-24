package fr.ekod.cda.ja.tpfinal.dto.auth;

import fr.ekod.cda.ja.tpfinal.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UpdateUserDTO(

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 40, message = "Le prénom ne doit pas dépasser 40 caractères")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 40, message = "Le nom ne doit pas dépasser 40 caractères")
        String lastName,

        @NotEmpty(message = "Vous devez remplir un rôle")
        Set<Role> roles,

        @NotNull
        Boolean active

) {}
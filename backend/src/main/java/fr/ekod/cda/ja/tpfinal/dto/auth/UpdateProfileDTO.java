package fr.ekod.cda.ja.tpfinal.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Mise à jour par l'utilisateur de son propre profil.
 * Ne touche ni au rôle, ni à l'activation, ni à l'email (réservés à l'admin).
 * {@code avatarUrl} est une data URL (image redimensionnée côté client) ou null pour aucune photo.
 */
public record UpdateProfileDTO(

        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 40, message = "Le prénom ne doit pas dépasser 40 caractères")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 40, message = "Le nom ne doit pas dépasser 40 caractères")
        String lastName,

        @Size(max = 1_500_000, message = "L'image est trop volumineuse")
        String avatarUrl

) {}
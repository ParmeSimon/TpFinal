package fr.ekod.cda.ja.tpfinal.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Changement de mot de passe par l'utilisateur lui-même.
 * Le mot de passe actuel est exigé et vérifié pour empêcher qu'un token volé
 * ne suffise à verrouiller un compte.
 */
public record ChangePasswordDTO(

        @NotBlank(message = "Le mot de passe actuel est obligatoire")
        String currentPassword,

        @NotBlank(message = "Le nouveau mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        String newPassword

) {}
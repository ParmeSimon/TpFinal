package fr.ekod.cda.ja.tpfinal.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequestDTO(

        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {
}

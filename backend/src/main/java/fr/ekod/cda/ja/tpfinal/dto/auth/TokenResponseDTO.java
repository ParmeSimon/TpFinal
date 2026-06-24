package fr.ekod.cda.ja.tpfinal.dto.auth;

public record TokenResponseDTO(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn
) {
}

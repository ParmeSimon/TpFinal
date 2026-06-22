package fr.ekod.cda.ja.tpfinal.dto.auth;

import fr.ekod.cda.ja.tpfinal.entity.Role;


public record UserDTO(
        Integer id,
        String firstName,
        String lastName,
        String email,
        Role role
) {
}

package fr.ekod.cda.ja.tpfinal.dto.auth;

import fr.ekod.cda.ja.tpfinal.entity.Role;

import java.util.Set;


public record UserDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        Set<Role> roles,
        boolean active,
        String avatarUrl
) {
}
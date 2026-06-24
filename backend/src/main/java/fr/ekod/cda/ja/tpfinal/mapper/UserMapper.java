package fr.ekod.cda.ja.tpfinal.mapper;

import fr.ekod.cda.ja.tpfinal.dto.auth.RegisterRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.UserDTO;
import fr.ekod.cda.ja.tpfinal.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDTO toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User toEntity(RegisterRequestDTO dto);
}
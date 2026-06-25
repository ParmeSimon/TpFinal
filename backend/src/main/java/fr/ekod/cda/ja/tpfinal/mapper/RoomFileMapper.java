package fr.ekod.cda.ja.tpfinal.mapper;

import fr.ekod.cda.ja.tpfinal.dto.room.RoomFileDTO;
import fr.ekod.cda.ja.tpfinal.entity.RoomFile;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomFileMapper {

    RoomFileDTO toDto(RoomFile file);

    List<RoomFileDTO> toDtoList(List<RoomFile> files);
}
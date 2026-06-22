package fr.ekod.cda.ja.tpfinal.mapper;

import fr.ekod.cda.ja.tpfinal.dto.room.CreateRoomDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.RoomDTO;
import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import fr.ekod.cda.ja.tpfinal.entity.Room;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoomMapper {

    RoomDTO toDto(Room room);

    List<RoomDTO> toDtoList(List<Room> rooms);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "equipments", ignore = true) // résolus dans le service via equipmentIds
    Room toEntity(CreateRoomDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "equipments", ignore = true)
    void updateRoomFromDto(CreateRoomDTO dto, @MappingTarget Room room);

    default String equipmentName(Equipment equipment) {
        return equipment != null ? equipment.getName() : null;
    }
}
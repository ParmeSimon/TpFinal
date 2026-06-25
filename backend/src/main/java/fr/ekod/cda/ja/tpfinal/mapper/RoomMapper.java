package fr.ekod.cda.ja.tpfinal.mapper;

import fr.ekod.cda.ja.tpfinal.dto.room.CreateRoomDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.RoomDTO;
import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import fr.ekod.cda.ja.tpfinal.entity.Room;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoomMapper {

    @Mapping(target = "currentlyBooked", ignore = true)
    @Mapping(target = "photoUrls", ignore = true)
    RoomDTO toDto(Room room);

    List<RoomDTO> toDtoList(List<Room> rooms);

    default RoomDTO toDto(Room room, boolean currentlyBooked, List<String> photoUrls) {
        RoomDTO base = toDto(room);
        return new RoomDTO(
                base.id(),
                base.name(),
                base.capacity(),
                base.description(),
                base.available(),
                currentlyBooked,
                base.imageUrl(),
                base.equipments(),
                base.createdAt(),
                photoUrls == null ? List.of() : photoUrls
        );
    }

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
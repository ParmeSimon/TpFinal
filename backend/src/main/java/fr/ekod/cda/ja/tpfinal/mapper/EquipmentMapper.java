package fr.ekod.cda.ja.tpfinal.mapper;

import fr.ekod.cda.ja.tpfinal.dto.room.EquipmentDTO;
import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EquipmentMapper {

    EquipmentDTO toDto(Equipment equipment);

    List<EquipmentDTO> toDtoList(List<Equipment> equipments);
}
package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.room.CreateRoomDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.RoomDTO;
import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import fr.ekod.cda.ja.tpfinal.entity.Room;
import fr.ekod.cda.ja.tpfinal.mapper.RoomMapper;
import fr.ekod.cda.ja.tpfinal.repository.EquipmentRepository;
import fr.ekod.cda.ja.tpfinal.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final EquipmentRepository equipmentRepository;
    private final RoomMapper roomMapper;

    public List<RoomDTO> findAll() {
        return roomMapper.toDtoList(roomRepository.findAll());
    }

    public List<RoomDTO> findAvailable() {
        return roomMapper.toDtoList(roomRepository.findByAvailableTrue());
    }

    public RoomDTO findById(Long id) {
        return roomMapper.toDto(getRoomOrThrow(id));
    }

    @Transactional
    public RoomDTO create(CreateRoomDTO dto) {
        if (roomRepository.existsByName(dto.name())) {
            throw new IllegalArgumentException("Une salle avec ce nom existe déjà");
        }
        Room room = roomMapper.toEntity(dto);
        room.setEquipments(resolveEquipments(dto.equipmentIds()));
        return roomMapper.toDto(roomRepository.save(room));
    }

    @Transactional
    public RoomDTO update(Long id, CreateRoomDTO dto) {
        Room room = getRoomOrThrow(id);
        if (!room.getName().equals(dto.name()) && roomRepository.existsByName(dto.name())) {
            throw new IllegalArgumentException("Une autre salle porte déjà ce nom");
        }
        roomMapper.updateRoomFromDto(dto, room);
        room.setEquipments(resolveEquipments(dto.equipmentIds()));
        return roomMapper.toDto(roomRepository.save(room));
    }

    @Transactional
    public void delete(Long id) {
        Room room = getRoomOrThrow(id);
        roomRepository.delete(room);
    }

    private Room getRoomOrThrow(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Salle introuvable: " + id));
    }

    private Set<Equipment> resolveEquipments(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        List<Equipment> found = equipmentRepository.findAllById(ids);
        if (found.size() != ids.size()) {
            throw new EntityNotFoundException("Un ou plusieurs équipements sont introuvables");
        }
        return new HashSet<>(found);
    }
}
package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.room.CreateRoomDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.RoomDTO;
import fr.ekod.cda.ja.tpfinal.entity.BookingStatus;
import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import fr.ekod.cda.ja.tpfinal.entity.Room;
import fr.ekod.cda.ja.tpfinal.entity.RoomFile;
import fr.ekod.cda.ja.tpfinal.entity.RoomFileCategory;
import fr.ekod.cda.ja.tpfinal.mapper.RoomMapper;
import fr.ekod.cda.ja.tpfinal.repository.BookingRepository;
import fr.ekod.cda.ja.tpfinal.repository.EquipmentRepository;
import fr.ekod.cda.ja.tpfinal.repository.RoomFileRepository;
import fr.ekod.cda.ja.tpfinal.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private static final Set<BookingStatus> ACTIVE_STATUSES = Set.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final RoomRepository roomRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final RoomFileRepository roomFileRepository;
    private final RoomMapper roomMapper;

    public List<RoomDTO> findAll() {
        return decorate(roomRepository.findAll());
    }

    public List<RoomDTO> findAvailable() {
        return decorate(roomRepository.findByAvailableTrue());
    }

    public RoomDTO findById(Long id) {
        Room room = getRoomOrThrow(id);
        boolean booked = bookingRepository.existsActiveAt(room.getId(), LocalDateTime.now(), ACTIVE_STATUSES);
        return roomMapper.toDto(room, booked, photoUrls(id));
    }

    private List<RoomDTO> decorate(List<Room> rooms) {
        Set<Long> bookedIds = new HashSet<>(bookingRepository.findRoomIdsActiveAt(LocalDateTime.now(), ACTIVE_STATUSES));
        Map<Long, List<String>> photosByRoom = roomFileRepository
                .findByCategoryOrderByCreatedAtAsc(RoomFileCategory.PHOTO).stream()
                .collect(Collectors.groupingBy(
                        f -> f.getRoom().getId(),
                        Collectors.mapping(RoomFile::getUrl, Collectors.toList())));
        return rooms.stream()
                .map(r -> roomMapper.toDto(r, bookedIds.contains(r.getId()),
                        photosByRoom.getOrDefault(r.getId(), List.of())))
                .toList();
    }

    /** URLs des photos (catégorie PHOTO) rattachées à une salle, dans l'ordre d'ajout. */
    private List<String> photoUrls(Long roomId) {
        return roomFileRepository
                .findByRoomIdAndCategoryOrderByCreatedAtAsc(roomId, RoomFileCategory.PHOTO).stream()
                .map(RoomFile::getUrl)
                .toList();
    }

    @Transactional
    public RoomDTO create(CreateRoomDTO dto) {
        if (roomRepository.existsByName(dto.name())) {
            throw new IllegalArgumentException("Une salle avec ce nom existe déjà");
        }
        Room room = roomMapper.toEntity(dto);
        room.setEquipments(resolveEquipments(dto.equipmentIds()));
        Room saved = roomRepository.save(room);
        return roomMapper.toDto(saved, false, List.of());
    }

    @Transactional
    public RoomDTO update(Long id, CreateRoomDTO dto) {
        Room room = getRoomOrThrow(id);
        if (!room.getName().equals(dto.name()) && roomRepository.existsByName(dto.name())) {
            throw new IllegalArgumentException("Une autre salle porte déjà ce nom");
        }
        roomMapper.updateRoomFromDto(dto, room);
        room.setEquipments(resolveEquipments(dto.equipmentIds()));
        Room saved = roomRepository.save(room);
        return roomMapper.toDto(saved, false, photoUrls(saved.getId()));
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
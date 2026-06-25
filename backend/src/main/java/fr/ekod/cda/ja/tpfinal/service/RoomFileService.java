package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.room.RoomFileDTO;
import fr.ekod.cda.ja.tpfinal.entity.Room;
import fr.ekod.cda.ja.tpfinal.entity.RoomFile;
import fr.ekod.cda.ja.tpfinal.entity.RoomFileCategory;
import fr.ekod.cda.ja.tpfinal.mapper.RoomFileMapper;
import fr.ekod.cda.ja.tpfinal.repository.RoomFileRepository;
import fr.ekod.cda.ja.tpfinal.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomFileService {

    private final RoomRepository roomRepository;
    private final RoomFileRepository roomFileRepository;
    private final RoomFileMapper roomFileMapper;
    private final StorageService storageService;

    public List<RoomFileDTO> list(Long roomId) {
        ensureRoomExists(roomId);
        return roomFileMapper.toDtoList(roomFileRepository.findByRoomIdOrderByCreatedAtAsc(roomId));
    }

    /**
     * Rattache un fichier à une salle. La catégorie peut être imposée par l'admin ;
     * si elle est absente, on la déduit du type MIME (image -> PHOTO, sinon DOCUMENT).
     */
    @Transactional
    public RoomFileDTO upload(Long roomId, MultipartFile file, RoomFileCategory category) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier reçu");
        }
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Salle introuvable: " + roomId));

        RoomFileCategory resolved = category != null ? category : inferCategory(file.getContentType());

        String url = storageService.store(file, "rooms/" + roomId);

        RoomFile entity = new RoomFile();
        entity.setRoom(room);
        entity.setUrl(url);
        entity.setOriginalName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "fichier");
        entity.setContentType(file.getContentType());
        entity.setSizeBytes(file.getSize());
        entity.setCategory(resolved);
        return roomFileMapper.toDto(roomFileRepository.save(entity));
    }

    @Transactional
    public void delete(Long roomId, Long fileId) {
        RoomFile file = roomFileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Fichier introuvable: " + fileId));
        if (!file.getRoom().getId().equals(roomId)) {
            throw new IllegalArgumentException("Ce fichier n'appartient pas à cette salle");
        }
        roomFileRepository.delete(file);
        storageService.delete(file.getUrl());
    }

    private RoomFileCategory inferCategory(String contentType) {
        return contentType != null && contentType.startsWith("image/")
                ? RoomFileCategory.PHOTO
                : RoomFileCategory.DOCUMENT;
    }

    private void ensureRoomExists(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new EntityNotFoundException("Salle introuvable: " + roomId);
        }
    }
}
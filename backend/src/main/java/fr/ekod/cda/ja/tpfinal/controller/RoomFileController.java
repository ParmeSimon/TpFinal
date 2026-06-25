package fr.ekod.cda.ja.tpfinal.controller;

import fr.ekod.cda.ja.tpfinal.dto.room.RoomFileDTO;
import fr.ekod.cda.ja.tpfinal.entity.RoomFileCategory;
import fr.ekod.cda.ja.tpfinal.service.RoomFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rooms/{roomId}/files")
@RequiredArgsConstructor
public class RoomFileController {

    private final RoomFileService roomFileService;

    /** Lecture publique : galerie + documents affichés sur la fiche salle. */
    @GetMapping
    public ResponseEntity<List<RoomFileDTO>> list(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomFileService.list(roomId));
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomFileDTO> upload(
            @PathVariable Long roomId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) RoomFileCategory category) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomFileService.upload(roomId, file, category));
    }

    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long roomId, @PathVariable Long fileId) {
        roomFileService.delete(roomId, fileId);
        return ResponseEntity.noContent().build();
    }
}
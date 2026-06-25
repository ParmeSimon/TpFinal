package fr.ekod.cda.ja.tpfinal.controller;

import fr.ekod.cda.ja.tpfinal.dto.room.CreateEquipmentDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.EquipmentDTO;
import fr.ekod.cda.ja.tpfinal.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipments")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    /** Liste des équipements disponibles (pour le formulaire de gestion des salles). */
    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> findAll() {
        return ResponseEntity.ok(equipmentService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipmentDTO> create(@Valid @RequestBody CreateEquipmentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipmentService.create(dto));
    }
}
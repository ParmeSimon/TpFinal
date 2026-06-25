package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.room.CreateEquipmentDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.EquipmentDTO;
import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import fr.ekod.cda.ja.tpfinal.mapper.EquipmentMapper;
import fr.ekod.cda.ja.tpfinal.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentMapper equipmentMapper;

    public List<EquipmentDTO> findAll() {
        return equipmentMapper.toDtoList(equipmentRepository.findAllByOrderByNameAsc());
    }

    /**
     * Crée un équipement. Si un équipement du même nom existe déjà (insensible à la
     * casse), on le renvoie tel quel plutôt que d'échouer : l'admin obtient toujours
     * un équipement utilisable, sans doublon en base.
     */
    @Transactional
    public EquipmentDTO create(CreateEquipmentDTO dto) {
        String name = dto.name().trim();
        Equipment equipment = equipmentRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Equipment e = new Equipment();
                    e.setName(name);
                    return equipmentRepository.save(e);
                });
        return equipmentMapper.toDto(equipment);
    }
}
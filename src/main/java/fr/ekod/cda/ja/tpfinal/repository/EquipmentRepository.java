package fr.ekod.cda.ja.tpfinal.repository;

import fr.ekod.cda.ja.tpfinal.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
}
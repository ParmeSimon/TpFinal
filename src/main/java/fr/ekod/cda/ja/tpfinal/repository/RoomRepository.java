package fr.ekod.cda.ja.tpfinal.repository;

import fr.ekod.cda.ja.tpfinal.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByName(String name);

    boolean existsByName(String name);

    List<Room> findByAvailableTrue();

    long countByAvailableTrue();
}
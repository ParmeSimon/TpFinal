package fr.ekod.cda.ja.tpfinal.repository;

import fr.ekod.cda.ja.tpfinal.entity.RoomFile;
import fr.ekod.cda.ja.tpfinal.entity.RoomFileCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomFileRepository extends JpaRepository<RoomFile, Long> {

    List<RoomFile> findByRoomIdOrderByCreatedAtAsc(Long roomId);

    List<RoomFile> findByRoomIdAndCategoryOrderByCreatedAtAsc(Long roomId, RoomFileCategory category);

    List<RoomFile> findByCategoryOrderByCreatedAtAsc(RoomFileCategory category);
}
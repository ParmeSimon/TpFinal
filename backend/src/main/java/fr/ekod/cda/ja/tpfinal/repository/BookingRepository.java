package fr.ekod.cda.ja.tpfinal.repository;

import fr.ekod.cda.ja.tpfinal.entity.Booking;
import fr.ekod.cda.ja.tpfinal.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByRoomId(Long roomId);

    long countByStatus(BookingStatus status);

    /**
     * Detects a time overlap on a room. Two ranges overlap when
     * existing.startTime < newEnd AND existing.endTime > newStart.
     * Only the given statuses (e.g. PENDING, CONFIRMED) block the slot.
     */
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.room.id = :roomId
              AND b.status IN :statuses
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    boolean existsOverlapping(@Param("roomId") Long roomId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime,
                              @Param("statuses") Collection<BookingStatus> statuses);

    /**
     * Checks whether a room currently has an active booking at the given moment.
     */
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.room.id = :roomId
              AND b.status IN :statuses
              AND b.startTime <= :now
              AND b.endTime > :now
            """)
    boolean existsActiveAt(@Param("roomId") Long roomId,
                           @Param("now") LocalDateTime now,
                           @Param("statuses") Collection<BookingStatus> statuses);

    /**
     * Returns room IDs that currently have an active booking at the given moment.
     */
    @Query("""
            SELECT DISTINCT b.room.id FROM Booking b
            WHERE b.status IN :statuses
              AND b.startTime <= :now
              AND b.endTime > :now
            """)
    List<Long> findRoomIdsActiveAt(@Param("now") LocalDateTime now,
                                   @Param("statuses") Collection<BookingStatus> statuses);

    /**
     * Same overlap check but ignoring one booking (used when editing it).
     */
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.room.id = :roomId
              AND b.id <> :excludeId
              AND b.status IN :statuses
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    boolean existsOverlappingExcluding(@Param("roomId") Long roomId,
                                       @Param("excludeId") Long excludeId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime,
                                       @Param("statuses") Collection<BookingStatus> statuses);
}
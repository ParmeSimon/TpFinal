package fr.ekod.cda.ja.tpfinal.controller;

import fr.ekod.cda.ja.tpfinal.dto.PublicStatsDTO;
import fr.ekod.cda.ja.tpfinal.dto.room.RoomDTO;
import fr.ekod.cda.ja.tpfinal.entity.BookingStatus;
import fr.ekod.cda.ja.tpfinal.repository.BookingRepository;
import fr.ekod.cda.ja.tpfinal.repository.RoomRepository;
import fr.ekod.cda.ja.tpfinal.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicStatsController {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomService roomService;

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsDTO> stats() {
        long total = roomRepository.count();
        long available = roomRepository.countByAvailableTrue();
        long allBookings = bookingRepository.count();
        long confirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        return ResponseEntity.ok(new PublicStatsDTO(total, available, allBookings, confirmed));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDTO>> rooms(@RequestParam(name = "limit", required = false) Integer limit) {
        List<RoomDTO> all = roomService.findAvailable();
        if (limit != null && limit > 0 && all.size() > limit) {
            return ResponseEntity.ok(all.subList(0, limit));
        }
        return ResponseEntity.ok(all);
    }
}
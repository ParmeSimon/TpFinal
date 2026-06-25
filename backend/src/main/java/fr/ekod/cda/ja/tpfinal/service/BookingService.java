package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.booking.BookingDTO;
import fr.ekod.cda.ja.tpfinal.dto.booking.CreateBookingDTO;
import fr.ekod.cda.ja.tpfinal.dto.booking.PublicBookingSlotDTO;
import fr.ekod.cda.ja.tpfinal.dto.booking.UpdateBookingDTO;
import fr.ekod.cda.ja.tpfinal.entity.Booking;
import fr.ekod.cda.ja.tpfinal.entity.BookingStatus;
import fr.ekod.cda.ja.tpfinal.entity.Room;
import fr.ekod.cda.ja.tpfinal.entity.User;
import fr.ekod.cda.ja.tpfinal.exception.RoomAlreadyBooked;
import fr.ekod.cda.ja.tpfinal.mapper.BookingMapper;
import fr.ekod.cda.ja.tpfinal.repository.BookingRepository;
import fr.ekod.cda.ja.tpfinal.repository.RoomRepository;
import fr.ekod.cda.ja.tpfinal.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final EnumSet<BookingStatus> BLOCKING_STATUSES =
            EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public List<BookingDTO> findAll() {
        return bookingMapper.toDtoList(bookingRepository.findAll());
    }

    public List<BookingDTO> findByCurrentUser(String email) {
        User user = getUserByEmailOrThrow(email);
        return bookingMapper.toDtoList(bookingRepository.findByUserId(user.getId()));
    }

    /**
     * Créneaux occupés (PENDING/CONFIRMED) d'une salle, pour le planning public.
     * N'expose ni le réservant ni le motif.
     */
    public List<PublicBookingSlotDTO> findPublicSlotsByRoom(Long roomId) {
        return bookingRepository.findByRoomId(roomId).stream()
                .filter(b -> BLOCKING_STATUSES.contains(b.getStatus()))
                .map(b -> new PublicBookingSlotDTO(b.getStartTime(), b.getEndTime(), b.getStatus().name()))
                .toList();
    }

    public BookingDTO findById(Long id, String currentUserEmail, boolean isAdmin) {
        Booking booking = getBookingOrThrow(id);
        if (!isAdmin && !booking.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Vous ne pouvez consulter que vos propres réservations");
        }
        return bookingMapper.toDto(booking);
    }

    @Transactional
    public BookingDTO create(CreateBookingDTO dto, String userEmail) {
        if (!dto.endTime().isAfter(dto.startTime())) {
            throw new IllegalArgumentException("La date de fin doit être postérieure à la date de début");
        }

        Room room = roomRepository.findById(dto.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Salle introuvable: " + dto.roomId()));

        if (!room.isAvailable()) {
            throw new IllegalStateException("Cette salle n'est pas disponible à la réservation");
        }

        boolean overlap = bookingRepository.existsOverlapping(
                room.getId(), dto.startTime(), dto.endTime(), BLOCKING_STATUSES
        );
        if (overlap) {
            throw new RoomAlreadyBooked("La salle est déjà réservée sur ce créneau");
        }

        validateAttendees(dto.attendees(), room);

        User user = getUserByEmailOrThrow(userEmail);

        Booking booking = bookingMapper.toEntity(dto);
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStatus(BookingStatus.PENDING);

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO update(Long id, UpdateBookingDTO dto) {
        if (!dto.endTime().isAfter(dto.startTime())) {
            throw new IllegalArgumentException("La date de fin doit être postérieure à la date de début");
        }

        Booking booking = getBookingOrThrow(id);

        Room room = roomRepository.findById(dto.roomId())
                .orElseThrow(() -> new EntityNotFoundException("Salle introuvable: " + dto.roomId()));

        boolean overlap = bookingRepository.existsOverlappingExcluding(
                room.getId(), booking.getId(), dto.startTime(), dto.endTime(), BLOCKING_STATUSES
        );
        if (overlap) {
            throw new RoomAlreadyBooked("La salle est déjà réservée sur ce créneau");
        }

        validateAttendees(dto.attendees(), room);

        booking.setRoom(room);
        booking.setStartTime(dto.startTime());
        booking.setEndTime(dto.endTime());
        booking.setPurpose(dto.purpose());
        booking.setAttendees(dto.attendees());

        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO cancel(Long id, String currentUserEmail, boolean isAdmin) {
        Booking booking = getBookingOrThrow(id);
        if (!isAdmin && !booking.getUser().getEmail().equals(currentUserEmail)) {
            throw new AccessDeniedException("Vous ne pouvez annuler que vos propres réservations");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO confirm(Long id) {
        Booking booking = getBookingOrThrow(id);
        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDTO reject(Long id) {
        Booking booking = getBookingOrThrow(id);
        booking.setStatus(BookingStatus.REJECTED);
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    private void validateAttendees(Integer attendees, Room room) {
        if (attendees != null && room.getCapacity() != null && attendees > room.getCapacity()) {
            throw new IllegalArgumentException(
                    "Le nombre de participants (" + attendees + ") dépasse la capacité de la salle (" + room.getCapacity() + ")");
        }
    }

    private Booking getBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Réservation introuvable: " + id));
    }

    private User getUserByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + email));
    }
}
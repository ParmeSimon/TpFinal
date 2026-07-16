package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.booking.CreateBookingDTO;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    private Room room;
    private User user;
    private Booking booking;

    private final LocalDateTime debut = LocalDateTime.of(2026, 9, 1, 10, 0);
    private final LocalDateTime fin = LocalDateTime.of(2026, 9, 1, 12, 0);

    @BeforeEach
    void setUp() {
        room = new Room();
        room.setId(1L);
        room.setName("Salle A");
        room.setCapacity(10);
        room.setAvailable(true);

        user = new User();
        user.setId(1L);
        user.setEmail("alice@test.fr");

        booking = new Booking();
        booking.setId(1L);
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartTime(debut);
        booking.setEndTime(fin);
        booking.setStatus(BookingStatus.PENDING);
    }

    // ----- Règle : la date de fin doit être après la date de début -----

    @Test
    void create_refuseSiDateFinAvantDateDebut() {
        CreateBookingDTO dto = new CreateBookingDTO(1L, fin, debut, "Réunion", 5);

        assertThatThrownBy(() -> bookingService.create(dto, "alice@test.fr"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void create_reservationValideEstCreeeEnPending() {
        CreateBookingDTO dto = new CreateBookingDTO(1L, debut, fin, "Réunion", 5);
        Booking nouvelleReservation = new Booking();

        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection())).thenReturn(false);
        when(userRepository.findByEmail("alice@test.fr")).thenReturn(Optional.of(user));
        when(bookingMapper.toEntity(dto)).thenReturn(nouvelleReservation);

        bookingService.create(dto, "alice@test.fr");

        assertThat(nouvelleReservation.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(nouvelleReservation.getUser()).isEqualTo(user);
        assertThat(nouvelleReservation.getRoom()).isEqualTo(room);
        verify(bookingRepository).save(nouvelleReservation);
    }

    // ----- Règle : la salle doit exister -----

    @Test
    void create_refuseSiSalleIntrouvable() {
        CreateBookingDTO dto = new CreateBookingDTO(99L, debut, fin, "Réunion", 5);
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.create(dto, "alice@test.fr"))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ----- Règle : la salle doit être disponible -----

    @Test
    void create_refuseSiSalleIndisponible() {
        room.setAvailable(false);
        CreateBookingDTO dto = new CreateBookingDTO(1L, debut, fin, "Réunion", 5);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> bookingService.create(dto, "alice@test.fr"))
                .isInstanceOf(IllegalStateException.class);
        verify(bookingRepository, never()).save(any());
    }

    // ----- Règle : pas de chevauchement avec une autre réservation -----

    @Test
    void create_refuseSiCreneauDejaReserve() {
        CreateBookingDTO dto = new CreateBookingDTO(1L, debut, fin, "Réunion", 5);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection())).thenReturn(true);

        assertThatThrownBy(() -> bookingService.create(dto, "alice@test.fr"))
                .isInstanceOf(RoomAlreadyBooked.class);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void update_metAJourSiCreneauLibre() {
        UpdateBookingDTO dto = new UpdateBookingDTO(1L, debut.plusHours(1), fin.plusHours(1), "Nouveau motif", 5);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingExcluding(anyLong(), anyLong(), any(), any(), anyCollection()))
                .thenReturn(false);

        bookingService.update(1L, dto);

        assertThat(booking.getStartTime()).isEqualTo(dto.startTime());
        assertThat(booking.getEndTime()).isEqualTo(dto.endTime());
        assertThat(booking.getPurpose()).isEqualTo("Nouveau motif");
        verify(bookingRepository).save(booking);
    }

    @Test
    void update_refuseSiCreneauDejaReserve() {
        UpdateBookingDTO dto = new UpdateBookingDTO(1L, debut, fin, "Réunion", 5);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlappingExcluding(anyLong(), anyLong(), any(), any(), anyCollection()))
                .thenReturn(true);

        assertThatThrownBy(() -> bookingService.update(1L, dto))
                .isInstanceOf(RoomAlreadyBooked.class);
        verify(bookingRepository, never()).save(any());
    }

    // ----- Règle : le nombre de participants ne dépasse pas la capacité -----

    @Test
    void create_refuseSiParticipantsDepassentCapacite() {
        CreateBookingDTO dto = new CreateBookingDTO(1L, debut, fin, "Réunion", 15);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection())).thenReturn(false);

        assertThatThrownBy(() -> bookingService.create(dto, "alice@test.fr"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(bookingRepository, never()).save(any());
    }

    // ----- Règle : un utilisateur ne consulte que ses propres réservations -----

    @Test
    void findById_autoriseLeProprietaire() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        bookingService.findById(1L, "alice@test.fr", false);

        verify(bookingMapper).toDto(booking);
    }

    @Test
    void findById_refuseUnAutreUtilisateurNonAdmin() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.findById(1L, "bob@test.fr", false))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ----- Règle : un utilisateur n'annule que ses propres réservations (admin OK) -----

    @Test
    void cancel_autoriseLeProprietaireEtPasseEnCancelled() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        bookingService.cancel(1L, "alice@test.fr", false);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        verify(bookingRepository).save(booking);
    }

    @Test
    void cancel_refuseUnAutreUtilisateurNonAdmin() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancel(1L, "bob@test.fr", false))
                .isInstanceOf(AccessDeniedException.class);
        verify(bookingRepository, never()).save(any());
    }
}
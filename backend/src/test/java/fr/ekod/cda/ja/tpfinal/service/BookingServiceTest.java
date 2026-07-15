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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
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
@DisplayName("BookingService — règles métier")
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

    private static final String OWNER_EMAIL = "alice@ekod.fr";
    private static final String OTHER_EMAIL = "bob@ekod.fr";
    private static final LocalDateTime START = LocalDateTime.of(2026, 9, 1, 10, 0);
    private static final LocalDateTime END = LocalDateTime.of(2026, 9, 1, 12, 0);

    private Room room(Long id, int capacity, boolean available) {
        Room room = new Room();
        room.setId(id);
        room.setName("Salle " + id);
        room.setCapacity(capacity);
        room.setAvailable(available);
        return room;
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private Booking booking(Long id, User user, Room room, BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartTime(START);
        booking.setEndTime(END);
        booking.setStatus(status);
        return booking;
    }

    private CreateBookingDTO createDto(LocalDateTime start, LocalDateTime end, Integer attendees) {
        return new CreateBookingDTO(1L, start, end, "Réunion", attendees);
    }

    private UpdateBookingDTO updateDto(LocalDateTime start, LocalDateTime end, Integer attendees) {
        return new UpdateBookingDTO(1L, start, end, "Réunion modifiée", attendees);
    }

    @Nested
    @DisplayName("Création — create()")
    class Create {

        @Test
        @DisplayName("crée la réservation en PENDING quand toutes les règles passent")
        void create_ok() {
            CreateBookingDTO dto = createDto(START, END, 5);
            Room room = room(1L, 10, true);
            User user = user(42L, OWNER_EMAIL);
            Booking mapped = new Booking();
            mapped.setStartTime(START);
            mapped.setEndTime(END);
            BookingDTO expected = new BookingDTO(1L, 1L, "Salle 1", 42L, OWNER_EMAIL,
                    START, END, "Réunion", 5, "PENDING", null);

            when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
            when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection()))
                    .thenReturn(false);
            when(userRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(user));
            when(bookingMapper.toEntity(dto)).thenReturn(mapped);
            when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
            when(bookingMapper.toDto(any(Booking.class))).thenReturn(expected);

            BookingDTO result = bookingService.create(dto, OWNER_EMAIL);

            ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
            verify(bookingRepository).save(captor.capture());
            Booking saved = captor.getValue();
            assertThat(saved.getStatus()).isEqualTo(BookingStatus.PENDING);
            assertThat(saved.getUser()).isSameAs(user);
            assertThat(saved.getRoom()).isSameAs(room);
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("refuse une date de fin antérieure à la date de début")
        void create_endBeforeStart() {
            CreateBookingDTO dto = createDto(END, START, 5);

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("postérieure");
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuse une date de fin égale à la date de début")
        void create_endEqualsStart() {
            CreateBookingDTO dto = createDto(START, START, 5);

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(IllegalArgumentException.class);
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuse quand la salle n'existe pas")
        void create_roomNotFound() {
            CreateBookingDTO dto = createDto(START, END, 5);
            when(roomRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Salle introuvable");
        }

        @Test
        @DisplayName("refuse quand la salle est indisponible")
        void create_roomUnavailable() {
            CreateBookingDTO dto = createDto(START, END, 5);
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, false)));

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("pas disponible");
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuse un créneau qui chevauche une réservation PENDING/CONFIRMED")
        void create_overlap() {
            CreateBookingDTO dto = createDto(START, END, 5);
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, true)));
            when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection()))
                    .thenReturn(true);

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(RoomAlreadyBooked.class)
                    .hasMessageContaining("déjà réservée");
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("accepte un nombre de participants égal à la capacité (cas limite)")
        void create_attendeesAtCapacity() {
            CreateBookingDTO dto = createDto(START, END, 10);
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, true)));
            when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection()))
                    .thenReturn(false);
            when(userRepository.findByEmail(OWNER_EMAIL))
                    .thenReturn(Optional.of(user(42L, OWNER_EMAIL)));
            when(bookingMapper.toEntity(dto)).thenReturn(new Booking());

            bookingService.create(dto, OWNER_EMAIL);

            verify(bookingRepository).save(any(Booking.class));
        }

        @Test
        @DisplayName("refuse plus de participants que la capacité de la salle")
        void create_attendeesOverCapacity() {
            CreateBookingDTO dto = createDto(START, END, 11);
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, true)));
            when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection()))
                    .thenReturn(false);

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("capacité");
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuse quand l'utilisateur du JWT est introuvable")
        void create_userNotFound() {
            CreateBookingDTO dto = createDto(START, END, 5);
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, true)));
            when(bookingRepository.existsOverlapping(anyLong(), any(), any(), anyCollection()))
                    .thenReturn(false);
            when(userRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.create(dto, OWNER_EMAIL))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Utilisateur introuvable");
        }
    }

    @Nested
    @DisplayName("Consultation — findById()")
    class FindById {

        @Test
        @DisplayName("le propriétaire peut consulter sa réservation")
        void findById_owner() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            bookingService.findById(1L, OWNER_EMAIL, false);

            verify(bookingMapper).toDto(booking);
        }

        @Test
        @DisplayName("un admin peut consulter la réservation d'un autre utilisateur")
        void findById_admin() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            bookingService.findById(1L, OTHER_EMAIL, true);

            verify(bookingMapper).toDto(booking);
        }

        @Test
        @DisplayName("refuse à un non-admin la réservation d'un autre utilisateur")
        void findById_forbidden() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.findById(1L, OTHER_EMAIL, false))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("vos propres réservations");
        }

        @Test
        @DisplayName("refuse quand la réservation n'existe pas")
        void findById_notFound() {
            when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.findById(99L, OWNER_EMAIL, false))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Réservation introuvable");
        }
    }

    @Nested
    @DisplayName("Annulation — cancel()")
    class Cancel {

        @Test
        @DisplayName("le propriétaire peut annuler : statut passe à CANCELLED")
        void cancel_owner() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.CONFIRMED);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            bookingService.cancel(1L, OWNER_EMAIL, false);

            ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
            verify(bookingRepository).save(captor.capture());
            assertThat(captor.getValue().getStatus()).isEqualTo(BookingStatus.CANCELLED);
        }

        @Test
        @DisplayName("un admin peut annuler la réservation d'un autre utilisateur")
        void cancel_admin() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            bookingService.cancel(1L, OTHER_EMAIL, true);

            assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        }

        @Test
        @DisplayName("refuse à un non-admin d'annuler la réservation d'un autre")
        void cancel_forbidden() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            assertThatThrownBy(() -> bookingService.cancel(1L, OTHER_EMAIL, false))
                    .isInstanceOf(AccessDeniedException.class);
            verify(bookingRepository, never()).save(any());
            assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("Modification — update()")
    class Update {

        @Test
        @DisplayName("met à jour le créneau quand aucune autre réservation ne chevauche")
        void update_ok() {
            UpdateBookingDTO dto = updateDto(START.plusHours(1), END.plusHours(1), 5);
            Booking booking = booking(7L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.CONFIRMED);
            Room room = room(1L, 10, true);

            when(bookingRepository.findById(7L)).thenReturn(Optional.of(booking));
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
            when(bookingRepository.existsOverlappingExcluding(anyLong(), anyLong(), any(), any(), anyCollection()))
                    .thenReturn(false);

            bookingService.update(7L, dto);

            ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
            verify(bookingRepository).save(captor.capture());
            Booking saved = captor.getValue();
            assertThat(saved.getStartTime()).isEqualTo(dto.startTime());
            assertThat(saved.getEndTime()).isEqualTo(dto.endTime());
            assertThat(saved.getPurpose()).isEqualTo(dto.purpose());
            // le statut n'est pas modifié par update()
            assertThat(saved.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        }

        @Test
        @DisplayName("refuse un chevauchement avec une autre réservation (soi-même exclu)")
        void update_overlap() {
            UpdateBookingDTO dto = updateDto(START, END, 5);
            Booking booking = booking(7L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);

            when(bookingRepository.findById(7L)).thenReturn(Optional.of(booking));
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, true)));
            when(bookingRepository.existsOverlappingExcluding(anyLong(), anyLong(), any(), any(), anyCollection()))
                    .thenReturn(true);

            assertThatThrownBy(() -> bookingService.update(7L, dto))
                    .isInstanceOf(RoomAlreadyBooked.class);
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuse une date de fin antérieure à la date de début")
        void update_endBeforeStart() {
            UpdateBookingDTO dto = updateDto(END, START, 5);

            assertThatThrownBy(() -> bookingService.update(7L, dto))
                    .isInstanceOf(IllegalArgumentException.class);
            verify(bookingRepository, never()).save(any());
        }

        @Test
        @DisplayName("refuse plus de participants que la capacité de la nouvelle salle")
        void update_attendeesOverCapacity() {
            UpdateBookingDTO dto = updateDto(START, END, 20);
            Booking booking = booking(7L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);

            when(bookingRepository.findById(7L)).thenReturn(Optional.of(booking));
            when(roomRepository.findById(1L)).thenReturn(Optional.of(room(1L, 10, true)));
            when(bookingRepository.existsOverlappingExcluding(anyLong(), anyLong(), any(), any(), anyCollection()))
                    .thenReturn(false);

            assertThatThrownBy(() -> bookingService.update(7L, dto))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("capacité");
            verify(bookingRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Changement de statut — confirm() / reject()")
    class StatusChange {

        @Test
        @DisplayName("confirm() passe la réservation en CONFIRMED")
        void confirm_ok() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            bookingService.confirm(1L);

            assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
            verify(bookingRepository).save(booking);
        }

        @Test
        @DisplayName("reject() passe la réservation en REJECTED")
        void reject_ok() {
            Booking booking = booking(1L, user(42L, OWNER_EMAIL), room(1L, 10, true), BookingStatus.PENDING);
            when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

            bookingService.reject(1L);

            assertThat(booking.getStatus()).isEqualTo(BookingStatus.REJECTED);
            verify(bookingRepository).save(booking);
        }

        @Test
        @DisplayName("confirm() refuse une réservation inexistante")
        void confirm_notFound() {
            when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bookingService.confirm(99L))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Planning public — findPublicSlotsByRoom()")
    class PublicSlots {

        @Test
        @DisplayName("n'expose que les créneaux PENDING et CONFIRMED")
        void publicSlots_filtersBlockingStatuses() {
            User owner = user(42L, OWNER_EMAIL);
            Room room = room(1L, 10, true);
            List<Booking> bookings = List.of(
                    booking(1L, owner, room, BookingStatus.PENDING),
                    booking(2L, owner, room, BookingStatus.CONFIRMED),
                    booking(3L, owner, room, BookingStatus.CANCELLED),
                    booking(4L, owner, room, BookingStatus.REJECTED)
            );
            when(bookingRepository.findByRoomId(1L)).thenReturn(bookings);

            List<PublicBookingSlotDTO> slots = bookingService.findPublicSlotsByRoom(1L);

            assertThat(slots).hasSize(2);
            assertThat(slots).extracting(PublicBookingSlotDTO::status)
                    .containsExactlyInAnyOrder("PENDING", "CONFIRMED");
        }
    }
}
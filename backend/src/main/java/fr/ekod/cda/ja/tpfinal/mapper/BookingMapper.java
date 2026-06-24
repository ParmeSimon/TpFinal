package fr.ekod.cda.ja.tpfinal.mapper;

import fr.ekod.cda.ja.tpfinal.dto.booking.BookingDTO;
import fr.ekod.cda.ja.tpfinal.dto.booking.CreateBookingDTO;
import fr.ekod.cda.ja.tpfinal.entity.Booking;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BookingMapper {

    // Entity -> DTO de sortie : on aplatit user et room
    @Mapping(target = "roomId", source = "room.id")
    @Mapping(target = "roomName", source = "room.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    BookingDTO toDto(Booking booking);

    List<BookingDTO> toDtoList(List<Booking> bookings);

    // CreateBookingDTO -> Entity (POST)
    // user (issu du JWT), room (résolu via roomId), status (PENDING) => gérés dans le service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Booking toEntity(CreateBookingDTO dto);
}
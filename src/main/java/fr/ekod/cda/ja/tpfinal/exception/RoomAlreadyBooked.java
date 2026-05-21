package fr.ekod.cda.ja.tpfinal.exception;

public class RoomAlreadyBooked extends RuntimeException {
    public RoomAlreadyBooked(String message) {
        super(message);
    }
}

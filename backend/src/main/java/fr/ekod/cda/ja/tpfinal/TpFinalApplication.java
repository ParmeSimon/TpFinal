package fr.ekod.cda.ja.tpfinal;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class TpFinalApplication {

	public static void main(String[] args) {
		SpringApplication.run(TpFinalApplication.class, args);
	}

	/**
	 * Les réservations sont saisies en heure locale (Le Mans) et stockées sans fuseau.
	 * On force donc l'application en Europe/Paris pour que {@code LocalDateTime.now()}
	 * (statut "réservé" en cours, validation @Future) corresponde aux heures saisies,
	 * quel que soit le fuseau du conteneur (souvent UTC sur Docker/Render).
	 */
	@PostConstruct
	void forceApplicationTimeZone() {
		TimeZone.setDefault(TimeZone.getTimeZone("Europe/Paris"));
	}

}

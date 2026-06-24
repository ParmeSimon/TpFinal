package fr.ekod.cda.ja.tpfinal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI apiInfo(){
        return new OpenAPI()
                .info(new Info()
                        .title("Ekod Booking API")
                        .version("1.0.0")
                        .description("API de réservation de salle pour l'école EKOD"));
    }
}

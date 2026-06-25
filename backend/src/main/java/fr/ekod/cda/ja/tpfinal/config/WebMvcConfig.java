package fr.ekod.cda.ja.tpfinal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Expose les fichiers uploadés (dossier local {@code app.upload.dir}) en lecture
 * sous {@code /api/uploads/**}. Le préfixe {@code /api} est déjà proxyfié vers le
 * backend en dev (Vite) et en prod (nginx), donc aucune config proxy supplémentaire.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final String uploadDir;

    public WebMvcConfig(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }
}
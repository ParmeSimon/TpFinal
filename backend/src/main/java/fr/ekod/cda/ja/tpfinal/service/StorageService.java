package fr.ekod.cda.ja.tpfinal.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

/**
 * Stockage de fichiers sur le disque local.
 * <p>
 * Les fichiers sont écrits sous {@code app.upload.dir} (un dossier monté en
 * volume Docker pour persister), et servis publiquement via {@code /api/uploads/**}
 * (voir {@code WebMvcConfig}). On expose donc une URL relative que le front peut
 * utiliser directement comme {@code src}/lien.
 */
@Service
public class StorageService {

    /** Préfixe public sous lequel les fichiers sont servis (proxyfié /api en dev et prod). */
    public static final String PUBLIC_PREFIX = "/api/uploads/";

    private final Path root;

    public StorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible de créer le dossier d'upload: " + root, e);
        }
    }

    /**
     * Enregistre un fichier dans le sous-dossier donné et renvoie son URL publique.
     *
     * @param file   fichier reçu (non vide)
     * @param subdir sous-dossier logique, ex. {@code "avatars"} ou {@code "rooms/12"}
     * @return URL relative type {@code /api/uploads/avatars/<uuid>.jpg}
     */
    public String store(MultipartFile file, String subdir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = StringUtils.getFilenameExtension(original);
        String safeExt = (ext == null || ext.isBlank()) ? "" : "." + ext.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        String stored = UUID.randomUUID() + safeExt;

        Path targetDir = root.resolve(subdir).normalize();
        if (!targetDir.startsWith(root)) {
            throw new IllegalArgumentException("Chemin de stockage invalide");
        }
        try {
            Files.createDirectories(targetDir);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetDir.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Échec de l'enregistrement du fichier", e);
        }
        return PUBLIC_PREFIX + subdir + "/" + stored;
    }

    /** Supprime le fichier correspondant à une URL publique précédemment renvoyée par {@link #store}. */
    public void delete(String publicUrl) {
        if (publicUrl == null || !publicUrl.startsWith(PUBLIC_PREFIX)) {
            return;
        }
        String relative = publicUrl.substring(PUBLIC_PREFIX.length());
        Path target = root.resolve(relative).normalize();
        if (!target.startsWith(root)) {
            return; // garde-fou anti path-traversal
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // un fichier orphelin n'est pas bloquant
        }
    }
}
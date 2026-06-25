package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.auth.*;
import fr.ekod.cda.ja.tpfinal.entity.Role;
import fr.ekod.cda.ja.tpfinal.entity.User;
import fr.ekod.cda.ja.tpfinal.mapper.UserMapper;
import fr.ekod.cda.ja.tpfinal.repository.UserRepository;
import fr.ekod.cda.ja.tpfinal.security.CustomUserDetailsService;
import fr.ekod.cda.ja.tpfinal.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final StorageService storageService;

    @Transactional
    public UserDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cet email");
        }
        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setActive(true);
        user.setRoles(EnumSet.of(Role.STUDENT));
        User saved = userRepository.save(user);
        return userMapper.toDto(saved);
    }

    public TokenResponseDTO login(LoginRequestDTO dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Email ou mot de passe invalide");
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(dto.email());
        return buildTokens(userDetails);
    }

    public TokenResponseDTO refresh(RefreshRequestDTO dto) {
        String token = dto.refreshToken();
        String type = jwtService.extractTokenType(token);
        if (!"refresh".equals(type)) {
            throw new BadCredentialsException("Token de rafraîchissement invalide");
        }
        String email = jwtService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtService.isTokenValid(token, userDetails)) {
            throw new BadCredentialsException("Token de rafraîchissement expiré ou invalide");
        }
        return buildTokens(userDetails);
    }

    private TokenResponseDTO buildTokens(UserDetails userDetails) {
        String access = jwtService.generateAccessToken(userDetails);
        String refresh = jwtService.generateRefreshToken(userDetails);
        return new TokenResponseDTO(access, refresh, "Bearer", jwtService.getAccessExpirationSeconds());
    }

    public UserDTO getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + email));
        return userMapper.toDto(user);
    }

    public UserDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + id));
        return userMapper.toDto(user);
    }

    public List<UserDTO> findAll() {
        return userRepository.findAll().stream().map(userMapper::toDto).toList();
    }

    /** Mise à jour par l'utilisateur de son propre profil (nom, prénom). */
    @Transactional
    public UserDTO updateOwnProfile(String email, UpdateProfileDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + email));
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        return userMapper.toDto(userRepository.save(user));
    }

    /** Upload de la photo de profil : remplace l'éventuelle ancienne et renvoie le profil à jour. */
    @Transactional
    public UserDTO updateOwnAvatar(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Aucun fichier reçu");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("La photo de profil doit être une image");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + email));
        String oldAvatar = user.getAvatarUrl();
        String url = storageService.store(file, "avatars");
        user.setAvatarUrl(url);
        UserDTO dto = userMapper.toDto(userRepository.save(user));
        storageService.delete(oldAvatar); // nettoyage de l'ancien fichier après succès
        return dto;
    }

    /** Suppression de la photo de profil. */
    @Transactional
    public UserDTO removeOwnAvatar(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + email));
        String oldAvatar = user.getAvatarUrl();
        user.setAvatarUrl(null);
        UserDTO dto = userMapper.toDto(userRepository.save(user));
        storageService.delete(oldAvatar);
        return dto;
    }

    /** Changement de mot de passe : exige et vérifie le mot de passe actuel. */
    @Transactional
    public void changeOwnPassword(String email, ChangePasswordDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + email));
        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Le mot de passe actuel est incorrect");
        }
        if (passwordEncoder.matches(dto.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit être différent de l'ancien");
        }
        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDTO update(Long id, UpdateUserDTO dto, String currentEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable: " + id));

        boolean editingSelf = user.getEmail().equals(currentEmail);

        if (editingSelf) {
            if (!dto.roles().contains(Role.ADMIN)) {
                throw new IllegalArgumentException("Vous ne pouvez pas retirer votre propre rôle administrateur");
            }
            if (!dto.active()) {
                throw new IllegalArgumentException("Vous ne pouvez pas désactiver votre propre compte");
            }
        }
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setRoles(dto.roles());
        user.setActive(dto.active());
        return userMapper.toDto(userRepository.save(user));
    }
}
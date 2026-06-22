package fr.ekod.cda.ja.tpfinal.service;

import fr.ekod.cda.ja.tpfinal.dto.auth.LoginRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.RefreshRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.RegisterRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.TokenResponseDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.UserDTO;
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
}
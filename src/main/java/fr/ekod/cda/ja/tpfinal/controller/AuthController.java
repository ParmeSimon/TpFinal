package fr.ekod.cda.ja.tpfinal.controller;

import fr.ekod.cda.ja.tpfinal.dto.auth.LoginRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.RefreshRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.RegisterRequestDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.TokenResponseDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.UserDTO;
import fr.ekod.cda.ja.tpfinal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO dto) {
        return ResponseEntity.ok(userService.refresh(dto));
    }
}
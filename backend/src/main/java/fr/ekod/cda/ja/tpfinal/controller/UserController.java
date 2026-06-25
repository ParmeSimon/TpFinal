package fr.ekod.cda.ja.tpfinal.controller;

import fr.ekod.cda.ja.tpfinal.dto.auth.ChangePasswordDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.UpdateProfileDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.UpdateUserDTO;
import fr.ekod.cda.ja.tpfinal.dto.auth.UserDTO;
import fr.ekod.cda.ja.tpfinal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(Authentication auth) {
        return ResponseEntity.ok(userService.getByEmail(auth.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(@Valid @RequestBody UpdateProfileDTO dto, Authentication auth) {
        return ResponseEntity.ok(userService.updateOwnProfile(auth.getName(), dto));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changeMyPassword(@Valid @RequestBody ChangePasswordDTO dto, Authentication auth) {
        userService.changeOwnPassword(auth.getName(), dto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public ResponseEntity<UserDTO> uploadMyAvatar(@RequestParam("file") MultipartFile file, Authentication auth) {
        return ResponseEntity.ok(userService.updateOwnAvatar(auth.getName(), file));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserDTO> deleteMyAvatar(Authentication auth) {
        return ResponseEntity.ok(userService.removeOwnAvatar(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateUserDTO dto, Authentication auth) {
        return ResponseEntity.ok(userService.update(id, dto, auth.getName()));
    }
}
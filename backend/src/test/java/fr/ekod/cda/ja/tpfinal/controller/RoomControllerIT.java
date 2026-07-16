package fr.ekod.cda.ja.tpfinal.controller;

import com.jayway.jsonpath.JsonPath;
import fr.ekod.cda.ja.tpfinal.entity.Role;
import fr.ekod.cda.ja.tpfinal.entity.User;
import fr.ekod.cda.ja.tpfinal.repository.RoomRepository;
import fr.ekod.cda.ja.tpfinal.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.EnumSet;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Matrice de sécurité de RoomController.
 *
 * Prérequis : docker compose up -d postgres + variables .env chargées.
 * Données jetables préfixées TEST_, nettoyées en @AfterAll.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5442/ekodplanner",
        "spring.datasource.username=ekodplanneruser",
        "spring.datasource.password=ekodplannerpwd",
        "jwt.secret=uneCleSuperSecreteDAuMoins256BitsAChangerEnProd",
        "jwt.access.expiration=900000",
        "jwt.refresh.expiration=604800000"
})
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DisplayName("RoomController — matrice de sécurité (intégration)")
class RoomControllerIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private RoomRepository roomRepository;

    private String adminToken;
    private String userToken;

    private static final String ADMIN_EMAIL = "TEST_admin_it@ekod.test";
    private static final String USER_EMAIL  = "TEST_user_it@ekod.test";
    private static final String PASSWORD    = "TestPass1!";
    private static final String TEST_ROOM   = "TEST Salle Nova";

    @BeforeAll
    void setup() throws Exception {
        // Nettoyage idempotent (exécution précédente avortée)
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(USER_EMAIL).ifPresent(userRepository::delete);
        roomRepository.findByName(TEST_ROOM).ifPresent(roomRepository::delete);

        User admin = new User();
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(PASSWORD));
        admin.setFirstName("Test");
        admin.setLastName("Admin");
        admin.setActive(true);
        admin.setRoles(EnumSet.of(Role.ADMIN));
        userRepository.save(admin);

        User student = new User();
        student.setEmail(USER_EMAIL);
        student.setPassword(passwordEncoder.encode(PASSWORD));
        student.setFirstName("Test");
        student.setLastName("Student");
        student.setActive(true);
        student.setRoles(EnumSet.of(Role.STUDENT));
        userRepository.save(student);

        adminToken = loginAndGetToken(ADMIN_EMAIL, PASSWORD);
        userToken  = loginAndGetToken(USER_EMAIL, PASSWORD);
    }

    @AfterEach
    void cleanup() {
        roomRepository.findByName(TEST_ROOM).ifPresent(roomRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(USER_EMAIL).ifPresent(userRepository::delete);
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.accessToken");
    }

    // ── 200 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/rooms → 200 sans authentification")
    void getAll_public_200() throws Exception {
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/rooms/1 → 200 sans authentification")
    void getById_public_200() throws Exception {
        mockMvc.perform(get("/api/rooms/1"))
                .andExpect(status().isOk());
    }

    // ── 201 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/rooms (ADMIN, corps valide) → 201 Created")
    void create_asAdmin_201() throws Exception {
        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","capacity":20,"description":"IT test","available":true,"equipmentIds":[]}
                                """.formatted(TEST_ROOM)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(TEST_ROOM));
    }

    // ── 400 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/rooms (nom vide) → 400 Bad Request")
    void create_invalidBody_400() throws Exception {
        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","capacity":20,"available":true,"equipmentIds":[]}
                                """))
                .andExpect(status().isBadRequest());
    }

    // ── 401 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/rooms (sans token) → 401 Unauthorized")
    void create_anonymous_401() throws Exception {
        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"TEST Anon","capacity":10,"available":true,"equipmentIds":[]}
                                """))
                .andExpect(status().isUnauthorized());
    }

    // ── 403 ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/rooms (STUDENT) → 403 Forbidden")
    void create_asStudent_403() throws Exception {
        mockMvc.perform(post("/api/rooms")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"TEST Student Room","capacity":10,"available":true,"equipmentIds":[]}
                                """))
                .andExpect(status().isForbidden());
    }
}
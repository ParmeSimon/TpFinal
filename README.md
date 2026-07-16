# EKOD Room Booking

## Stratégie de test

### Couverture par niveau

| Niveau | Ce qu'on vérifie | Outil | Localisation |
|--------|-----------------|-------|-------------|
| **Unitaire** | Règles métier de `BookingService`, `RoomService` et `RoomFileService` (logique de validation, cas nominaux et refus) sans Spring ni base de données | JUnit 5 + Mockito + AssertJ | `backend/src/test/java/.../service/` |
| **Intégration API** | Codes HTTP et règles d'accès (public / STUDENT / ADMIN) avec le vrai `SecurityConfig` et le vrai filtre JWT | `@SpringBootTest` + `@AutoConfigureMockMvc` + JsonPath | `backend/src/test/java/.../controller/` |
| **Système** | Scénario bout-en-bout : inscription → login → consultation salles → réservation → conflit de créneau → annulation, en HTTP réel sur l'application démarrée | Bruno CLI (`npx @usebruno/cli run`) | `bruno/` |

### Lancer les tests

**Unitaires + intégration :**
```bash
# Démarrer la base de données
docker compose up -d postgres

# Charger les variables d'environnement, puis lancer
./mvnw test
```

**Système (Bruno) :**
```bash
# Application démarrée (docker compose up ou ./mvnw spring-boot:run)
npx @usebruno/cli run -r --env Local
```

> **Mot de passe admin Bruno** : l'environnement `Local.bru` utilise `adminPassword: Ekod2024!`.
> Si la connexion admin échoue, mettez à jour `bruno/environments/Local.bru` avec le bon mot de passe.

### Ce qui n'est PAS couvert, et pourquoi

- **Migrations Flyway** : la cohérence du schéma est vérifiée par Flyway au démarrage ; le test `contextLoads()` détecte immédiatement un schéma cassé.
- **StorageService (I/O disque)** : les accès fichiers sont mockés dans les tests unitaires ; tester les permissions disque et le quota dépasserait le périmètre de la journée.
- **Mappers MapStruct** : les implémentations générées sont couvertes indirectement par les tests d'intégration.
- **Frontend React** : l'automatisation E2E IHM (Playwright / Cypress) est trop coûteuse pour une journée ; vérifié manuellement.
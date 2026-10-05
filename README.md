# Smart Campus Service Management REST API

Java 17 · Spring Boot 3.2 · Spring Data JPA · MySQL · Spring Security + JWT · Postman

## Run in VS Code
1. Install: **JDK 17+**, **Maven**, **MySQL**, and VS Code extension **"Extension Pack for Java"** (+ "Spring Boot Extension Pack").
2. Open this folder in VS Code (`File > Open Folder`).
3. Edit `src/main/resources/application.properties` -> put your MySQL username/password.
   (Database `smart_campus` is created automatically.)
4. Terminal: `mvn spring-boot:run`   (or open `SmartCampusApplication.java` and click **Run**)
5. API runs on `http://localhost:8080`.
6. Postman -> Import `postman/SmartCampus.postman_collection.json`.
   Login request automatically saves the JWT in `{{token}}`.

## Default accounts (auto-created)
| Role  | Email             | Password |
|-------|-------------------|----------|
| ADMIN | admin@campus.com  | admin123 |
| STAFF | staff@campus.com  | staff123 |
Students: use `POST /api/auth/register` (always gets STUDENT role).

## Endpoints
| Module | Endpoints | Who |
|---|---|---|
| Auth | POST /api/auth/register, /login | public |
| Tickets (complaint / hostel / maintenance / service) | POST, GET (filter+paging), GET/{id}, PUT/{id}, DELETE/{id} | owner; students see only own |
| | PATCH /api/tickets/{id}/status | ADMIN, STAFF |
| Lost & Found | POST, GET ?type=LOST/FOUND, GET/{id}, PATCH/{id}/claim, DELETE/{id} | any user (owner/staff for modify) |
| Events | POST, PUT/{id} | ADMIN, STAFF |
| | DELETE/{id} | ADMIN |
| | GET, GET/{id}, POST /{id}/register, DELETE /{id}/register, GET /my-registrations | any user |
| | GET /{id}/registrations | ADMIN, STAFF |
| Notices | GET, GET/{id} | any user |
| | POST, PUT/{id}, DELETE/{id} | ADMIN, STAFF |

Send header `Authorization: Bearer <token>` on everything except `/api/auth/**`.

## Status codes used
200 OK · 201 Created · 204 No Content · 400 Validation/Bad request · 401 Unauthorized (no/invalid token or bad login) · 403 Forbidden (wrong role / not owner) · 404 Not Found · 409 Conflict (duplicate email / duplicate event registration)

## Viva talking points
- **Layers:** Controller -> Service -> Repository -> MySQL; DTOs (`Dtos.java`) for input validation.
- **Relationships:** User 1-N Ticket / LostFoundItem / Notice / Event; Event N-M User via `EventRegistration` (unique constraint on event+user).
- **Security:** BCrypt password hashing, stateless JWT, `JwtAuthFilter`, role-based access with `@PreAuthorize` + ownership checks in services.
- **Validation:** `@NotBlank`, `@Email`, `@Size`, `@Future`, `@Min` -> handled by `GlobalExceptionHandler` (clean JSON errors).
- **Business rules:** event capacity, no duplicate registration, only OPEN tickets editable by students, pagination + filtering on tickets.

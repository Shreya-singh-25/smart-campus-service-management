package com.campus.smartcampus.dto;

import com.campus.smartcampus.entity.LostFoundItem;
import com.campus.smartcampus.entity.Ticket;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/** All request/response DTOs with validation rules in one place. */
public final class Dtos {
    private Dtos() {}

    public record RegisterRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, message = "password must be at least 6 characters") String password,
            String department) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String token, String name, String email, String role) {}

    public record TicketRequest(
            @NotBlank String title,
            @NotBlank @Size(max = 2000) String description,
            @NotNull Ticket.Category category,
            Ticket.Priority priority,
            String location) {}

    public record StatusUpdateRequest(@NotNull Ticket.Status status, String adminRemarks) {}

    public record LostFoundRequest(
            @NotBlank String itemName,
            String description,
            @NotNull LostFoundItem.Type type,
            @NotBlank String location) {}

    public record EventRequest(
            @NotBlank String title,
            String description,
            @NotBlank String venue,
            @NotNull @Future LocalDateTime eventDate,
            @Min(value = 1, message = "capacity must be at least 1") int capacity) {}

    public record NoticeRequest(@NotBlank String title, @NotBlank String content) {}
}

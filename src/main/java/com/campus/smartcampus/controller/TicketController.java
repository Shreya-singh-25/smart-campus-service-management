package com.campus.smartcampus.controller;

import com.campus.smartcampus.dto.Dtos.StatusUpdateRequest;
import com.campus.smartcampus.dto.Dtos.TicketRequest;
import com.campus.smartcampus.entity.Ticket;
import com.campus.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Complaints, hostel issues, maintenance & service requests. */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService service;

    @PostMapping
    public ResponseEntity<Ticket> create(@Valid @RequestBody TicketRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));
    }

    @GetMapping
    public Page<Ticket> list(@RequestParam(required = false) Ticket.Category category,
                             @RequestParam(required = false) Ticket.Status status,
                             @RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "10") int size) {
        return service.list(category, status, page, size);
    }

    @GetMapping("/{id}")
    public Ticket get(@PathVariable Long id) { return service.get(id); }

    @PutMapping("/{id}")
    public Ticket update(@PathVariable Long id, @Valid @RequestBody TicketRequest r) { return service.update(id, r); }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Ticket updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest r) {
        return service.updateStatus(id, r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

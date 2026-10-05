package com.campus.smartcampus.controller;

import com.campus.smartcampus.dto.Dtos.EventRequest;
import com.campus.smartcampus.entity.Event;
import com.campus.smartcampus.entity.EventRegistration;
import com.campus.smartcampus.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Event> create(@Valid @RequestBody EventRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));
    }

    @GetMapping
    public List<Event> list() { return service.list(); }

    @GetMapping("/{id}")
    public Event get(@PathVariable Long id) { return service.get(id); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Event update(@PathVariable Long id, @Valid @RequestBody EventRequest r) { return service.update(id, r); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<EventRegistration> register(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(id));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancelRegistration(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<EventRegistration> registrations(@PathVariable Long id) { return service.registrationsOf(id); }

    @GetMapping("/my-registrations")
    public List<EventRegistration> myRegistrations() { return service.myRegistrations(); }
}

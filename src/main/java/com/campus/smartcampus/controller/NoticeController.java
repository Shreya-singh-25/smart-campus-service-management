package com.campus.smartcampus.controller;

import com.campus.smartcampus.dto.Dtos.NoticeRequest;
import com.campus.smartcampus.entity.Notice;
import com.campus.smartcampus.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    private final NoticeService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Notice> create(@Valid @RequestBody NoticeRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));
    }

    @GetMapping
    public List<Notice> list() { return service.list(); }

    @GetMapping("/{id}")
    public Notice get(@PathVariable Long id) { return service.get(id); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Notice update(@PathVariable Long id, @Valid @RequestBody NoticeRequest r) { return service.update(id, r); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

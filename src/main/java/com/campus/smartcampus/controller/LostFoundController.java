package com.campus.smartcampus.controller;

import com.campus.smartcampus.dto.Dtos.LostFoundRequest;
import com.campus.smartcampus.entity.LostFoundItem;
import com.campus.smartcampus.service.LostFoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
public class LostFoundController {
    private final LostFoundService service;

    @PostMapping
    public ResponseEntity<LostFoundItem> create(@Valid @RequestBody LostFoundRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r));
    }

    @GetMapping
    public List<LostFoundItem> list(@RequestParam(required = false) LostFoundItem.Type type) {
        return service.list(type);
    }

    @GetMapping("/{id}")
    public LostFoundItem get(@PathVariable Long id) { return service.get(id); }

    @PatchMapping("/{id}/claim")
    public LostFoundItem claim(@PathVariable Long id) { return service.markClaimed(id); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

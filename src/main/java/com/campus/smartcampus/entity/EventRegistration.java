package com.campus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Getter @Setter @NoArgsConstructor
public class EventRegistration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private AppUser user;

    private LocalDateTime registeredAt;

    @PrePersist void onCreate() { registeredAt = LocalDateTime.now(); }
}

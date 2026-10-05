package com.campus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "campus_events")
@Getter @Setter @NoArgsConstructor
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String venue;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private int capacity;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
}

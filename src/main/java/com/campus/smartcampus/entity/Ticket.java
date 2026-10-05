package com.campus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One table for Complaints, Hostel issues, Maintenance and Service requests (differentiated by category). */
@Entity
@Table(name = "tickets")
@Getter @Setter @NoArgsConstructor
public class Ticket {
    public enum Category { COMPLAINT, HOSTEL_ISSUE, MAINTENANCE, SERVICE_REQUEST }
    public enum Priority { LOW, MEDIUM, HIGH }
    public enum Status { OPEN, IN_PROGRESS, RESOLVED, REJECTED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Status status = Status.OPEN;

    private String location;
    private String adminRemarks;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  void onUpdate() { updatedAt = LocalDateTime.now(); }
}

package com.campus.smartcampus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "lost_found_items")
@Getter @Setter @NoArgsConstructor
public class LostFoundItem {
    public enum Type { LOST, FOUND }
    public enum Status { OPEN, CLAIMED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemName;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Status status = Status.OPEN;

    private String location;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reported_by")
    private AppUser reportedBy;

    private LocalDateTime createdAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
}

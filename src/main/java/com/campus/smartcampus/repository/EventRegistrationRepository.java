package com.campus.smartcampus.repository;

import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.entity.Event;
import com.campus.smartcampus.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    boolean existsByEventAndUser(Event event, AppUser user);
    long countByEvent(Event event);
    Optional<EventRegistration> findByEventAndUser(Event event, AppUser user);
    List<EventRegistration> findByEvent(Event event);
    List<EventRegistration> findByUser(AppUser user);
    void deleteByEvent(Event event);
}

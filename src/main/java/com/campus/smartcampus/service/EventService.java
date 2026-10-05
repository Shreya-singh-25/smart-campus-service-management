package com.campus.smartcampus.service;

import com.campus.smartcampus.dto.Dtos.EventRequest;
import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.entity.Event;
import com.campus.smartcampus.entity.EventRegistration;
import com.campus.smartcampus.exception.BadRequestException;
import com.campus.smartcampus.exception.DuplicateResourceException;
import com.campus.smartcampus.exception.ResourceNotFoundException;
import com.campus.smartcampus.repository.EventRegistrationRepository;
import com.campus.smartcampus.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository events;
    private final EventRegistrationRepository registrations;
    private final CurrentUserService currentUser;

    public Event create(EventRequest r) {
        Event e = new Event();
        apply(e, r);
        e.setCreatedBy(currentUser.get());
        return events.save(e);
    }

    public List<Event> list() { return events.findAllByOrderByEventDateAsc(); }

    public Event get(Long id) {
        return events.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found with id " + id));
    }

    public Event update(Long id, EventRequest r) {
        Event e = get(id);
        apply(e, r);
        return events.save(e);
    }

    @Transactional
    public void delete(Long id) {
        Event e = get(id);
        registrations.deleteByEvent(e);
        events.delete(e);
    }

    @Transactional
    public EventRegistration register(Long eventId) {
        Event e = get(eventId);
        AppUser me = currentUser.get();
        if (e.getEventDate().isBefore(LocalDateTime.now())) throw new BadRequestException("Event is already over");
        if (registrations.existsByEventAndUser(e, me)) throw new DuplicateResourceException("You are already registered for this event");
        if (registrations.countByEvent(e) >= e.getCapacity()) throw new BadRequestException("Event is full");
        EventRegistration reg = new EventRegistration();
        reg.setEvent(e);
        reg.setUser(me);
        return registrations.save(reg);
    }

    @Transactional
    public void cancelRegistration(Long eventId) {
        Event e = get(eventId);
        EventRegistration reg = registrations.findByEventAndUser(e, currentUser.get())
                .orElseThrow(() -> new ResourceNotFoundException("You are not registered for this event"));
        registrations.delete(reg);
    }

    public List<EventRegistration> registrationsOf(Long eventId) {
        return registrations.findByEvent(get(eventId));
    }

    public List<EventRegistration> myRegistrations() {
        return registrations.findByUser(currentUser.get());
    }

    private void apply(Event e, EventRequest r) {
        e.setTitle(r.title());
        e.setDescription(r.description());
        e.setVenue(r.venue());
        e.setEventDate(r.eventDate());
        e.setCapacity(r.capacity());
    }
}

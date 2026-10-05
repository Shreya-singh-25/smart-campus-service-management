package com.campus.smartcampus.service;

import com.campus.smartcampus.dto.Dtos.StatusUpdateRequest;
import com.campus.smartcampus.dto.Dtos.TicketRequest;
import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.entity.Ticket;
import com.campus.smartcampus.exception.BadRequestException;
import com.campus.smartcampus.exception.ResourceNotFoundException;
import com.campus.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository repo;
    private final CurrentUserService currentUser;

    public Ticket create(TicketRequest r) {
        Ticket t = new Ticket();
        apply(t, r);
        t.setCreatedBy(currentUser.get());
        return repo.save(t);
    }

    public Page<Ticket> list(Ticket.Category category, Ticket.Status status, int page, int size) {
        AppUser me = currentUser.get();
        Long userId = currentUser.isStaff(me) ? null : me.getId();   // students see only their own
        return repo.search(category, status, userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public Ticket get(Long id) {
        Ticket t = find(id);
        AppUser me = currentUser.get();
        if (!currentUser.isStaff(me) && !t.getCreatedBy().getId().equals(me.getId())) {
            throw new AccessDeniedException("Not your ticket");
        }
        return t;
    }

    public Ticket update(Long id, TicketRequest r) {
        Ticket t = find(id);
        AppUser me = currentUser.get();
        if (!t.getCreatedBy().getId().equals(me.getId())) throw new AccessDeniedException("Not your ticket");
        if (t.getStatus() != Ticket.Status.OPEN) throw new BadRequestException("Only OPEN tickets can be edited");
        apply(t, r);
        return repo.save(t);
    }

    public Ticket updateStatus(Long id, StatusUpdateRequest r) {
        Ticket t = find(id);
        t.setStatus(r.status());
        t.setAdminRemarks(r.adminRemarks());
        return repo.save(t);
    }

    public void delete(Long id) {
        Ticket t = find(id);
        AppUser me = currentUser.get();
        boolean admin = me.getRole() == AppUser.Role.ADMIN;
        boolean owner = t.getCreatedBy().getId().equals(me.getId());
        if (!admin && !owner) throw new AccessDeniedException("Not allowed");
        if (!admin && t.getStatus() != Ticket.Status.OPEN) throw new BadRequestException("Only OPEN tickets can be deleted");
        repo.delete(t);
    }

    private Ticket find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id " + id));
    }

    private void apply(Ticket t, TicketRequest r) {
        t.setTitle(r.title());
        t.setDescription(r.description());
        t.setCategory(r.category());
        t.setLocation(r.location());
        if (r.priority() != null) t.setPriority(r.priority());
    }
}

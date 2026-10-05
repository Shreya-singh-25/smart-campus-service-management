package com.campus.smartcampus.repository;

import com.campus.smartcampus.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT t FROM Ticket t WHERE (:category IS NULL OR t.category = :category) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:userId IS NULL OR t.createdBy.id = :userId)")
    Page<Ticket> search(@Param("category") Ticket.Category category,
                        @Param("status") Ticket.Status status,
                        @Param("userId") Long userId,
                        Pageable pageable);
}

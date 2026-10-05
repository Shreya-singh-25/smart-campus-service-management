package com.campus.smartcampus.service;

import com.campus.smartcampus.dto.Dtos.NoticeRequest;
import com.campus.smartcampus.entity.Notice;
import com.campus.smartcampus.exception.ResourceNotFoundException;
import com.campus.smartcampus.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository repo;
    private final CurrentUserService currentUser;

    public Notice create(NoticeRequest r) {
        Notice n = new Notice();
        n.setTitle(r.title());
        n.setContent(r.content());
        n.setPostedBy(currentUser.get());
        return repo.save(n);
    }

    public List<Notice> list() { return repo.findAllByOrderByCreatedAtDesc(); }

    public Notice get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notice not found with id " + id));
    }

    public Notice update(Long id, NoticeRequest r) {
        Notice n = get(id);
        n.setTitle(r.title());
        n.setContent(r.content());
        return repo.save(n);
    }

    public void delete(Long id) { repo.delete(get(id)); }
}

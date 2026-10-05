package com.campus.smartcampus.service;

import com.campus.smartcampus.dto.Dtos.LostFoundRequest;
import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.entity.LostFoundItem;
import com.campus.smartcampus.exception.ResourceNotFoundException;
import com.campus.smartcampus.repository.LostFoundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LostFoundService {
    private final LostFoundRepository repo;
    private final CurrentUserService currentUser;

    public LostFoundItem create(LostFoundRequest r) {
        LostFoundItem i = new LostFoundItem();
        i.setItemName(r.itemName());
        i.setDescription(r.description());
        i.setType(r.type());
        i.setLocation(r.location());
        i.setReportedBy(currentUser.get());
        return repo.save(i);
    }

    public List<LostFoundItem> list(LostFoundItem.Type type) {
        return type == null ? repo.findAllByOrderByCreatedAtDesc() : repo.findByTypeOrderByCreatedAtDesc(type);
    }

    public LostFoundItem get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Item not found with id " + id));
    }

    public LostFoundItem markClaimed(Long id) {
        LostFoundItem i = get(id);
        checkOwnerOrStaff(i);
        i.setStatus(LostFoundItem.Status.CLAIMED);
        return repo.save(i);
    }

    public void delete(Long id) {
        LostFoundItem i = get(id);
        checkOwnerOrStaff(i);
        repo.delete(i);
    }

    private void checkOwnerOrStaff(LostFoundItem i) {
        AppUser me = currentUser.get();
        if (!currentUser.isStaff(me) && !i.getReportedBy().getId().equals(me.getId())) {
            throw new AccessDeniedException("Not allowed");
        }
    }
}

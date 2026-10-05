package com.campus.smartcampus.repository;

import com.campus.smartcampus.entity.LostFoundItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LostFoundRepository extends JpaRepository<LostFoundItem, Long> {
    List<LostFoundItem> findByTypeOrderByCreatedAtDesc(LostFoundItem.Type type);
    List<LostFoundItem> findAllByOrderByCreatedAtDesc();
}

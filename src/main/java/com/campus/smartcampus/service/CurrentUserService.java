package com.campus.smartcampus.service;

import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.exception.ResourceNotFoundException;
import com.campus.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;

    public AppUser get() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found"));
    }

    /** STAFF and ADMIN count as staff. */
    public boolean isStaff(AppUser u) {
        return u.getRole() != AppUser.Role.STUDENT;
    }
}

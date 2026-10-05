package com.campus.smartcampus.service;

import com.campus.smartcampus.dto.Dtos.AuthResponse;
import com.campus.smartcampus.dto.Dtos.LoginRequest;
import com.campus.smartcampus.dto.Dtos.RegisterRequest;
import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.exception.DuplicateResourceException;
import com.campus.smartcampus.repository.UserRepository;
import com.campus.smartcampus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email already registered: " + req.email());
        }
        AppUser u = new AppUser();
        u.setName(req.name());
        u.setEmail(req.email());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setDepartment(req.department());
        u.setRole(AppUser.Role.STUDENT);   // public signup is always STUDENT
        userRepository.save(u);
        return new AuthResponse(jwtUtil.generateToken(u.getEmail(), u.getRole().name()),
                u.getName(), u.getEmail(), u.getRole().name());
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        AppUser u = userRepository.findByEmail(req.email()).orElseThrow();
        return new AuthResponse(jwtUtil.generateToken(u.getEmail(), u.getRole().name()),
                u.getName(), u.getEmail(), u.getRole().name());
    }
}

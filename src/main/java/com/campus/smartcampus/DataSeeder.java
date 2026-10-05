package com.campus.smartcampus;

import com.campus.smartcampus.entity.AppUser;
import com.campus.smartcampus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Creates a default ADMIN and STAFF account on first run. */
@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(UserRepository users, PasswordEncoder encoder) {
        return args -> {
            create(users, encoder, "Campus Admin", "admin@campus.com", "admin123", AppUser.Role.ADMIN);
            create(users, encoder, "Campus Staff", "staff@campus.com", "staff123", AppUser.Role.STAFF);
        };
    }

    private void create(UserRepository users, PasswordEncoder encoder, String name, String email, String pw, AppUser.Role role) {
        if (users.existsByEmail(email)) return;
        AppUser u = new AppUser();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(pw));
        u.setRole(role);
        u.setDepartment("Administration");
        users.save(u);
    }
}

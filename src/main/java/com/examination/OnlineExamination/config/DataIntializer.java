package com.examination.OnlineExamination.config;

import com.examination.OnlineExamination.model.Admin;
import com.examination.OnlineExamination.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataIntializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!adminRepository.existsByEmail("admin@exam.com")) {
            Admin admin = Admin.builder()
                    .name("System Admin")
                    .email("admin@exam.com")
                    .password(passwordEncoder.encode("admin123"))
                    .build();
            adminRepository.save(admin);
            System.out.println("✅ Default Admin seeded → admin@exam.com / admin123");
        }
    }
}

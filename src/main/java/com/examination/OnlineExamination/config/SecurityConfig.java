package com.examination.OnlineExamination.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Public ──────────────────────────────────────────
                        .requestMatchers("/auth/**").permitAll()

                        // ── ADMIN only ───────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/subjects").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/subjects/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/subjects/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // ── FACULTY only ─────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/exams").hasRole("FACULTY")
                        .requestMatchers(HttpMethod.PUT,    "/exams/**").hasRole("FACULTY")
                        .requestMatchers(HttpMethod.DELETE, "/exams/**").hasRole("FACULTY")
                        .requestMatchers(HttpMethod.POST,   "/exams/*/questions").hasRole("FACULTY")
                        .requestMatchers(HttpMethod.DELETE, "/questions/**").hasRole("FACULTY")

                        // ── STUDENT only (specific paths BEFORE wildcards) ───
                        .requestMatchers("/enrollments/my").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST,   "/enrollments").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.DELETE, "/enrollments/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/attempts/start/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/attempts/submit/**").hasRole("STUDENT")
                        .requestMatchers("/attempts/my").hasRole("STUDENT")
                        .requestMatchers("/results/my").hasRole("STUDENT")
                        .requestMatchers("/results/attempt/**").hasRole("STUDENT")

                        // ── FACULTY + ADMIN ──────────────────────────────────
                        .requestMatchers("/results/exam/**").hasAnyRole("FACULTY", "ADMIN")
                        .requestMatchers("/results/report/**").hasAnyRole("FACULTY", "ADMIN")
                        .requestMatchers("/admin/weak-questions/**").hasAnyRole("FACULTY", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/enrollments/exam/**").hasAnyRole("FACULTY", "ADMIN")
                        .requestMatchers("/attempts/exam/**").hasAnyRole("FACULTY", "ADMIN")

                        // ── Everything else needs authentication ─────────────
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

}

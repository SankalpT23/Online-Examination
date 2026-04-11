package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty,Long> {
    Optional<Faculty> findByEmail(String email);
    boolean existsByEmail(String email);
}

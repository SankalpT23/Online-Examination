package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student,Long> {
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
}

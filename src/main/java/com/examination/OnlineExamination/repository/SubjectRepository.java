package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject,Long> {
    List<Subject> findByDepartment(String department);

    List<Subject> findBySemester(Integer semester);

    List<Subject> findByDepartmentAndSemester(String department, Integer semester);

    boolean existsBySubjectNameAndDepartmentAndSemester(
            String subjectName, String department, Integer semester);
}

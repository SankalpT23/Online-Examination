package com.examination.OnlineExamination.repository;

import com.examination.OnlineExamination.enums.ExamStatus;
import com.examination.OnlineExamination.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByFaculty_FacultyId(Long facultyId);

    List<Exam> findByStatus(ExamStatus status);


    List<Exam> findByStatusAndSubject_Department(ExamStatus status, String department);

    List<Exam> findBySubject_SubjectId(Long subjectId);

    long countByStatus(ExamStatus status);
    long countByFaculty_FacultyId(Long facultyId);

    @Query("SELECT e FROM Exam e WHERE e.examId = :examId AND e.faculty.facultyId = :facultyId")
    java.util.Optional<Exam> findByExamIdAndFacultyId(
            @Param("examId") Long examId,
            @Param("facultyId") Long facultyId);
}

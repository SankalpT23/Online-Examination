package com.examination.OnlineExamination.service;

import com.examination.OnlineExamination.dto.requests.SubjectRequest;
import com.examination.OnlineExamination.dto.responses.SubjectResponse;
import com.examination.OnlineExamination.exception.ResourceNotFoundException;
import com.examination.OnlineExamination.model.Subject;
import com.examination.OnlineExamination.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;

    // ──────────────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────────────
    @Transactional
    public SubjectResponse create(SubjectRequest request) {
        if (subjectRepository.existsBySubjectNameAndDepartmentAndSemester(
                request.getSubjectName(), request.getDepartment(), request.getSemester())) {
            throw new RuntimeException(
                    "Subject '" + request.getSubjectName() +
                            "' already exists for " + request.getDepartment() +
                            " Semester " + request.getSemester()
            );
        }

        Subject subject = Subject.builder()
                .subjectName(request.getSubjectName())
                .department(request.getDepartment())
                .semester(request.getSemester())
                .build();

        return mapToResponse(subjectRepository.save(subject));
    }

    // ──────────────────────────────────────────────────────
    // UPDATE
    // ──────────────────────────────────────────────────────
    @Transactional
    public SubjectResponse update(Long subjectId, SubjectRequest request) {
        Subject subject = findSubjectById(subjectId);
        subject.setSubjectName(request.getSubjectName());
        subject.setDepartment(request.getDepartment());
        subject.setSemester(request.getSemester());
        return mapToResponse(subjectRepository.save(subject));
    }

    // ──────────────────────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────────────────────
    @Transactional
    public void delete(Long subjectId) {
        Subject subject = findSubjectById(subjectId);
        subjectRepository.delete(subject);
    }

    // ──────────────────────────────────────────────────────
    // GET ALL
    // ──────────────────────────────────────────────────────
    public List<SubjectResponse> getAll() {
        return subjectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────
    // GET BY ID
    // ──────────────────────────────────────────────────────
    public SubjectResponse getById(Long subjectId) {
        return mapToResponse(findSubjectById(subjectId));
    }

    // ──────────────────────────────────────────────────────
    // GET BY DEPARTMENT + SEMESTER (filter for students)
    // ──────────────────────────────────────────────────────
    public List<SubjectResponse> getByDepartmentAndSemester(String department, Integer semester) {
        return subjectRepository.findByDepartmentAndSemester(department, semester)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────
    public Subject findSubjectById(Long subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Subject not found with id: " + subjectId));
    }

    private SubjectResponse mapToResponse(Subject subject) {
        return SubjectResponse.builder()
                .subjectId(subject.getSubjectId())
                .subjectName(subject.getSubjectName())
                .department(subject.getDepartment())
                .semester(subject.getSemester())
                .build();
    }
}

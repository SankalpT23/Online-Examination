package com.examination.OnlineExamination.controller;

import com.examination.OnlineExamination.dto.requests.SubjectRequest;
import com.examination.OnlineExamination.dto.responses.SubjectResponse;
import com.examination.OnlineExamination.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
@RequiredArgsConstructor
public class SubjectController {
    private final SubjectService subjectService;

    // POST /subjects — ADMIN only
    @PostMapping
    public ResponseEntity<SubjectResponse> create(
            @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectService.create(request));
    }

    // PUT /subjects/{id} — ADMIN only
    @PutMapping("/{id}")
    public ResponseEntity<SubjectResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.update(id, request));
    }

    // DELETE /subjects/{id} — ADMIN only
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /subjects — all authenticated
    @GetMapping
    public ResponseEntity<List<SubjectResponse>> getAll() {
        return ResponseEntity.ok(subjectService.getAll());
    }

    // GET /subjects/{id} — all authenticated
    @GetMapping("/{id}")
    public ResponseEntity<SubjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getById(id));
    }

    // GET /subjects/filter?department=CSE&semester=4 — all authenticated
    @GetMapping("/filter")
    public ResponseEntity<List<SubjectResponse>> filter(
            @RequestParam String department,
            @RequestParam Integer semester) {
        return ResponseEntity.ok(
                subjectService.getByDepartmentAndSemester(department, semester));
    }
}

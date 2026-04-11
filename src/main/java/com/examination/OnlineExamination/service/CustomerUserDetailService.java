package com.examination.OnlineExamination.service;

import com.examination.OnlineExamination.enums.UserType;
import com.examination.OnlineExamination.model.Admin;
import com.examination.OnlineExamination.model.Faculty;
import com.examination.OnlineExamination.model.Student;
import com.examination.OnlineExamination.repository.AdminRepository;
import com.examination.OnlineExamination.repository.FacultyRepository;
import com.examination.OnlineExamination.repository.StudentRepository;
import com.examination.OnlineExamination.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerUserDetailService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    public UserDetails loadUserByEmailAndType(String email, UserType userType){
        return switch (userType) {
            case ADMIN -> {
                Admin admin = adminRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + email));
                yield new UserPrincipal(admin.getAdminId(), admin.getEmail(),
                        admin.getPassword(), UserType.ADMIN);
            }
            case FACULTY -> {
                Faculty faculty = facultyRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("Faculty not found: " + email));
                yield new UserPrincipal(faculty.getFacultyId(), faculty.getEmail(),
                        faculty.getPassword(), UserType.FACULTY);
            }
            case STUDENT -> {
                Student student = studentRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("Student not found: " + email));
                yield new UserPrincipal(student.getStudentId(), student.getEmail(),
                        student.getPassword(), UserType.STUDENT);
            }
        };
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return new UserPrincipal(admin.get().getAdminId(), admin.get().getEmail(),
                    admin.get().getPassword(), UserType.ADMIN);
        }

        var faculty = facultyRepository.findByEmail(email);
        if (faculty.isPresent()) {
            return new UserPrincipal(faculty.get().getFacultyId(), faculty.get().getEmail(),
                    faculty.get().getPassword(), UserType.FACULTY);
        }

        var student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            return new UserPrincipal(student.get().getStudentId(), student.get().getEmail(),
                    student.get().getPassword(), UserType.STUDENT);
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}

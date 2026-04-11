package com.examination.OnlineExamination.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ──────────────────────────────────────────────────────
    // Core send method — all emails go through here
    // ──────────────────────────────────────────────────────
    @Async
    public void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
            log.info("✅ Email sent to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ──────────────────────────────────────────────────────
    // EMAIL 1 — Exam Result after submission
    // Called from AttemptService after submit
    // ──────────────────────────────────────────────────────
    @Async
    public void sendResultEmail(String toEmail,
                                String studentName,
                                String examName,
                                String subjectName,
                                int score,
                                int totalMarks,
                                double percentage,
                                String grade,
                                String result) {

        String subject = "Your Exam Result — " + examName;

        String resultColor = result.equals("PASS") ? "#28a745" : "#dc3545";
        String gradeColor  = switch (grade) {
            case "A"  -> "#007bff";
            case "B"  -> "#17a2b8";
            case "C"  -> "#ffc107";
            case "D"  -> "#fd7e14";
            default   -> "#dc3545";
        };

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: auto; background: #fff;
                             border-radius: 8px; overflow: hidden;
                             box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #1a237e; color: white; padding: 24px 32px; }
                .header h1 { margin: 0; font-size: 22px; }
                .header p  { margin: 4px 0 0; font-size: 14px; opacity: 0.85; }
                .body { padding: 32px; }
                .greeting { font-size: 16px; color: #333; margin-bottom: 24px; }
                .scorecard { background: #f8f9fa; border-radius: 8px;
                             padding: 20px; margin-bottom: 24px; }
                .scorecard table { width: 100%%; border-collapse: collapse; }
                .scorecard td { padding: 10px 8px; font-size: 15px; }
                .scorecard td:first-child { color: #555; font-weight: 500; }
                .scorecard td:last-child  { color: #222; font-weight: bold; text-align: right; }
                .badge { display: inline-block; padding: 6px 18px; border-radius: 20px;
                         color: white; font-size: 16px; font-weight: bold; }
                .footer { background: #f4f4f4; padding: 16px 32px;
                          font-size: 12px; color: #888; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📋 Exam Result</h1>
                  <p>Online Examination System</p>
                </div>
                <div class="body">
                  <p class="greeting">Dear <strong>%s</strong>,</p>
                  <p>Your result for <strong>%s</strong> (%s) has been published.</p>
                  <div class="scorecard">
                    <table>
                      <tr><td>Score</td>
                          <td>%d / %d</td></tr>
                      <tr><td>Percentage</td>
                          <td>%.2f%%</td></tr>
                      <tr><td>Grade</td>
                          <td><span class="badge" style="background:%s">%s</span></td></tr>
                      <tr><td>Result</td>
                          <td><span class="badge" style="background:%s">%s</span></td></tr>
                    </table>
                  </div>
                  <p style="color:#555;">Keep up the great work and continue learning!</p>
                </div>
                <div class="footer">
                  This is an automated email. Please do not reply.
                </div>
              </div>
            </body>
            </html>
            """.formatted(studentName, examName, subjectName,
                score, totalMarks, percentage,
                gradeColor, grade,
                resultColor, result);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    // ──────────────────────────────────────────────────────
    // EMAIL 2 — Exam published notification to all enrolled students
    // Called from ExamService when faculty publishes exam
    // ──────────────────────────────────────────────────────
    @Async
    public void sendExamPublishedEmail(String toEmail,
                                       String studentName,
                                       String examName,
                                       String subjectName,
                                       String facultyName,
                                       String startTime,
                                       String endTime,
                                       int durationMins,
                                       int totalMarks) {

        String subject = "Exam Scheduled — " + examName;

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: auto; background: #fff;
                             border-radius: 8px; overflow: hidden;
                             box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #0d47a1; color: white; padding: 24px 32px; }
                .header h1 { margin: 0; font-size: 22px; }
                .header p  { margin: 4px 0 0; font-size: 14px; opacity: 0.85; }
                .body { padding: 32px; }
                .infobox { background: #e8f4fd; border-left: 4px solid #0d47a1;
                           border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
                .infobox table { width: 100%%; border-collapse: collapse; }
                .infobox td { padding: 8px 4px; font-size: 14px; }
                .infobox td:first-child { color: #555; font-weight: 500; width: 140px; }
                .infobox td:last-child  { color: #222; font-weight: bold; }
                .tip { background: #fff3cd; border-radius: 6px;
                       padding: 14px 18px; font-size: 14px; color: #856404; }
                .footer { background: #f4f4f4; padding: 16px 32px;
                          font-size: 12px; color: #888; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📅 Exam Scheduled</h1>
                  <p>Online Examination System</p>
                </div>
                <div class="body">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>An exam has been scheduled for you. Please review the details below:</p>
                  <div class="infobox">
                    <table>
                      <tr><td>Exam Name</td>  <td>%s</td></tr>
                      <tr><td>Subject</td>    <td>%s</td></tr>
                      <tr><td>Faculty</td>    <td>%s</td></tr>
                      <tr><td>Start Time</td> <td>%s</td></tr>
                      <tr><td>End Time</td>   <td>%s</td></tr>
                      <tr><td>Duration</td>   <td>%d minutes</td></tr>
                      <tr><td>Total Marks</td><td>%d</td></tr>
                    </table>
                  </div>
                  <div class="tip">
                    💡 <strong>Tip:</strong> Log in before the start time and make sure
                    you have a stable internet connection.
                  </div>
                </div>
                <div class="footer">
                  This is an automated email. Please do not reply.
                </div>
              </div>
            </body>
            </html>
            """.formatted(studentName, examName, subjectName, facultyName,
                startTime, endTime, durationMins, totalMarks);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    // ──────────────────────────────────────────────────────
    // EMAIL 3 — Welcome email on registration
    // Called from AuthService after register
    // ──────────────────────────────────────────────────────
    @Async
    public void sendWelcomeEmail(String toEmail, String name, String role) {

        String subject = "Welcome to Online Examination System";

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4;
                       margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: auto; background: #fff;
                             border-radius: 8px; overflow: hidden;
                             box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #1b5e20; color: white; padding: 24px 32px; }
                .header h1 { margin: 0; font-size: 22px; }
                .body { padding: 32px; font-size: 15px; color: #333; }
                .role-badge { display: inline-block; background: #e8f5e9; color: #1b5e20;
                              border: 1px solid #a5d6a7; padding: 4px 14px;
                              border-radius: 12px; font-weight: bold; font-size: 14px; }
                .footer { background: #f4f4f4; padding: 16px 32px;
                          font-size: 12px; color: #888; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>👋 Welcome Aboard!</h1>
                </div>
                <div class="body">
                  <p>Hi <strong>%s</strong>,</p>
                  <p>Your account has been successfully created on the
                     <strong>Online Examination System</strong>.</p>
                  <p>Your role: <span class="role-badge">%s</span></p>
                  <p>You can now log in and start using the platform.</p>
                  <p style="margin-top:24px;">Best regards,<br/>
                     <strong>Online Examination Team</strong></p>
                </div>
                <div class="footer">
                  This is an automated email. Please do not reply.
                </div>
              </div>
            </body>
            </html>
            """.formatted(name, role);

        sendHtmlEmail(toEmail, subject, htmlBody);
    }
}

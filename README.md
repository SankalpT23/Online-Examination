# Online Examination System

<div align="center">
  A full-stack, secure, and responsive web application designed for conducting online assessments and managing examinations seamlessly.
</div>

---

## 📖 Overview

The **Online Examination System** provides a comprehensive platform for administrators to manage exams, subjects, and questions, while empowering students to enroll, attempt time-bound exams, and view their performance instantly. 

Designed with modern web practices, this application ensures a responsive, user-friendly experience on the frontend along with a secure, highly-scalable backend architecture.

## 🚀 Tech Stack

### Backend
- **Java 21** & **Spring Boot 3.5**
- **Spring Security & JWT** - Secure authentication & authorization
- **Spring Data JPA & MySQL** - Robust data persistence
- **Spring Mail** - Automated email handling
- **Lombok** - Boilerplate code reduction

### Frontend
- **React 18** & **TypeScript** powered by **Vite**
- **Tailwind CSS**, **Radix UI**, & **class-variance-authority** - Beautiful, dynamic, and accessible UI components
- **React Router DOM** - Client-side routing
- **TanStack React Query** & **Axios** - Efficient server state management and asynchronous API calls
- **Lucide React** - Modern iconography

## ✨ Key Features

- **Authentication & Authorization:** Secure, role-based JWT authentication separating Admins from Students.
- **Admin Capabilities:** Complete lifecycle management for exams, questions, and subjects.
- **Student Dashboard:** Intuitive portal for students to discover, enroll in, and attempt available exams.
- **Live Exam Environment:** Seamless test-taking experience with progress management and automatic secure submission.
- **Results & Analytics:** Instant grading and transparent result tracking for specific exam attempts.

## 🛠️ Getting Started

Follow the steps below to set up the project locally.

### Prerequisites
- **Java 21** or higher
- **Node.js** (v18+) and **npm**
- **MySQL** instance running locally

### 1. Backend Setup
1. Clone the repository and navigate to the project root.
2. Update the database configurations (URL, username, password) inside `src/main/resources/application.properties` or `application.yml`.
3. Start the Spring Boot application using Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend server will typically start on `http://localhost:8080`.*

### 2. Frontend Setup
1. Navigate to the frontend workspace:
   ```bash
   cd "Online-Exam Frontend"
   ```
2. Install the necessary Node dependencies:
   ```bash
   npm install
   ```
3. Spin up the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be accessible at `http://localhost:5173`.*

## 📜 License
This project is open-source and available under the relevant license detailed in the `LICENSE` file.

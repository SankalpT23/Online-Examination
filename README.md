<div align="center">

<br/>

# 📝 Online Examination System

**A modern, secure, and blazing-fast platform to conduct online assessments — built for educators, loved by students.**

<br/>

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

<br/>

</div>

---

## ✨ What is this?

**Online Examination System** is a full-stack web app that makes running exams effortless. Admins can create and manage exams in minutes. Students get a clean, distraction-free interface to attempt them — with a live timer, instant results, and their full history at a glance.

No paper. No manual grading. Just exams that work.

---

## 🚀 Features

| For Admins | For Students |
|---|---|
| ✅ Create & manage exams, subjects, and questions | ✅ Browse and enroll in available exams |
| ✅ Full lifecycle control (draft → publish) | ✅ Timed, distraction-free exam environment |
| ✅ View all student results and analytics | ✅ Auto-graded results the moment you submit |
| ✅ Role-based access control | ✅ Full personal attempt history |

**Under the hood:** secure JWT authentication, automated email notifications, real-time progress tracking, and automatic submission when time runs out.

---

## 🛠️ Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.5**
- **Spring Security** + **JWT** — stateless, role-based auth
- **Spring Data JPA** + **MySQL** — rock-solid persistence
- **Spring Mail** — automated email handling
- **Lombok** — clean, concise code

### Frontend
- **React 18** + **TypeScript** — type-safe UI
- **Vite** — lightning-fast dev server & builds
- **Tailwind CSS** + **Radix UI** — beautiful, accessible components
- **TanStack Query** + **Axios** — smart server-state management
- **React Router DOM** — seamless client-side navigation

---

## ⚡ Getting Started

### Prerequisites

Make sure you have these installed:

- **Java 21+**
- **Node.js v18+** and **npm**
- A running **MySQL** instance

---

### 1️⃣ Clone the repo

```bash
git clone https://github.com/SankalpT23/Online-Examination.git
cd Online-Examination
```

### 2️⃣ Configure the database

Open `src/main/resources/application.properties` and update:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_db_name
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3️⃣ Start the backend

```bash
./mvnw spring-boot:run
```

> Backend runs at → `http://localhost:8080`

### 4️⃣ Start the frontend

```bash
cd "Online-Exam Frontend"
npm install
npm run dev
```

> Frontend runs at → `http://localhost:5173`

That's it. You're live. 🎉

---

## 🗂️ Project Structure

```
Online-Examination/
├── src/                        # Spring Boot backend
│   └── main/
│       ├── java/               # Controllers, services, entities
│       └── resources/          # application.properties
├── Online-Exam Frontend/       # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Route pages
│   │   └── api/                # Axios API calls
│   └── package.json
└── pom.xml                     # Maven build config
```

---

## 🔐 Authentication Flow

```
User Login → JWT issued → Stored on client
         → Every API request carries Bearer token
         → Spring Security validates role (ADMIN / STUDENT)
         → Access granted or denied accordingly
```

---

## 🤝 Contributing

Contributions are warmly welcome! Here's how:

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

⭐ **If you find this useful, drop a star — it means a lot!** ⭐

</div>

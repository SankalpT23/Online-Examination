# Aura Exams — Online Examination Frontend

React + TypeScript frontend for the Aura Exams online examination platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Axios** for API calls
- **React Router** for navigation

## Getting Started

```bash
npm install
npm run dev
```

The dev server proxies API requests to the Spring Boot backend at `http://localhost:8080`.

## Project Structure

```
src/
├── components/    # Reusable UI components
├── contexts/      # Auth & Data contexts
├── hooks/         # Custom React hooks
├── lib/           # API service layer & utilities
├── pages/         # Page components
└── main.tsx       # Entry point
```

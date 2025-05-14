# CognitiveLabsSchool - Revolutionizing Professional AI Education 🚀

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
</p>

## Igniting AI Potential in Every Professional

CognitiveLabsSchool is an innovative AI-powered education platform meticulously engineered to empower professionals and organizations to master and integrate Artificial Intelligence into their daily workflows. In an era where AI is reshaping industries, we provide a B2B solution offering a dynamic curriculum tailored for diverse expertise levels—from AI novices to seasoned practitioners. Our mission is to enhance productivity, drive efficiency, and ensure your workforce remains at the competitive vanguard.

The platform is built on the philosophy of making learning engaging, accessible, and deeply personalized. Inspired by proven pedagogical methods like Kumon and Montessori, we focus on identifying and maximizing individual student skillsets to foster true mastery and application of AI.

## Why CognitiveLabsSchool? The Opportunity ✨

*   **Problem:** Many professionals recognize the transformative power of AI but lack the specific skills or a clear path to integrate it effectively into their work. Generic courses often fail to address specific industry needs or individual learning paces.
*   **Solution:** CognitiveLabsSchool offers a personalized, adaptive learning experience. We don't just teach AI; we cultivate AI-thinkers and problem-solvers.
*   **Value Proposition:** For businesses, this means a more agile, innovative, and future-ready workforce. For individuals, it's a pathway to career growth and enhanced professional capabilities.
*   **Market:** The demand for AI upskilling is exploding across all sectors. CognitiveLabsSchool is poised to capture a significant share by offering a superior, tailored learning journey.

## Core Philosophy & Differentiators 🧠

*   **Personalized Pathways:** Learning is not one-size-fits-all. Our platform adapts to individual needs and learning styles.
*   **Skill-Centric:** We focus on developing tangible, applicable AI skills, tracked and nurtured through our proficiency system.
*   **Hands-On & Practical:** Emphasis on real-world application and project-based learning.
*   **Inspired Pedagogy:** Drawing from effective learning methodologies to ensure deep understanding and retention.

## Technical Architecture Overview 🏗️

CognitiveLabsSchool employs a modern, robust, and scalable tech stack:

*   **Frontend:** A dynamic and responsive user interface built with **Next.js (React)** and **TypeScript**, ensuring a seamless user experience.
*   **Backend:** A powerful API service developed with **Python** and **FastAPI**, providing high performance and easy scalability. Business logic, data processing, and AI-driven features are handled here.
*   **Database:** **SQLAlchemy** ORM with a **SQLite** database for local development, designed for easy transition to more robust production databases like PostgreSQL.
*   **Containerization:** **Docker Compose** orchestrates the local development environment, ensuring consistency and ease of setup.
*   **API Communication:** Secure RESTful APIs facilitate communication between the frontend and backend, with JWT-based authentication.

## Current Platform Capabilities (MVP+) 🎯

Our platform has rapidly evolved, incorporating a rich set of features:

1.  **Robust User Management & Authentication:**
    *   Secure user registration and login (email/password) with UX enhancements (e.g., password visibility toggle).
    *   Password hashing (bcrypt) and JWT-based session management.
    *   Role-based access control (Admin/User).
    *   Modernized public homepage with clear CTAs and feature highlights.
2.  **Comprehensive Course & Content Delivery:**
    *   Modernized and user-friendly dynamic course catalog display.
    *   Enhanced detailed course pages with improved module and lesson presentation.
    *   User enrollment in courses.
    *   Backend CRUD operations for all learning entities (Courses, Modules, Lessons).
    *   Seed data mechanism for easy environment setup.
3.  **Interactive Learning & Progress Tracking:**
    *   Lesson viewing with support for various content types, including **Markdown rendering**.
    *   Ability to mark lessons as complete/incomplete with clear visual feedback.
    *   Visual distinction for completed content.
4.  **Advanced Skill Management & AI-Powered Assessment:**
    *   **Skill Definition:** Admins can define and manage a comprehensive list of AI-related skills.
    *   **User Skill Proficiency:** The system tracks each user's proficiency in every skill.
    *   **Content-Skill Mapping:** Admins can associate skills with courses, modules, and individual quiz questions, creating a rich knowledge graph.
    *   **Quiz Engine:**
        *   Lessons can be designated as quizzes.
        *   Quiz content (questions, options, correct answers, associated skills) is managed via flexible JSON structures.
        *   Students can take quizzes and receive immediate, detailed feedback, including overall scores and performance per skill.
        *   Quiz submissions automatically update user skill proficiency scores in the backend.
5.  **Personalized Learning Path - Foundation:**
    *   **AI-Driven Recommendations:** The system analyzes user skill proficiencies.
    *   **Study Plan Generation:** For skills where proficiency is below a target threshold, the platform recommends relevant courses or modules.
    *   **Modernized Student Homepage (Study Plan):** A personalized dashboard for users to view their progress, enrolled courses (placeholder stats), and study recommendations.
6.  **Admin Capabilities:**
    *   **Modernized Admin Dashboard:** A revamped central hub for administrators with a professional dark theme, clear navigation, (placeholder) key statistics, and quick access to management sections.
    *   Consistent dark theme and improved UX across all core admin sections (Courses, Users, Skills, Enrollments management pages).
    *   Full CRUD interfaces (UI and API) for managing Skills.
    *   UI sections for associating skills with Courses and Modules.
    *   (Basic admin for other entities is evolving).
7.  **Enhanced User Experience (UX) & User Interface (UI):**
    *   Consistent dark theme applied across authentication, admin, and core student-facing pages.
    *   Improved navigation, visual feedback, and modern styling for a more cohesive and professional platform feel.
    *   Tailwind CSS with `@tailwindcss/typography` for styled Markdown content.
8.  **Code Quality & Maintainability:**
    *   Consistent linting and formatting.
    *   Resolution of ESLint/TypeScript issues for a cleaner codebase.

## Vision for the Future: The Next Evolution 🌟

CognitiveLabsSchool is on a trajectory to become the leading platform for professional AI education. Our roadmap includes:

*   **Enhanced AI-Personalization:**
    *   More sophisticated recommendation algorithms (beyond simple low-score triggers).
    *   Adaptive learning pathways that adjust in real-time based on performance.
    *   AI-powered tutors/mentors providing contextual help and feedback.
*   **Rich Interactive Content:**
    *   Full Markdown support, interactive coding environments, and embedded multimedia.
    *   Gamification elements (points, badges, leaderboards) to boost engagement.
*   **Collaborative & Social Learning:**
    *   Discussion forums, peer reviews, and group projects.
*   **Comprehensive Dashboards & Analytics:**
    *   For learners: Detailed progress visualization and skill mastery tracking.
    *   For instructors/admins: Content management, user analytics, and course effectiveness insights.
*   **B2B Enterprise Features:**
    *   Team management, bulk enrollment, custom reporting for corporate clients.
*   **Scalability & Robustness:**
    *   Transition to production-grade infrastructure (e.g., PostgreSQL, Kubernetes/Serverless).

## Getting Started & Development Setup 🛠️

We welcome collaborators and contributors! Here’s how to get the platform running locally:

1.  **Prerequisites:** Ensure Docker and Docker Compose are installed.
2.  **Clone Repository:** `git clone <repository-url>`
3.  **Navigate to Project:** `cd cognitivelabschool`
4.  **Launch Services:** `docker-compose up --build -d`
    *   This command builds and starts the frontend and backend services.
    *   The backend initializes a local SQLite database (`backend/sql_app.db`).
5.  **Seed Database (Recommended):**
    *   For a functional demo with sample data, run:
        ```bash
        curl -X POST http://localhost:8000/seed_data/
        ```
    *   Expected response: `{"message":"Sample data seeded successfully with courses, modules, and lessons!"}`
6.  **Access Points:**
    *   **Frontend Application:** `http://localhost:3000`
    *   **Backend API Base:** `http://localhost:8000`
    *   **API Docs (Swagger):** `http://localhost:8000/docs`
    *   **API Docs (ReDoc):** `http://localhost:8000/redoc`
    *   **Default Admin Credentials (after seeding):** `admin@example.com` / `adminpassword`

## Stopping the Application

*   **Stop Services:** `docker-compose down`
*   **Stop & Clear Database (for a fresh start):** `docker-compose down && rm -f backend/sql_app.db` (Use with caution)

## Investment & Collaboration Opportunities 🤝

CognitiveLabsSchool is a rapidly developing project with significant potential. We are open to discussions with:

*   **Investors:** Interested in funding the next stage of growth and feature development.
*   **Technical Collaborators:** Passionate developers, AI experts, and UX designers looking to contribute to a cutting-edge educational platform.
*   **Content Partners:** Educators and industry professionals interested in creating specialized AI courses.

If our vision resonates with you, please reach out!

## Contributing

[Detailed contribution guidelines will be established as the project matures. For now, feel free to open issues or suggest features.]

## License

[License information to be determined.]

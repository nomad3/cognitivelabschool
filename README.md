# CognitiveLabsSchool - AI-Powered Education Platform

## Project Description

CognitiveLabsSchool is an AI-powered education platform designed to empower professionals with the skills to effectively integrate AI into their workflows. Our B2B solution provides tailored courses for individuals with diverse backgrounds, from beginners to experts, enabling them to enhance productivity, improve efficiency, and remain competitive in the evolving job market.

The platform aims to make education fun, accessible, and personalized, drawing inspiration from methods like Kumon and Montessori to focus on and maximize student skillsets.

## Tech Stack

*   **Frontend:** Next.js (React framework) with TypeScript
*   **Backend:** Python with FastAPI (API framework)
*   **Database:** SQLAlchemy with SQLite (for local development)
*   **Containerization:** Docker Compose (local development)
*   **Linting/Formatting:** ESLint, Prettier (implied by Next.js setup)

## MVP Status & Features

The Minimum Viable Product (MVP) focuses on core functionalities. Below is the status of these features:

### Implemented:
1.  **User Authentication:**
    *   User registration (email, password, full name).
    *   User login.
    *   Secure password hashing (bcrypt).
    *   JWT-based session management and token refresh.
2.  **Course Catalog & Display:**
    *   Display a list of available courses (fetching from backend).
    *   Dynamic course detail page showing title, description, modules, and lessons.
3.  **Course Enrollment:**
    *   Authenticated users can enroll in courses.
    *   Enrollment status is reflected on the course detail page.
4.  **Module & Lesson Management (Backend):**
    *   Database models for Courses, Modules, Lessons, Users, Enrollments.
    *   Pydantic schemas for data validation and serialization.
    *   CRUD operations for all entities.
    *   RESTful API endpoints for managing these entities.
    *   Seed data mechanism to populate initial courses, modules, and lessons.
5.  **Lesson Viewing (Frontend):**
    *   Lessons are listed under their respective modules on the course detail page.
    *   Dynamic routing to individual lesson view pages.
    *   Basic rendering of lesson content (currently 'text' type).
6.  **Basic Progress Tracking:**
    *   Backend: `Enrollment` model tracks `completed_lessons` (list of lesson IDs).
    *   Backend: API endpoints to mark a lesson as complete or incomplete for an enrolled user.
    *   Frontend: Course detail page shows "Done"/"Undo" buttons for lessons if enrolled.
    *   Frontend: Completed lessons are visually distinguished (e.g., strikethrough text).
7.  **Skill Management & Assessment:**
    *   Backend models for `Skill` (defining skills) and `UserSkill` (tracking user proficiency in skills).
    *   Full admin CRUD interfaces (UI and API) for managing `Skill` entities.
    *   Admins can associate `Skill` entities with `Course` and `Module` entities via dedicated API endpoints and UI sections.
    *   Admins can designate lessons as 'quiz' type. Quiz content (questions, answers, associated skill IDs) is stored as JSON in `Lesson.content`.
    *   Student-facing UI for taking quizzes.
    *   Backend API endpoint (`/lessons/{lesson_id}/submit_quiz`) for quiz submission. This endpoint evaluates answers, calculates overall and skill-based scores, and updates the `UserSkill` proficiency for the relevant skills.
    *   Students can view immediate quiz results, including skill-based scores.
8.  **Personalized Study Plan (Foundation):**
    *   Backend logic identifies skills where the user has low proficiency.
    *   Recommends courses or modules associated with these low-proficiency skills (based on `Course.associated_skills` and `Module.associated_skills`).
    *   New API endpoint `GET /users/me/study-plan` provides these recommendations.
    *   New user-facing page (`/study-plan`) displays the personalized study plan to the logged-in user. If no recommendations are applicable (e.g., for a new user or a user proficient in all assessed skills), a relevant message is shown.
9.  **Code Quality:**
    *   Addressed various ESLint and TypeScript errors in frontend components.

### Partially Implemented / To Be Implemented for MVP:
1.  **Enhanced Lesson Content Display (Frontend):**
    *   Full rendering for different `content_type` (Markdown, video embeds).
2.  **Visual Course Progress Display:**
    *   Display overall course progress (e.g., percentage) for enrolled users on course list and detail pages.
3.  **User Profile Page (Optional for MVP):**
    *   Display user information and enrolled courses.
4.  **Basic Admin Functionality (Optional for MVP):**
    *   Currently, data is managed via seed script. A simple admin interface or protected API endpoints for content management could be added.

## Future Roadmap (Post-MVP)

*   **Advanced Content Types & Interactivity:**
    *   Full Markdown rendering with syntax highlighting.
    *   Interactive quizzes and coding exercises within lessons.
    *   Support for uploading and managing various content formats.
*   **Comprehensive Progress Tracking & Analytics:**
    *   Detailed progress visualization (module-level, overall course).
    *   Time spent on lessons/modules.
    *   Quiz scores and performance analytics.
*   **Gamification:**
    *   Points system for completing lessons, modules, and courses.
    *   Badges and achievements.
    *   Leaderboards (optional, context-dependent).
*   **AI-Powered Learning Assistants (Agents):**
    *   Personalized feedback on exercises.
    *   Intelligent Q&A based on course content.
    *   Recommendations for supplementary materials or next steps.
*   **Social Learning Features:**
    *   Discussion forums per course or lesson.
    *   Peer review capabilities for assignments.
    *   Group projects and collaborative workspaces.
*   **Personalized Learning Paths:**
    *   Adaptive learning pathways based on pre-assessment, student progress, and stated goals.
    *   Recommendations for courses or modules based on user profile and learning history.
*   **Instructor & Admin Dashboard:**
    *   Comprehensive interface for creating and managing courses, modules, and lessons.
    *   Tools for managing users and enrollments.
    *   Analytics on student engagement and course effectiveness.
*   **B2B Features for Corporate Training:**
    *   Organization/Team management.
    *   Bulk user enrollment and license management.
    *   Customized reporting and analytics for company administrators.
*   **Notifications System:**
    *   Alerts for new course content, discussion replies, assignment deadlines, etc.
*   **Enhanced UI/UX:**
    *   Continuous improvements based on user feedback.
    *   Full mobile responsiveness.
    *   Adherence to accessibility standards (WCAG).
*   **Deployment & Scalability:**
    *   Production-ready deployment strategy (e.g., Kubernetes, serverless).
    *   Database choice for production (e.g., PostgreSQL).
    *   Caching strategies and performance optimization.

## Setup Instructions

1.  Ensure Docker and Docker Compose are installed on your system.
2.  Clone this repository: `git clone <repository-url>`
3.  Navigate to the project directory: `cd cognitivelabschool`
4.  Build and start the services: `docker-compose up --build -d`
    *   This will build both the `frontend` and `backend` Docker images and run them.
    *   The backend service initializes the SQLite database (`sql_app.db` in the `backend` directory).
5.  **Seed Initial Data (Optional but Recommended for Testing):**
    *   Once the services are running, execute the following command in your terminal to populate the database with sample courses, modules, and lessons:
        ```bash
        curl -X POST http://localhost:8000/seed_data/
        ```
    *   You should receive a message: `{"message":"Sample data seeded successfully with courses, modules, and lessons!"}`.
    *   If you run this command again, it will raise an error to prevent duplicate data, unless you delete `backend/sql_app.db` and restart the containers.
6.  **Access the Application:**
    *   Frontend (Next.js app): `http://localhost:3000`
    *   Backend API (FastAPI): `http://localhost:8000`
    *   API Documentation (Swagger UI): `http://localhost:8000/docs`
    *   Alternative API Documentation (ReDoc): `http://localhost:8000/redoc`

## Stopping the Application

*   To stop the running services: `docker-compose down`
*   To stop and remove the database (for a fresh start): `docker-compose down && rm -f backend/sql_app.db`

## Contributing

[Contribution guidelines will be added later]

## License

[License information will be added later]

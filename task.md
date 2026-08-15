## Engineering Checklist: Task Assignment Application

### 1. Project setup
- [ ] Initialize repository structure with separate frontend and backend folders.
- [ ] Add TypeScript configuration for frontend and backend.
- [ ] Add package manifests for both apps and shared scripts.
- [ ] Add environment variable template (.env.example) for DB, backend port, and LLM API key.
- [ ] Add linting/formatting baseline (e.g. ESLint + Prettier).
- [ ] Confirm local dev scripts work for install, run, build, and test.

### 2. Database design
- [ ] Create PostgreSQL schema for Developers.
- [ ] Create PostgreSQL schema for Skills.
- [ ] Create PostgreSQL schema for Tasks.
- [ ] Add many-to-many relation between Developers and Skills.
- [ ] Add many-to-many relation between Tasks and Skills.
- [ ] Add task assignment field for developer_id on tasks.
- [ ] Add parent_task_id to support recursive subtasks.
- [ ] Add status field with supported values such as To-do, In Progress, Done.
- [ ] Add indexes on developer_id, parent_task_id, and task status.
- [ ] Add database constraints for valid values and required fields.
- [ ] Seed developer + skill data:
  - [ ] Alice -> Frontend
  - [ ] Bob -> Backend
  - [ ] Carol -> Frontend, Backend
  - [ ] Dave -> Backend
- [ ] Validate sample queries return expected mappings.

### 3. Backend architecture
- [ ] Set up Node.js/TypeScript server with framework choice (Express/NestJS).
- [ ] Add database client integration (Prisma or TypeORM).
- [ ] Add application configuration module.
- [ ] Add structured logging and error handling middleware.
- [ ] Add route/version setup for API.
- [ ] Add health check endpoint.

### 4. Backend API: Tasks
- [ ] Create task endpoint: POST /tasks
- [ ] Read task endpoint: GET /tasks/:id
- [ ] Read all tasks endpoint: GET /tasks
- [ ] Update task endpoint: PATCH /tasks/:id
- [ ] Allow creating a task with title, status, skills, and optional developer assignment.
- [ ] Allow task creation with nested subtasks.
- [ ] Validate required title and skill payloads.
- [ ] Prevent assignment to a developer without all required skills.
- [ ] Prevent task status change to Done when any direct or nested subtask is not Done.
- [ ] Return related skills, assignment, and subtask hierarchy in read responses.
- [ ] Add validation for invalid status transitions.

### 5. Backend API: Developers
- [ ] Create developer read endpoint: GET /developers/:id
- [ ] Create list endpoint: GET /developers
- [ ] Include assigned tasks in developer response.
- [ ] Include developer skills in response payload.
- [ ] Validate that developer data is returned in a clean nested format.

### 6. Backend API: Skills
- [ ] Create skill read endpoint: GET /skills/:id
- [ ] Create list endpoint: GET /skills
- [ ] Include related developers and tasks where relevant.
- [ ] Return canonical skill names such as Frontend and Backend.

### 7. Business logic enforcement
- [ ] Implement task-to-developer skill compatibility check.
- [ ] Implement recursive subtask completion check before marking parent task Done.
- [ ] Ensure nested subtasks are considered for Done validation.
- [ ] Reject invalid assignment attempts with explicit API errors.
- [ ] Reject invalid status transitions with explicit API errors.
- [ ] Add unit tests for business rules.

### 8. LLM integration
- [ ] Set up provider client for Gemini or equivalent.
- [ ] Add API key configuration via environment variables.
- [ ] Create LLM prompt for inferring required skills from a task title.
- [ ] Normalize LLM output to canonical skill names.
- [ ] Add a backend helper to infer skills only when task skill list is missing.
- [ ] Trigger LLM automatically for new tasks and subtasks without explicit skills.
- [ ] Handle failure gracefully with retries or safe fallback logic.
- [ ] Add tests for valid and invalid LLM responses.

### 9. Frontend app: task list page
- [ ] Create page to list all tasks.
- [ ] Display title, status, required skills, assigned developer, and subtask count.
- [ ] Add dropdown or action to assign a task to a compatible developer.
- [ ] Add status selector or buttons for task updates.
- [ ] Show validation message when assignment or status is invalid.
- [ ] Render nested subtasks visually under parent task.
- [ ] Refresh task list after successful updates.

### 10. Frontend app: task creation page
- [ ] Create form for task title.
- [ ] Add skill selection input for required skills.
- [ ] Add ability to create nested subtasks dynamically.
- [ ] Add UI for recursive subtask input components.
- [ ] Allow user to omit skills; backend resolves them via LLM.
- [ ] Submit task to backend and handle success/error states.
- [ ] Validate required task title before submit.
- [ ] Show spinner or loading state while creating.

### 11. Frontend architecture
- [ ] Add React app initialization and routing.
- [ ] Create reusable form components for task input.
- [ ] Create reusable nested task builder component.
- [ ] Add API client layer for frontend requests.
- [ ] Centralize error handling and loading states.
- [ ] Add responsive styling for desktop and mobile views.

### 12. Dockerization
- [ ] Create Dockerfile for backend.
- [ ] Create Dockerfile for frontend.
- [ ] Create docker-compose.yml for app stack.
- [ ] Include PostgreSQL service in Compose.
- [ ] Include network configuration between services.
- [ ] Add volume persistence for PostgreSQL data.
- [ ] Add health checks for backend and database.
- [ ] Add startup order dependency where needed.
- [ ] Confirm app boots through docker-compose up.

### 13. Testing and verification
- [ ] Run DB migrations successfully.
- [ ] Seed database successfully.
- [ ] Write tests for task creation with valid skills.
- [ ] Write tests for invalid assignment logic.
- [ ] Write tests for task Done prohibition when subtasks are incomplete.
- [ ] Write tests for LLM skill inference fallback.
- [ ] Test GET endpoints for tasks, developers, and skills.
- [ ] Test frontend task creation and list workflows manually or via e2e tests.
- [ ] Verify no failing lint/build steps.

### 14. Documentation and delivery
- [ ] Write README with project overview and architecture.
- [ ] Document setup instructions for local development.
- [ ] Document Docker Compose usage.
- [ ] Document DB setup and migration commands.
- [ ] Document LLM provider configuration and API key setup.
- [ ] Document API endpoints and payload examples.
- [ ] Include rationale for key libraries and dependencies.
- [ ] Add public repo link and ensure source code is pushed.

### 15. Final acceptance checklist
- [ ] Task list page works and shows all tasks.
- [ ] Assignment respects developer skill requirements.
- [ ] Task status changes work and block invalid transitions.
- [ ] Recursive subtasks are supported in schema and UI.
- [ ] Tasks/subtasks without skills are auto-classified by LLM.
- [ ] Full application runs via docker-compose.
- [ ] README is complete and understandable.
- [ ] Code is committed to a public repository.

### Suggested file structure
- /backend
  - src/
  - prisma/
  - .env.example
- /frontend
  - src/
  - public/
  - .env.example
- /docker-compose.yml
- /README.md

### Verification commands to run later
- npm install
- npm run prisma:migrate
- npm run prisma:seed
- npm run test
- npm run build
- docker-compose up --build

### Decision summary
- Preferred stack: React + TypeScript + Vite frontend, Node.js + TypeScript backend, PostgreSQL database, Prisma ORM, Gemini LLM, Docker Compose for deployment.
- Business rules will be enforced in the backend service layer and validated by tests.
- Recursive subtasks and skill detection are the highest-risk areas and should be implemented and tested first.

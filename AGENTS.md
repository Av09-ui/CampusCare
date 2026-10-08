# CampusCare AI Agent Instructions

## 1. Project Context

CampusCare is an AI-powered college complaint and support platform developed as an Agile Software Development and DevOps mini-project.

The project demonstrates:

- Agile development
- Git
- Continuous Integration
- Docker
- Docker Compose
- Kubernetes
- Ansible
- Terraform
- AWS Lambda
- Monitoring
- Basic AI/ML integration

The project is intentionally scoped to remain manageable and fully functional.

---

## 2. Primary Development Principle

> Smaller complete system > larger incomplete system.

Do not add unnecessary functionality.

Every implemented feature should have a complete flow:

User Action
→ Frontend
→ Backend
→ Validation
→ Database / AI / Service
→ Response
→ Frontend
→ Test

Do not implement partial features that cannot be used or tested.

---

## 3. Source of Truth

Before modifying code, inspect the relevant documentation.

Important documents:

- docs/PROJECT_SCOPE.md
- docs/USER_ROLES.md
- docs/FEATURES.md
- docs/USER_WORKFLOWS.md
- docs/REQUIREMENTS.md
- docs/architecture.md
- docs/database.md
- docs/api.md
- docs/ai.md
- docs/security.md
- docs/devops.md
- plan.md

Do not invent requirements that are not documented.

If implementation requires a decision that is marked as pending:

1. Identify the decision.
2. Do not silently introduce a complex solution.
3. Prefer the simplest reasonable implementation.
4. Keep the implementation consistent with the project.
5. Inform the developer about the decision.

---

## 4. Architecture Rules

The planned architecture is:

Frontend
    ↓
Backend API
    ├── PostgreSQL
    └── AI Service

The backend is the main application service.

The AI Service is separate from the backend.

The AI Service must not directly modify the main PostgreSQL database.

The backend is responsible for:

- Authentication
- Authorization
- Business logic
- Database operations
- Complaint management
- Support management
- Administrative operations
- Evidence handling
- AI Service communication

The AI Service is responsible for:

- Complaint categorization
- Priority assessment
- Similarity detection
- AI confidence
- Priority re-evaluation

---

## 5. Do Not Overengineer

Prefer simple, maintainable solutions.

Avoid introducing:

- Unnecessary microservices
- Complex event buses
- Message brokers without a clear requirement
- Large external AI APIs without approval
- Unnecessary cloud services
- Complex authentication systems
- Unnecessary database abstractions
- Premature optimization

The project is a student-level end-to-end DevOps system.

Reliability and understandability are more important than architectural novelty.

---

## 6. Backend Rules

Backend code must:

- Validate input
- Authenticate protected requests
- Authorize operations by role
- Validate ownership where required
- Handle errors safely
- Avoid exposing sensitive information
- Use safe database access
- Keep business logic organized
- Return predictable API responses

Never trust values supplied by the frontend for:

- User role
- User ID
- Complaint owner
- Administrative privileges
- AI category
- AI priority

The backend must determine or validate these values.

---

## 7. Authentication Rules

Passwords must never be stored as plain text.

Never log:

- Passwords
- Authentication secrets
- API keys
- Database passwords
- Tokens

Authentication and authorization must be enforced by the backend.

Frontend route protection is not a replacement for backend authorization.

---

## 8. Database Rules

PostgreSQL is the planned database.

Database changes must preserve:

- Foreign-key integrity
- Complaint ownership
- Unique student support per complaint
- User email uniqueness
- Valid relationships

Do not modify the schema casually.

If a schema change is required:

1. Explain why it is required.
2. Update docs/database.md.
3. Create or update the migration.
4. Update affected backend code.
5. Update tests.

Never make database changes that cannot be reproduced.

---

## 9. Complaint Rules

Every complaint must have:

- A unique identifier
- An owning student
- Complaint description
- Status
- Category
- Priority
- Creation information

Complaint ownership must always be enforced.

A student must not gain access to another student's private operations simply by changing a complaint ID.

---

## 10. Support Rules

A student may support a particular complaint only once.

The database must enforce uniqueness of:

complaint_id + student_id

Do not rely only on frontend checks to prevent duplicate support.

Support count must be derived from valid support records.

---

## 11. AI Rules

The AI Service is a supporting component, not the authority over the application.

The AI Service may provide:

- Category
- Priority
- Similarity
- Confidence

The backend must validate AI responses.

Never blindly trust AI output.

AI similarity must never automatically merge complaints.

The first implementation should favor lightweight and explainable approaches.

Possible tools include:

- Python
- scikit-learn
- TF-IDF
- Cosine similarity

Do not introduce an external LLM unless explicitly approved.

---

## 12. AI Failure Rule

AI failure must not cause loss of a student complaint.

If the AI Service is unavailable:

Complaint
→ Backend stores complaint
→ AI analysis marked pending/unavailable

The exact retry mechanism should remain simple.

Do not make the AI Service a single point of failure for complaint submission.

---

## 13. Frontend Rules

The frontend should:

- Provide clear user workflows
- Validate input for usability
- Display backend errors clearly
- Respect user roles
- Avoid duplicating business logic unnecessarily
- Avoid storing sensitive information unnecessarily

Frontend validation does not replace backend validation.

---

## 14. API Rules

Use the API conventions defined in:

docs/api.md

Maintain consistent:

- HTTP methods
- Status codes
- Request formats
- Response formats
- Error structures

Do not create duplicate endpoints for the same operation without a clear reason.

Before creating a new endpoint, check whether an existing endpoint can support the requirement.

---

## 15. Error Handling

Errors should be predictable and safe.

Use structured responses where appropriate:

{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}

Do not expose:

- Stack traces
- SQL errors
- Internal paths
- Secrets
- Credentials
- Debug information

during normal application operation.

---

## 16. Evidence and File Handling

Uploaded files must be validated.

Check:

- File type
- File size
- Upload permissions
- Associated complaint

Do not trust filenames or file extensions alone.

Do not allow users to access arbitrary files by guessing paths.

Follow the final storage mechanism defined in the architecture.

---

## 17. Testing Rules

Every meaningful feature should have tests.

At minimum, test:

- Happy path
- Invalid input
- Unauthorized access
- Role restrictions
- Important edge cases

When fixing a bug:

1. Reproduce the bug.
2. Add a regression test where practical.
3. Fix the implementation.
4. Run the affected tests.
5. Run the broader test suite.

Never remove a test simply because it exposes a bug.

---

## 18. CI Rules

Code should be considered complete only when relevant automated checks pass.

CI should eventually validate:

- Backend tests
- AI tests
- Frontend checks
- Security/dependency checks
- Build validation

Do not bypass failing tests just to obtain a green pipeline.

---

## 19. Docker Rules

Each independently deployable application service should have an appropriate container configuration.

Dockerfiles should:

- Be reproducible
- Avoid unnecessary packages
- Use appropriate base images
- Keep secrets outside the image
- Expose only required ports

Never put credentials directly in Dockerfiles.

---

## 20. Docker Compose Rules

Docker Compose should represent the actual local application architecture.

Expected services:

- frontend
- backend
- ai-service
- postgres

Do not add infrastructure services unless they have a real project purpose.

Use environment configuration rather than hard-coded secrets.

---

## 21. Kubernetes Rules

Kubernetes configuration should remain understandable.

Prefer:

- Deployments
- Services
- ConfigMaps
- Secrets
- Persistent storage where required

Avoid unnecessary Kubernetes features unless required by the project.

---

## 22. Terraform Rules

Terraform must be used only for infrastructure.

Do not put application business logic into Terraform.

Terraform changes should be:

- Reviewable
- Reproducible
- Validated

Never commit cloud credentials.

---

## 23. Ansible Rules

Ansible should handle configuration/provisioning tasks appropriate to the selected environment.

Do not use Ansible simply because it exists in the syllabus.

Every playbook should have a clear purpose.

---

## 24. AWS Rules

AWS credentials must never be committed to Git.

Do not hard-code:

- Access keys
- Secret keys
- Tokens
- Production credentials

The AWS Lambda component should remain small and independently testable.

---

## 25. Monitoring Rules

Monitoring should provide useful visibility.

Do not create dashboards containing meaningless metrics simply to increase the number of charts.

Monitor useful signals such as:

- Service availability
- Application health
- Resource usage
- Relevant service metrics

---

## 26. Code Change Rules

Before changing code:

1. Read the relevant files.
2. Understand the existing implementation.
3. Identify the smallest safe change.
4. Implement the change.
5. Run relevant tests.
6. Check for regressions.
7. Summarize what changed.

Do not rewrite working code unnecessarily.

---

## 27. Minimal Change Principle

When fixing a bug or implementing a feature:

> Make the smallest production-safe change that fully satisfies the requirement.

Avoid unrelated refactoring unless necessary.

Do not rename files, restructure folders, or replace libraries without a concrete reason.

---

## 28. Dependency Rules

Before adding a dependency, ask:

1. Is it actually required?
2. Can the existing stack solve the problem?
3. Does it introduce unnecessary complexity?
4. Is it compatible with the current project?
5. Does it create additional deployment requirements?

Do not add dependencies merely because they are popular.

---

## 29. Documentation Synchronization

If implementation changes an architectural decision, update the relevant documentation.

Examples:

Database change
→ docs/database.md

API change
→ docs/api.md

AI behavior change
→ docs/ai.md

Security change
→ docs/security.md

DevOps change
→ docs/devops.md

Documentation must describe the actual implementation.

---

## 30. Git Rules

Use meaningful commits.

Preferred examples:

feat: add complaint creation
fix: prevent duplicate complaint support
test: add authorization tests
docs: update API specification
ci: add backend test workflow

Avoid commits such as:

stuff
changes
final
final2
working
test
asdf

Do not commit:

- .env
- Secrets
- Credentials
- Generated caches
- Unnecessary build artifacts
- Local IDE files

---

## 31. Agent Workflow

When given a development task, follow:

Understand task
    ↓
Inspect relevant files
    ↓
Check documentation
    ↓
Identify dependencies
    ↓
Plan smallest safe change
    ↓
Implement
    ↓
Run tests
    ↓
Fix failures
    ↓
Review change
    ↓
Report result

Do not begin by rewriting the project.

---

## 32. Handling Ambiguity

If a requirement is unclear:

1. Check project documentation first.
2. Check existing implementation.
3. Prefer the simplest interpretation consistent with the project.
4. Do not invent major functionality.
5. If ambiguity can materially change architecture or data design, ask for clarification.

---

## 33. Scope Protection

Do not automatically add:

- Notifications
- Mobile application
- Advanced analytics
- Automatic complaint merging
- Image AI
- Video AI
- Chatbot functionality
- Advanced escalation
- Enterprise authentication

These are future-scope ideas unless explicitly requested.

---

## 34. Definition of Done

A task is not complete merely because code was written.

A feature is complete when:

Code
 ↓
Integrated
 ↓
Validated
 ↓
Tested
 ↓
Working

For user-facing features, verify the complete workflow whenever practical.

---

## 35. Final Instruction

CampusCare is an ASD and DevOps academic project.

Optimize for:

1. Correctness
2. Complete functionality
3. Testability
4. Maintainability
5. Clear architecture
6. Demonstrability
7. DevOps integration

Do not optimize for unnecessary complexity.

When in doubt:

> Build the simplest complete solution that satisfies the documented requirement.
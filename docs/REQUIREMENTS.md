# CampusCare - Requirements Specification

## 1. Purpose

This document defines the functional and non-functional requirements for CampusCare.

The requirements are derived from the approved project scope and user workflows.

Each requirement has a unique identifier so that it can be traced to implementation, testing, and project tasks.

---

# 2. Functional Requirements

## 2.1 Authentication

### FR-AUTH-001 - Student Registration

The system shall allow a student to register using a valid college email address and password.

### FR-AUTH-002 - Student Authentication

The system shall allow a registered student to log in using valid credentials.

### FR-AUTH-003 - Admin Authentication

The system shall allow an authorized administrator to log in using valid administrator credentials.

### FR-AUTH-004 - Logout

The system shall allow authenticated users to log out.

### FR-AUTH-005 - Role-Based Authorization

The system shall distinguish between Student and Admin roles and restrict actions according to the user's role.

---

# 3. Complaint Requirements

### FR-CMP-001 - Complaint Creation

The system shall allow an authenticated student to submit a complaint using a natural-language description.

### FR-CMP-002 - Complaint Ownership

The system shall associate every submitted complaint with the authenticated student who created it.

### FR-CMP-003 - Complaint Evidence

The system shall allow students to optionally attach supported evidence such as images or videos to a complaint.

### FR-CMP-004 - Complaint Identification

The system shall assign a unique identifier to every newly created complaint.

### FR-CMP-005 - Complaint Viewing

The system shall allow authorized users to view complaint details.

### FR-CMP-006 - Complaint Search

The system shall allow students and administrators to search complaints using supported searchable information.

### FR-CMP-007 - Complaint Filtering

The system shall allow students and administrators to filter complaints using supported attributes such as category, priority, and status.

---

# 4. AI Requirements

### FR-AI-001 - Complaint Categorization

The system shall use the AI component to determine an appropriate category for a newly submitted complaint.

### FR-AI-002 - Priority Assessment

The system shall use the AI component to generate an initial priority assessment for a complaint.

The assessment shall consider defined factors such as criticality, necessity, urgency, and potential student impact.

### FR-AI-003 - Similar Complaint Detection

The system shall use AI-assisted similarity analysis to identify potentially related existing complaints.

### FR-AI-004 - Similar Complaint Notification

When a sufficiently similar complaint is identified, the system shall inform the student and present the relevant existing complaint.

### FR-AI-005 - No Automatic Silent Merging

The system shall not silently merge or suppress a student's complaint solely based on AI similarity analysis.

---

# 5. Existing Complaint Support

### FR-SUP-001 - Support Existing Complaint

The system shall allow an authenticated student to indicate that they experience the same problem as an existing complaint.

### FR-SUP-002 - Prevent Duplicate Support

The system shall prevent the same student from supporting the same complaint more than once.

### FR-SUP-003 - Supporting Comment

The system shall allow a student to optionally add a short comment when supporting an existing complaint.

### FR-SUP-004 - Supporting Evidence

The system shall allow a student to optionally attach supporting evidence when supporting an existing complaint.

### FR-SUP-005 - Impact Count

The system shall maintain the number of students supporting/affected by a complaint.

---

# 6. Dashboard Requirements

### FR-DASH-001 - Shared Dashboard

The system shall provide a central complaint dashboard accessible to both Students and Admins according to their permissions.

### FR-DASH-002 - Priority Visibility

The dashboard shall display complaint priority.

### FR-DASH-003 - Category Visibility

The dashboard shall display complaint category.

### FR-DASH-004 - Status Visibility

The dashboard shall display complaint status.

### FR-DASH-005 - Impact Visibility

The dashboard shall display appropriate complaint support/impact information.

### FR-DASH-006 - Role-Specific Actions

The dashboard shall provide actions according to the authenticated user's role.

---

# 7. Administration Requirements

### FR-ADM-001 - View All Complaints

The system shall allow an authorized administrator to view complaints available for administrative processing.

### FR-ADM-002 - Assign Complaint

The system shall allow an administrator to assign a complaint for processing.

### FR-ADM-003 - Update Status

The system shall allow an administrator to update a complaint's status according to the defined lifecycle.

### FR-ADM-004 - Progress Update

The system shall allow an administrator to add a progress update to a complaint.

### FR-ADM-005 - Administrative Comment

The system shall allow an administrator to add an appropriate comment/update to a complaint.

### FR-ADM-006 - Resolution Evidence

The system shall allow an administrator to upload supported evidence or documents related to complaint resolution.

### FR-ADM-007 - Resolve Complaint

The system shall allow an administrator to mark a complaint as resolved after providing the required resolution information.

---

# 8. Transparency Requirements

### FR-TRANS-001 - Progress Visibility

The system shall allow authorized users to view relevant complaint progress updates.

### FR-TRANS-002 - Resolution Visibility

The system shall allow authorized users to view relevant resolution information.

### FR-TRANS-003 - Complaint History

The system shall maintain the information necessary to provide the defined complaint history and transparency.

---

# 9. Data Management Requirements

### FR-DATA-001 - Student Identity

The system shall maintain the relationship between a complaint and its submitting student.

### FR-DATA-002 - Support Association

The system shall maintain the relationship between a supporting student and the complaint they support.

### FR-DATA-003 - Data Minimization

The system shall avoid retaining unnecessary detailed complaint data indefinitely after resolution.

### FR-DATA-004 - Historical Resolution Record

The system shall retain the minimum information required for the approved historical resolution record.

The exact retention and deletion policy shall be defined separately.

---

# 10. Non-Functional Requirements

## NFR-001 - Usability

The complaint submission process should be simple and require minimal structured input from students.

## NFR-002 - Security

The system shall protect authenticated functionality through authentication and role-based authorization.

## NFR-003 - Password Security

Passwords shall not be stored in plaintext.

## NFR-004 - Data Integrity

The system shall maintain consistent relationships between users, complaints, support records, comments, and resolution information.

## NFR-005 - Reliability

A failure in one component should be handled gracefully without corrupting complaint data.

## NFR-006 - Testability

Core functionality shall be testable through automated tests where practical.

## NFR-007 - Maintainability

The implementation should use clear separation of responsibilities between frontend, backend, AI processing, and supporting infrastructure.

## NFR-008 - Performance

Normal complaint viewing, submission, and dashboard operations should provide reasonable response times under the expected academic-project workload.

## NFR-009 - Transparency

The system should provide users with clear visibility into complaint status and progress according to their permissions.

## NFR-010 - Extensibility

The architecture should allow future improvements to AI processing and DevOps infrastructure without requiring a complete rewrite of the application.

---

# 11. Requirement Completion Rule

A requirement is considered implemented only when:

1. The required behavior is implemented.
2. Appropriate authorization is enforced.
3. Relevant validation and error handling exists.
4. Required components are integrated.
5. Appropriate tests are implemented.
6. The intended user workflow works successfully.

---

# 12. Traceability

Requirements will later be mapped to:

- Features
- User workflows
- Architecture components
- Implementation tasks
- Tests
- DevOps pipeline stages

This traceability will help ensure that implemented functionality remains aligned with the approved project scope.
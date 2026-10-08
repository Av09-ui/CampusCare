# CampusCare - Project Scope

## 1. Project Overview

CampusCare is an AI-powered college complaint and support platform designed to provide a transparent and intelligent way for students to report, track, support, and monitor campus-related issues.

The platform allows students to describe problems naturally instead of filling lengthy complaint forms. AI analyzes each complaint to determine its category, priority, severity, and potential impact, and identifies potentially similar existing complaints.

Students and administrators use the same central complaint dashboard. The information visible to both roles is based on the same underlying complaint data, while the actions available to each role depend on their permissions.

The system is designed around three principles:

1. Simple complaint submission for students.
2. AI-assisted organization and prioritization of complaints.
3. Transparency throughout the complaint resolution lifecycle.

---

## 2. Primary Users

CampusCare has two primary user roles:

- Student
- Admin

Both roles can access the central complaint dashboard, but their available actions differ according to their role.

---

## 3. Student Scope

### 3.1 Authentication

Students can:

- Register using their college email address.
- Login using college email and password.
- Logout.
- Have their identity associated with complaints they submit.

### 3.2 Complaint Submission

Students can raise complaints by:

- Writing a natural-language description of the problem.
- Optionally attaching supporting evidence such as images or videos.

Students should not be required to fill a lengthy structured complaint form.

The system should derive relevant complaint information from the student's description using AI.

### 3.3 Complaint Tracking

Students can:

- View complaints they have submitted.
- View the current status of their complaints.
- View AI-generated category and priority.
- View administrator progress updates.
- View resolution information.
- View permitted supporting evidence.

### 3.4 Supporting Existing Complaints

Students can support an existing complaint when they experience the same problem.

The student can:

- Indicate that they have the same problem.
- Optionally add a short comment describing their experience.
- Optionally provide supporting evidence.

A student's support should increase the measured impact of the complaint.

Supporting an existing complaint is not treated as creating another complaint.

### 3.5 Similar Complaint Detection

When a student submits a complaint, AI should compare it with existing complaints.

If a sufficiently similar complaint is found, the system should present the student with the existing complaint and allow them to support it instead of automatically creating a duplicate.

The system must not silently merge or suppress a student's complaint based only on AI output.

---

## 4. Admin Scope

### 4.1 Authentication

Admins can:

- Login through the admin interface.
- Logout.

### 4.2 Complaint Management

Admins can:

- View all complaints.
- Search complaints.
- Filter complaints.
- View AI-generated categories.
- View AI-generated priority.
- View complaint impact/support information.
- Assign complaints.
- Change complaint status.
- Add progress updates.
- Add comments.
- Upload documents or evidence supporting an update or resolution.
- Resolve complaints.

### 4.3 Transparency

Administrators should be able to provide visible progress updates for complaints.

Students should be able to see the relevant progress and resolution information without requiring separate communication channels.

Administrators should not be able to simply mark an issue as resolved without the system supporting an explanation or resolution record.

---

## 5. Shared Complaint Dashboard

Students and administrators use the same central complaint dashboard.

The dashboard should surface complaints according to their calculated importance and priority.

The information presented may include:

- Complaint
- Category
- Priority
- Status
- Student impact/support count
- Progress
- Resolution information

Role-specific actions are controlled through authorization.

### Student actions may include:

- View
- Support
- Comment
- Add evidence
- Track

### Admin actions may include:

- Assign
- Update
- Comment
- Upload resolution evidence
- Change status
- Resolve

---

## 6. AI Responsibilities

AI is a core component of CampusCare.

The AI system is responsible for assisting with:

- Complaint categorization.
- Complaint priority assessment.
- Complaint severity/importance assessment.
- Potential student-impact assessment.
- Similar complaint detection.

AI-generated results should assist the system and administrators rather than silently performing irreversible actions.

---

## 7. Complaint Priority and Impact

Complaint importance should not depend only on the priority assigned to the original complaint.

The system should consider multiple signals, including:

- Criticality of the issue.
- Necessity of the affected service.
- Urgency.
- Potential impact on students.
- Number of students reporting/supporting the issue.
- Additional context and evidence where appropriate.

The exact priority calculation and weighting formula will be defined separately in the AI specification.

---

## 8. Complaint Transparency

CampusCare should maintain transparency throughout the complaint lifecycle.

Relevant information should include:

- Original complaint.
- AI classification.
- Priority.
- Student support/impact.
- Administrator updates.
- Resolution information.
- Appropriate resolution evidence.

The exact visibility rules for individual student information will be defined separately.

---

## 9. Post-Resolution Data Handling

Detailed complaint data should not be retained indefinitely after a complaint has been resolved.

The system should distinguish between:

### Active Complaint Data

Examples:

- Detailed student contributions.
- Temporary AI processing data.
- Duplicate detection artifacts.
- Temporary supporting data.

### Historical Resolution Record

A minimal record may be retained for:

- Transparency.
- Accountability.
- Historical reference.
- Future recognition of recurring issues.

The exact retention period and deletion policy will be defined separately as part of the security and data-management specification.

---

## 10. Core Complaint Lifecycle

The high-level lifecycle is:

Student submits complaint
        ↓
AI analysis
        ↓
Category + Priority + Impact assessment
        ↓
Similar complaint detection
        ↓
Existing complaint?
   ┌────┴────┐
  Yes       No
   ↓         ↓
Support     Create
existing    complaint
   │         │
   └────┬────┘
        ↓
Student/Admin dashboard
        ↓
Admin processing
        ↓
Progress updates
        ↓
Resolution
        ↓
Historical resolution record
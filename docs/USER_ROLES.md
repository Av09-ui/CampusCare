# CampusCare - User Roles & Permissions

## 1. Overview

CampusCare has two primary user roles:

- Student
- Admin

Both roles access the same central complaint dashboard and see the same complaint information subject to privacy and visibility rules.

The difference between the roles is primarily the actions they are authorized to perform.

---

# 2. Student

## 2.1 Authentication

A Student can:

- Register using a college email address.
- Login using college email and password.
- Logout.

## 2.2 Dashboard

A Student can:

- View the central complaint dashboard.
- Search complaints.
- Filter complaints.
- Sort/view complaints according to priority and status.
- View complaint details.
- View complaint category.
- View complaint priority.
- View complaint status.
- View student support/impact count.
- View permitted progress updates.
- View resolution information.

## 2.3 Complaint Creation

A Student can:

- Create a new complaint.
- Describe the issue using natural language.
- Attach supporting evidence such as images or videos.
- Submit the complaint.

The Student should not be required to manually provide extensive structured information when submitting a complaint.

## 2.4 Supporting Existing Complaints

A Student can:

- Support an existing complaint by indicating that they experience the same issue.
- Add an optional comment describing their experience.
- Add optional supporting evidence.

Supporting an existing complaint does not create a separate complaint.

## 2.5 Complaint Tracking

A Student can:

- View complaints they have submitted.
- Track complaint status.
- View administrator progress updates.
- View resolution information.
- View permitted resolution evidence.

## 2.6 Student Restrictions

A Student cannot:

- Assign complaints.
- Change complaint status on behalf of an administrator.
- Modify AI-generated classification directly.
- Mark a complaint as resolved.
- Upload administrator resolution documentation.
- Modify another student's complaint.

---

# 3. Admin

## 3.1 Authentication

An Admin can:

- Login through the admin interface.
- Logout.

Admin account creation/provisioning is not yet defined and will be specified separately.

## 3.2 Dashboard

An Admin can:

- View the central complaint dashboard.
- Search complaints.
- Filter complaints.
- Sort/view complaints according to priority and status.
- View all complaint details.
- View AI-generated category and priority.
- View student support/impact information.
- View complaint history and progress.
- View resolution information.

## 3.3 Complaint Management

An Admin can:

- Assign complaints.
- Update complaint status.
- Add progress updates.
- Add comments.
- Upload documents or supporting evidence.
- Add resolution information.
- Mark complaints as resolved.

## 3.4 Admin Restrictions

An Admin should not:

- Modify the identity of the student who originally submitted a complaint.
- Remove legitimate student support merely to alter complaint priority.
- Silently delete complaint history required for transparency.
- Mark a complaint as resolved without providing the required resolution information.

The exact administrative permissions and audit rules will be defined in the security and workflow specifications.

---

# 4. Shared Dashboard Principle

The Student and Admin interfaces are based on the same central complaint data.

Conceptually:

Student
    |
    | View / Search / Filter / Support
    ↓
┌─────────────────────────────┐
│     CAMPUSCARE DASHBOARD    │
│                             │
│ Complaints                  │
│ Categories                  │
│ Priority                    │
│ Impact                      │
│ Status                      │
│ Progress                    │
│ Resolution                  │
└─────────────────────────────┘
    ↑
    | View / Search / Filter / Manage
    |
Admin

The dashboard should not be duplicated into completely separate complaint systems for students and administrators.

Role-based authorization determines which actions are available to each user.

---

# 5. Permission Matrix

| Action | Student | Admin |
|---|:---:|:---:|
| Register | Yes | No |
| Login | Yes | Yes |
| Logout | Yes | Yes |
| View dashboard | Yes | Yes |
| Search complaints | Yes | Yes |
| Filter complaints | Yes | Yes |
| View complaint details | Yes | Yes |
| Submit complaint | Yes | No |
| Attach complaint evidence | Yes | No |
| View AI category | Yes | Yes |
| View AI priority | Yes | Yes |
| View support/impact count | Yes | Yes |
| Support existing complaint | Yes | No |
| Add supporting comment | Yes | Yes |
| Add supporting evidence | Yes | Yes |
| View progress updates | Yes | Yes |
| Assign complaint | No | Yes |
| Update progress | No | Yes |
| Change complaint status | No | Yes |
| Upload resolution evidence | No | Yes |
| Add resolution information | No | Yes |
| Resolve complaint | No | Yes |

---

# 6. Pending Decisions

The following role/permission decisions are intentionally not finalized yet:

- Whether students can withdraw their own complaints.
- Whether students can edit complaints after submission.
- Whether students can remove their own supporting comments/evidence.
- Whether admins can edit complaint descriptions.
- Whether admins can delete complaints.
- Exact visibility of student identity.
- Exact admin account provisioning mechanism.
- Exact audit requirements for administrative actions.
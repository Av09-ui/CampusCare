# CampusCare - User Workflows

## WF-CMP-001: Submit Complaint

### Actor
Student

### Preconditions
- Student is authenticated.

### Main Flow

1. Student opens the complaint submission interface.
2. Student enters a natural-language description of the problem.
3. Student optionally attaches supporting evidence.
4. Student submits the complaint.
5. Backend validates the request.
6. System associates the complaint with the authenticated student.
7. AI service analyzes the complaint.
8. AI generates the initial category.
9. AI assesses the initial priority.
10. System checks for potentially similar existing complaints.
11. If no sufficiently similar complaint is found, a new complaint is created.
12. Complaint becomes visible on the shared dashboard.
13. Student receives the complaint details.

### Alternative Flow: Similar Complaint Found

1. AI identifies a potentially similar existing complaint.
2. System presents the existing complaint to the student.
3. Student reviews the existing complaint.
4. Student chooses either:
   - Support the existing complaint, or
   - Continue with a new complaint.
5. If the student supports the existing complaint, no duplicate complaint is created.
6. Optional student comment/evidence is associated with the existing complaint.
7. The complaint's impact/support information is updated.

### Failure Cases

- Invalid complaint input.
- Unsupported attachment.
- Attachment upload failure.
- AI service unavailable.
- Database failure.
- Authentication failure.

### Result

A valid complaint is created or the student's experience is associated with an existing complaint.
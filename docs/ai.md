# CampusCare AI Service

## 1. Purpose

The CampusCare AI Service analyzes student complaints and provides structured information that helps the system categorize, prioritize, and identify potentially similar complaints.

The AI component is intentionally limited to practical features that can be implemented, tested, and integrated reliably within the scope of the ASD and DevOps mini-project.

The AI Service does not make final administrative decisions. It provides analysis that is stored by the backend and shown to users/admins where appropriate.

---

## 2. AI Responsibilities

The AI Service is responsible for:

1. Complaint categorization
2. Initial priority assessment
3. Similar complaint detection
4. Confidence estimation for AI predictions
5. Re-evaluation of priority when complaint impact changes

The AI Service is not responsible for:

- User authentication
- Authorization
- Complaint ownership
- Database management
- Admin assignment
- Complaint resolution
- File storage
- Sending notifications
- Automatically merging complaints
- Making final administrative decisions

---

## 3. AI Processing Flow

The general processing flow is:

Student submits complaint
        |
        v
Backend validates complaint
        |
        v
Backend sends complaint text to AI Service
        |
        v
AI Service analyzes complaint
        |
        +--> Category
        |
        +--> Priority
        |
        +--> Confidence
        |
        +--> Similar complaints
        |
        v
Backend stores AI analysis
        |
        v
Complaint appears on shared dashboard

AI analysis is therefore a supporting component of the complaint workflow rather than a replacement for the backend.

---

## 4. AI Input

The primary AI input is the complaint description written by the student.

Example:

"Students are unable to access the college portal for the last three days.
The examination form submission page keeps showing an error."

The initial AI implementation will primarily use text.

Attachments such as images and videos may be submitted as evidence, but the first version of the AI Service will not perform computer vision or video analysis on them.

Attachments remain available to administrators as supporting evidence.

---

## 5. Complaint Categorization

### Objective

The categorization component assigns a suitable category to a complaint based on its textual description.

Example:

Input:

"The college website is not opening when I try to submit my examination form."

Possible result:

```json
{
  "category": "PORTAL_OR_WEBSITE",
  "confidence": 0.91
}
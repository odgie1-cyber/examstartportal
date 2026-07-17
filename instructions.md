# ExamStart Portal: Codex Instructions

This document serves as the absolute "Source of Truth" for OpenAI Codex inside the `Examstart-Prototype` workspace. It defines the project context, core user personas, the 6 universal lifecycle statuses, UI styling guidelines, and structural design rules for our interactive HTML mockups.

---

## 1. Project Overview & System Purpose
ExamStart is a secure entry portal used by academic authors, administrative staff, and invigilators to configure, test, and run computer-based exams. 

### The Core Objective of the Portal
The Author Portal provides a centralized dashboard and detailed step-by-step workspaces where university academics (Authors) manage their exams. The system guides authors through a strict, sequential, one-way progression—from a newly created administrative shell up to the final room scheduling on campus.

* [cite_start]No Database Backend: The active prototype is built using static, highly polished HTML files (dashboard.html, workspace-awaiting.html, workspace-testing.html, and workspace-attention.html) that simulate workflow logic using simple page-to-page relative links[cite: 7].

---

## 2. The 6 Universal Lifecycle Statuses
Every exam in the system moves through these 6 chronological states:

1. [cite_start]Not Started (Gray: #64748b | BG: #f8fafc) -> System shell is created by admin; academic has not yet initiated the workflow[cite: 22, 23, 110].
2. [cite_start]Awaiting Author (Soft Orange: #d97706 | BG: #fef3c7) -> Handed over to the academic to build questions in QuestionMark OnDemand[cite: 22, 24, 34].
3. Published but needs attention (Bright Magenta: #d10074 | BG: #fff0f7) -> Troubleshooting phase. Internal QA flagged an error. [cite_start]Step 2 shows a prominent "⚠ FAILED" badge[cite: 22, 25, 30, 35].
4. Published awaiting checks (Soft Blue: #2563eb | BG: #dbeafe) -> Verification phase. System deployed to staging. Step 2 shows "✓ PASSED". [cite_start]Step 3 (Try-Out Preview) is active[cite: 22, 26, 34].
5. Published passed checks (Safe Teal: #0d9488 | BG: #f0fdfa) -> Certified Green Light. [cite_start]Background check confirms a 100% score trial[cite: 22, 27].
6. Scheduled (Classic Green: #16a34a | BG: #f0fdf4) -> Locked state. The workspace header turns completely green. [cite_start]Sidebar cards display Southampton room bookings (e.g., B58-R1043, B44-R1061)[cite: 22, 28, 56, 73, 81].

---

## 3. Structural Design Rules for Codex
When modifying, expanding, or generating pages within this prototype, adhere to the following rules:

* [cite_start]Rule 1: One-Way Sequential Progression -> Future steps in the workspace pipeline must remain visually grayed out and functionally disabled (.card-disabled, .btn-disabled)[cite: 62, 107, 108].
* [cite_start]Rule 2: Persistent Access to Step 1 -> Step 1 (the QuestionMark OnDemand button) must always remain active in all subsequent statuses so authors can review/edit their source items[cite: 65, 95].
* [cite_start]Rule 3: Step 2 Validation Behavior -> Passed State renders a green "✓ PASSED" badge under the step details[cite: 91]. [cite_start]Failed State renders a high-visibility magenta "⚠ FAILED" badge[cite: 101].
* [cite_start]Rule 4: Campus Schedule Integration -> Standard campus schedules (such as Southampton bookings like 08/08/2026 B58-R1043, B58-1047, B58-1049, B44-R1061) remain locked in a grayed-out state until the status explicitly shifts to Scheduled[cite: 71, 73].



The "ExamStart" Core ConceptExamStart is a secure entry portal used by academics and invigilators to configure, test, and run computer-based exams.  The purpose of this Author Portal is to allow university academics (Authors) to track their draft exams through a rigid, sequential progression from an admin-created shell up to a live, scheduled room assignment on campus.🚦 The 6 Universal Lifecycle StatusesThese are the 6 exact states of an exam, representing the chronological journey of a test. They dictate how the dashboard rows render and how the detailed steps are styled.#Status NameSystem ColorBackground / TintOperational Meaning1Not StartedGray (#64748b)Gray Tint (#f8fafc)The exam shell is newly created by admins, but the academic has not yet taken action.2Awaiting AuthorSoft Orange (#d97706)Light Yellow (#fef3c7)Handed over to the academic. They must build their questions & rubrics in QuestionMark OnDemand.3Published but needs attentionBright Magenta (#d10074)Soft Pink (#fff0f7)Quality check failed (accessibility, image, or logic errors). Requires human remediation.4Published awaiting checksSoft Blue (#2563eb)Light Blue (#dbeafe)The staging environment is built. Waiting for the academic to run a 100% successful test run.5Published passed checksSafe Teal (#0d9488)Light Teal (#f0fdfa)Background lookup registers a 100% score trial. Internal checks are officially cleared.6ScheduledClassic Green (#16a34a)Light Green (#f0fdf4)Lockdown state. Campus room codes (e.g., Building 58, Building 44) and session times are locked.
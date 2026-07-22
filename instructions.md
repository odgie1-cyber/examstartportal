# ExamStart Portal Prototype

## Purpose

ExamStart is a proposed secure entry portal for university staff who prepare, support, and run computer-based exams. This repository is a static workflow demonstration for stakeholder review. It is not the production service and does not contain authentication, a database, or live integrations.

The prototype should help a user answer four questions:

1. Which exams are relevant to me?
2. What state is each exam in?
3. What needs to happen next?
4. Who should I contact or which external system should I use?

## Prototype scope

- `dashboard.html` is the combined Author view for OnDemand and alternative exam systems.
- `dashboard-with-warning.html` demonstrates a dashboard-level warning.
- `aa-dashboard.html` is the Assessment and Awards view across the assessment period.
- `non-ondemand-dashboard.html` isolates the alternative-system examples for demonstration.
- `workspace-*.html` files demonstrate detailed exam states.
- `includes.js` supplies the shared header and footer when pages are opened directly or served over HTTP.
- `dashboard-table.js` adds the exam-system column, sorting, filtering, and result counts.
- `styles.css` contains the shared visual design.

Links labelled “live service” and buttons labelled “Preview” are intentional prototype boundaries. They do not represent completed integrations.

## Roles

### Author

An academic author sees their exams, understands the current state, completes the next required action, opens supporting files, and contacts their assigned iSolutions lead when necessary.

### Assessment and Awards (A&A)

A&A staff see all exams in the assessment period and use status, quality-check, tryout, and scheduling information to monitor operational progress.

### iSolutions lead

The assigned technical lead supports the author, performs or coordinates checks, resolves findings, and helps move the exam toward scheduling.

## OnDemand lifecycle

The OnDemand workflow follows six chronological states.

| Order | Status | Colour | Meaning | Expected next action |
| --- | --- | --- | --- | --- |
| 1 | Not Started | Grey `#64748b` | The administrative shell exists, but work has not begun. | iSolutions begins contact and the workflow. |
| 2 | Awaiting Author | Orange `#d97706` | The author must prepare questions and the rubric in OnDemand. | Author completes the exam content. |
| 3 | Published But Needs Attention | Magenta `#d10074` | Quality checks found an issue requiring discussion. | Author and iSolutions agree remediation. |
| 4 | Published Awaiting Checks | Blue `#2563eb` | The published exam is ready for verification and a tryout. | Author completes a successful 100% tryout. |
| 5 | Published Passed Checks | Teal `#0d9488` | Quality checks and the required tryout have passed. | Wait for scheduling; report any later changes. |
| 6 | Scheduled | Green `#16a34a` | Date, time, and room arrangements are confirmed. | No workflow action is required. |

Suggested background tints are grey `#f8fafc`, yellow `#fef3c7`, pink `#fff0f7`, blue `#dbeafe`, teal `#f0fdfa`, and green `#f0fdf4` respectively.

## Alternative exam-system workflow

Exams delivered through systems such as Moodle or Excel do not use the OnDemand quality-check and tryout steps. The prototype demonstrates three communication states:

1. **Not Started** — no author contact has been recorded.
2. **Awaiting Author** — iSolutions is in contact with the author and arrangements are being gathered.
3. **Scheduled** — the exam arrangements have been agreed.

Quality Checks, Tryout, and SharePoint may be shown as “Not applicable” where those concepts do not belong to the alternative workflow.

## Interaction and content rules

1. Workflow progression is sequential. Future steps must appear unavailable until their prerequisites are complete.
2. Access to the source exam in OnDemand remains available after Step 1 so an author can review it. If they change a published exam, the interface must explain that republication may be required.
3. Failed quality checks use the high-visibility magenta failed state and direct the author to speak to iSolutions.
4. Passed quality checks and passed tryouts are shown separately so users can distinguish technical verification from the author’s successful test run.
5. Scheduling details remain unavailable until the Scheduled state. A scheduled workspace may then show confirmed dates, times, and room codes.
6. Status meaning must be communicated with text as well as colour.
7. Prototype-only actions must be labelled clearly. Do not present a placeholder link as though it were a working live-service feature.
8. Author and A&A wording may differ because their responsibilities differ, but status names must remain consistent.

## Demo data conventions

- Exam codes, people, email addresses, room bookings, and SharePoint paths are representative demonstration data.
- Each dashboard row represents one exam in one current state. Reuse of the same exam code for multiple simultaneous states should be avoided.
- External links open in a new tab where appropriate.
- The combined Author view is the primary demonstration path; role and workflow switches in the footer expose the other scenarios.

## Out of scope until production development

- Authentication and authorisation
- Live exam, scheduling, email, SharePoint, OnDemand, or ServiceLine integrations
- Persistent data and audit history
- Production accessibility assurance and supported-browser testing
- Automated build, validation, and end-to-end test pipelines
- Hosting, monitoring, security controls, and operational support design

These production concerns should be defined after the workflow demonstration has been reviewed and approved by stakeholders.

## Prototype acceptance checklist

- All six OnDemand statuses are represented consistently across dashboard and workspace examples.
- Alternative-system examples are clearly distinguished from OnDemand exams.
- Every workspace states what the current status means and what happens next.
- Disabled future steps cannot be mistaken for available actions.
- Demo-only actions and live-service-only features are labelled explicitly.
- Dashboard scenarios use distinct exam codes.
- Internal file references resolve when the project is opened from a subdirectory or served from its root.

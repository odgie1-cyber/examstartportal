# ExamStart Portal: Engineering Technical Overview

## 1. Purpose of this document

This document provides a technical starting point for building the production ExamStart Portal from the validated workflow prototype. It describes the proposed system boundaries, domain model, state-management approach, application structure, interfaces, security expectations, testing strategy and delivery sequence.

It is intentionally implementation-oriented but technology-stack neutral. The engineering team should confirm alignment with University standards for hosting, identity, integration, security and support before selecting specific frameworks or cloud services.

## 2. Product objective

ExamStart will provide a secure entry point through which academic authors and operational staff can prepare, monitor, verify and schedule computer-based exams.

The service should enable a user to answer four questions quickly:

1. Which exams are relevant to me?
2. What state is each exam in?
3. What must happen next?
4. Who should I contact or which supporting system should I use?

The current static prototype validates the proposed workflow and information design. It does not represent the production architecture.

## 3. Core implementation principle

### One workspace, multiple states

The production service should implement one canonical exam-workspace page rather than maintaining a separate page for each status.

The route should identify the exam, not its current status:

```text
/exams/{examId}
```

The application retrieves the authoritative exam record and renders the workspace according to:

- exam workflow type;
- current lifecycle status;
- quality-check outcome;
- tryout outcome;
- scheduling data;
- current user's role and permissions; and
- availability of external integrations.

The complete workflow remains visible to give users a consistent mental model. State and permission rules determine which elements are completed, active, available, read-only or unavailable. Access to OnDemand remains available in every lifecycle status, including Not Started; the lifecycle controls the managed ExamStart process rather than the user's ability to enter the source authoring system.

### Do not encode business rules only in the interface

The frontend may hide or disable unavailable actions, but the backend must independently validate every command. A user must not be able to bypass workflow or permission rules by constructing an API request manually.

## 4. Recommended architecture

Begin with a modular monolith unless organisational standards require another pattern. The current domain does not justify distributed services at project inception. Clear internal module boundaries will allow later extraction if scale or integration ownership requires it.

```text
Browser
  |
  v
Web application
  |-- Author dashboard
  |-- A&A dashboard
  |-- State-driven exam workspace
  |-- Shared design system and workflow components
  |
  v
Application/API layer
  |-- Identity and access policy
  |-- Exam query service
  |-- Workflow command service
  |-- Quality-check service
  |-- Tryout service
  |-- Scheduling service
  |-- Notification service
  |-- Audit service
  |
  v
Domain and persistence
  |-- Relational database
  |-- Transaction and transition rules
  |-- Audit/event records
  |
  v
Integration adapters
  |-- Institutional identity provider
  |-- OnDemand
  |-- SharePoint
  |-- Scheduling/room source
  |-- Email or notification service
  |-- ServiceLine/support tooling where required
```

### Architectural characteristics

- **Server-authoritative state:** lifecycle status and permissions come from trusted server-side data.
- **Configuration-driven presentation:** workflow definitions map domain state to UI presentation.
- **Explicit commands:** actions such as publish, record check result and confirm schedule are named domain operations, not generic record updates.
- **Auditable transitions:** every material workflow change records who, what, when and why.
- **Integration isolation:** external systems are accessed through adapters so their implementation details do not leak into core workflow code.
- **Progressive delivery:** useful end-to-end slices can be released without completing every integration first.

## 5. Domain model

The exact data model should be refined through domain workshops. The following model is a recommended baseline.

### Exam

```text
Exam
- id
- academicYear
- assessmentPeriod
- moduleCode
- moduleTitle
- workflowType
- lifecycleStatus
- authorAssignments[]
- technicalLeadAssignment
- externalReferences
- createdAt
- updatedAt
- version
```

`version` should support optimistic concurrency so two staff members cannot unknowingly overwrite each other's changes.

### Workflow type

At minimum:

```text
ON_DEMAND
ALTERNATIVE
NOT_EXAMSTART
```

Avoid scattering checks such as `examSystem === "Moodle"` throughout the application. Workflow behaviour should be selected through a workflow type or policy.

### Lifecycle status

Use stable machine-readable identifiers and separate user-facing labels:

```text
NOT_STARTED
AWAITING_AUTHOR
PUBLISHED_NEEDS_ATTENTION
PUBLISHED_AWAITING_CHECKS
PUBLISHED_PASSED_CHECKS
SCHEDULED
```

The display label can change without requiring a data migration.

### Quality check

```text
QualityCheck
- id
- examId
- status: NOT_STARTED | IN_PROGRESS | PASSED | FAILED
- findingsSummary
- findingsReference
- checkedBy
- checkedAt
- sourceVersion
```

`sourceVersion` identifies the exam version that was checked. If the source changes after a pass, the application can determine that the previous result may no longer be valid.

### Tryout

```text
Tryout
- id
- examId
- attemptedBy
- attemptedAt
- score
- outcome: PASSED | FAILED
- resultReference
- sourceVersion
```

Do not model a failed tryout as a separate lifecycle status unless stakeholders explicitly require it. It is an outcome within `PUBLISHED_AWAITING_CHECKS` and affects the next action shown in the workspace.

### Schedule

```text
Schedule
- id
- examId
- startsAt
- duration
- rooms[]
- status: PROVISIONAL | CONFIRMED | CANCELLED
- confirmedBy
- confirmedAt
- sourceReference
```

The workspace should expose schedule details only when permitted by the domain rules and the data is sufficiently confirmed.

### Assignment and role

```text
ExamAssignment
- examId
- userId
- assignmentRole: AUTHOR | TECHNICAL_LEAD | OPERATIONAL_OWNER
- activeFrom
- activeTo
```

Identity roles and exam assignments should be treated separately. A person may have permission to act as an Author generally but should only see exams to which they are assigned unless broader access has been granted.

### Audit event

```text
AuditEvent
- id
- examId
- eventType
- actorId
- occurredAt
- previousState
- resultingState
- reason
- correlationId
- metadata
```

Audit records should be append-only from the application perspective.

## 6. Workflow state machine

The backend should own a formal state machine or transition policy. Do not allow arbitrary updates to `lifecycleStatus`.

### Principal OnDemand path

```text
NOT_STARTED
  -> AWAITING_AUTHOR
  -> PUBLISHED_AWAITING_CHECKS
  -> PUBLISHED_PASSED_CHECKS
  -> SCHEDULED
```

### Attention and remediation path

```text
PUBLISHED_AWAITING_CHECKS
  -> PUBLISHED_NEEDS_ATTENTION
  -> PUBLISHED_AWAITING_CHECKS
```

The second transition represents remediation and republication. The exact event that completes remediation must be agreed with the operational team.

### Important transition decisions

Product and operational stakeholders need to confirm:

- who can initiate each transition;
- which transitions are automatic and which require confirmation;
- whether failed checks are recorded before or simultaneously with the attention status;
- whether a successful tryout is detected automatically or recorded manually;
- whether an author edit invalidates previous checks or tryouts;
- what happens when a scheduled exam changes;
- whether cancellation or withdrawal states are required; and
- whether status corrections require a privileged administrative action.

### Transition service

All transitions should pass through one domain service or policy boundary:

```text
transitionExam(examId, command, actor, expectedVersion)
```

It should:

1. load the current exam and related evidence;
2. check the user's permission;
3. check the transition preconditions;
4. update state atomically;
5. append an audit event;
6. write an integration/outbox event if required; and
7. return the updated workspace projection.

## 7. State-driven workspace presentation

### Workflow presentation model

The API should provide a presentation-ready projection without making the frontend the sole owner of workflow rules.

Example:

```json
{
  "exam": {
    "id": "exam-123",
    "moduleCode": "BIOL1002",
    "moduleTitle": "The Birds and the Bees",
    "workflowType": "ON_DEMAND",
    "status": "PUBLISHED_AWAITING_CHECKS",
    "statusLabel": "Published Awaiting Checks",
    "statusExplanation": "The published exam is ready for verification and a tryout."
  },
  "steps": [
    {
      "id": "CREATE_EXAM",
      "state": "COMPLETE",
      "availableActions": ["OPEN_ON_DEMAND"]
    },
    {
      "id": "QUALITY_CHECKS",
      "state": "COMPLETE",
      "outcome": "PASSED",
      "availableActions": ["VIEW_RESULTS"]
    },
    {
      "id": "TRYOUT",
      "state": "ACTIVE",
      "outcome": "NOT_STARTED",
      "availableActions": ["START_TRYOUT"]
    }
  ],
  "schedule": {
    "state": "UNAVAILABLE",
    "message": "Scheduling details will appear after checks have passed."
  },
  "links": [],
  "permissions": []
}
```

This does not prevent the frontend from having its own view models. It establishes a trusted server interpretation that can also support other clients and automated testing.

### Recommended frontend components

```text
ExamWorkspacePage
  ExamHeader
  StatusSummary
  WorkflowStepList
    WorkflowStepCard
    StepOutcome
    StepActions
  AttentionCallout
  TechnicalLeadPanel
  PrintFilesPanel
  SchedulePanel
  AuditHistoryPanel
```

Components should accept explicit states such as `complete`, `active`, `attention`, `unavailable` and `readOnly`. They should not infer domain state from colours or labels.

### Workflow definitions

Use separate workflow definitions when the process genuinely differs:

```text
OnDemandWorkflowDefinition
AlternativeWorkflowDefinition
NotExamStartDefinition
```

They should reuse the same workspace shell and common components wherever possible.

## 8. Roles and authorisation

Initial roles are expected to include:

- **Author:** views assigned exams and completes author actions.
- **A&A operator:** monitors exams across an assessment period and performs authorised operational actions.
- **iSolutions technical lead:** performs or records checks, supports authors and manages technical progress.
- **Administrator:** manages configuration and exceptional corrections where authorised.

Implement authorisation as policies, not scattered role-name checks.

Example policies:

```text
CanViewExam
CanEditSourceExam
CanRecordQualityCheck
CanStartTryout
CanViewTryoutResults
CanConfirmSchedule
CanCorrectWorkflowState
CanViewAuditHistory
```

Every API query and command must apply the appropriate policy.

## 9. API outline

The API style should follow University standards. The following resource and command boundaries apply whether REST, GraphQL or another approved approach is selected.

### Queries

```text
GET /api/exams
GET /api/exams/{examId}
GET /api/exams/{examId}/workspace
GET /api/exams/{examId}/audit-events
GET /api/assessment-periods/{periodId}/exams
```

Dashboard queries should support server-side:

- text search;
- status filtering;
- workflow-type filtering;
- assessment-period filtering;
- sorting;
- pagination; and
- role-based data projection.

### Commands

Prefer named operations over permitting arbitrary status patches:

```text
POST /api/exams/{examId}/begin-author-workflow
POST /api/exams/{examId}/record-publication
POST /api/exams/{examId}/quality-checks
POST /api/exams/{examId}/request-remediation
POST /api/exams/{examId}/record-tryout
POST /api/exams/{examId}/confirm-passed-checks
POST /api/exams/{examId}/schedule
POST /api/exams/{examId}/report-source-change
```

Commands should be idempotent where retries are likely. Use request or idempotency identifiers for operations that trigger external side effects.

### Errors

Return structured errors that distinguish:

- unauthenticated;
- unauthorised;
- exam not found or not visible;
- stale version/concurrent modification;
- invalid transition;
- missing transition prerequisite;
- integration unavailable; and
- validation failure.

User-facing messages should explain recovery without exposing internal details.

## 10. Integration approach

External systems should be represented by interfaces owned by the application layer.

Examples:

```text
IdentityProvider
ExamAuthoringProvider
DocumentRepository
SchedulingProvider
NotificationProvider
TryoutResultProvider
SupportCaseProvider
```

### Integration rules

- Keep external identifiers alongside, but separate from, internal identifiers.
- Define which system is authoritative for each data field.
- Set explicit timeout and retry policies.
- Avoid holding database transactions open during network calls.
- Record correlation identifiers for troubleshooting.
- Make repeated webhook or polling results idempotent.
- Define how users are informed when an integration is unavailable.
- Use an outbox or equivalent reliable-delivery pattern for consequential asynchronous actions.

Early vertical slices may use controlled test adapters if external services are not yet available. Test adapters must be clearly separated from production implementations.

## 11. Data ownership decisions

Before implementation, agree an ownership matrix for at least:

| Data | Proposed authority | Questions |
| --- | --- | --- |
| Module and exam identity | Student/assessment source | How and when is it synchronised? |
| Author assignments | Institutional source or ExamStart | Who corrects assignments? |
| Technical lead | ExamStart operational data | Can there be more than one? |
| OnDemand exam reference | OnDemand/ExamStart mapping | Who creates the association? |
| Quality-check result | ExamStart or checking service | Is supporting evidence retained? |
| Tryout result | OnDemand/result service | Is a manual override allowed? |
| Schedule and rooms | Scheduling system | What counts as confirmed? |
| Print files | SharePoint | How are permissions inherited? |
| Lifecycle status | ExamStart | Which external events can change it? |

Do not begin integration development until ownership and update direction are explicit.

## 12. Security and privacy baseline

The service will contain assessment-related operational information and links to exam materials. Security requirements must be established through formal review.

The initial baseline should include:

- institutional single sign-on;
- least-privilege role and assignment-based access;
- server-side authorisation on every request;
- secure session and CSRF protections appropriate to the chosen architecture;
- encryption in transit and at rest;
- secrets held in an approved secrets-management service;
- append-only audit records for material actions;
- no sensitive information in URLs, browser logs or analytics;
- dependency, static-analysis and vulnerability scanning;
- retention and deletion rules;
- threat modelling for external links, integration callbacks and privilege changes; and
- monitoring and alerting for access failures and suspicious activity.

Links to SharePoint or OnDemand do not replace access control. Those systems must enforce their own permissions, and ExamStart must avoid exposing links to unauthorised users.

## 13. Accessibility and usability engineering

The production service should target the accessibility standard required by the University, confirmed at project inception.

Engineering practices should include:

- semantic headings, landmarks, lists, tables and controls;
- keyboard-accessible dashboard rows and actions;
- visible focus indicators;
- text labels in addition to status colour;
- correctly associated validation and error messages;
- announced updates for filtering, status changes and asynchronous actions;
- responsive behaviour at supported zoom levels and viewport sizes;
- accessible disabled-state explanations;
- reduced-motion support where animation is introduced; and
- testing with automated tools plus keyboard and screen-reader review.

The full workflow should remain visible when future actions are unavailable. Use genuine disabled controls only when the user benefits from seeing the action. If no action is possible, explanatory content may be clearer than a disabled button.

Usability testing should continue during implementation. Production components should preserve the validated information hierarchy while allowing findings to refine wording and interaction details.

## 14. Observability and operational support

Use structured logs and metrics that support both technical diagnosis and workflow operations.

Recommended telemetry includes:

- command and transition success/failure counts;
- invalid-transition attempts;
- integration latency and failure rates;
- synchronisation age;
- notification delivery status;
- dashboard and workspace response times;
- authentication and authorisation failures; and
- exams remaining in a state beyond an agreed threshold.

Do not place exam content or unnecessary personal data in logs. Correlation identifiers should connect user requests, workflow events and external calls.

Operational documentation should define ownership, support hours, incident routes, recovery procedures and safe administrative corrections.

## 15. Testing strategy

### Domain tests

Create table-driven tests for every allowed and rejected transition. These are the most important tests because the lifecycle controls the entire experience.

Each case should include:

- starting state;
- actor and permissions;
- command;
- prerequisite evidence;
- expected resulting state;
- expected audit event; and
- expected side effects.

### Component tests

Render the shared workspace using fixtures for every status and outcome combination. Test visible content, action availability and accessibility semantics.

Minimum fixtures should include:

- Not Started;
- Awaiting Author;
- quality checks failed;
- awaiting checks with no tryout;
- awaiting checks with failed tryout;
- passed checks;
- scheduled;
- alternative workflow states;
- integration unavailable; and
- insufficient permission/read-only access.

### API and persistence tests

Verify authorisation, validation, concurrency, transaction behaviour, audit writes, filtering and pagination.

### Contract tests

Test integration adapters against agreed provider contracts. Webhooks and synchronisation jobs should be tested for duplicate, delayed and out-of-order messages.

### End-to-end tests

Keep the suite focused on critical journeys:

1. Author finds an assigned exam and understands the next action.
2. Author accesses the source exam.
3. Failed quality checks lead to the correct attention journey.
4. Successful checks and tryout produce the passed state.
5. A confirmed schedule becomes visible.
6. A&A filters and locates exams across an assessment period.
7. An unauthorised user cannot view or change an exam.

### Non-functional tests

Include accessibility, performance, security, recovery and integration-failure testing in the delivery plan rather than leaving them until release.

## 16. Suggested implementation sequence

### Phase 0: Inception and decisions

- Confirm personas, terminology and workflow transitions.
- Agree system and data ownership.
- Confirm identity, hosting, security and accessibility standards.
- Identify integration owners and test environments.
- Record architectural decisions.

### Phase 1: Walking skeleton

Deliver the thinnest deployable path:

- institutional sign-in or an approved development substitute;
- one authorised user;
- one persisted exam;
- Author dashboard;
- canonical exam workspace;
- shared design foundations;
- health checks, logging and deployment pipeline.

The first workspace may use `AWAITING_AUTHOR`, but it should use the real domain and API boundaries rather than hard-coded page logic.

### Phase 2: Core OnDemand journey

Implement vertical slices in this order:

1. Awaiting Author and source-exam access;
2. Published Awaiting Checks;
3. quality-check results;
4. tryout recording and failed-tryout presentation;
5. Published But Needs Attention and remediation;
6. Published Passed Checks; and
7. Scheduled details.

Each slice should include domain rule, API, persistence, UI, audit and automated tests.

### Phase 3: Operational oversight

- A&A dashboard;
- server-side search, filters, sorting and pagination;
- assessment-period views;
- operational actions and audit history; and
- support for realistic data volumes.

### Phase 4: Alternative workflows

- workflow-type selection;
- alternative workflow definition;
- shared workspace-shell reuse;
- not-applicable presentation rules; and
- transition and permission tests.

### Phase 5: Integrations and automation

Replace controlled adapters with approved integrations incrementally. Do not combine every integration into one release if they can be introduced safely behind stable interfaces.

### Phase 6: Production readiness

- accessibility assurance;
- security review and penetration testing;
- performance and resilience validation;
- monitoring and operational dashboards;
- data migration or initial synchronisation;
- support documentation and training;
- release rehearsal and rollback; and
- production acceptance.

## 17. Engineering backlog structure

Recommended epics:

1. Platform, environments and delivery pipeline
2. Identity and role-based access
3. Exam domain and workflow state machine
4. Author dashboard
5. Common exam workspace
6. OnDemand source access and publication
7. Quality checks and remediation
8. Tryout and result verification
9. Scheduling and room information
10. A&A operational dashboard
11. Alternative exam workflows
12. External integrations and notifications
13. Audit, reporting and operational support
14. Accessibility, security and production readiness

User stories should be vertical and testable. Avoid stories such as “build all frontend pages” or “create the database” that produce isolated technical layers without user value.

Technical-enabler stories are appropriate where they unlock delivery, but they should identify the product capability they enable.

## 18. Definition of Ready

A story is ready for implementation when:

- the user or operational outcome is clear;
- the relevant role is identified;
- acceptance criteria cover the principal success and failure cases;
- status and transition implications are explicit;
- data ownership is known;
- required permissions are stated;
- integration dependencies and test substitutes are known;
- accessibility expectations are included;
- unresolved decisions are not large enough to change the solution materially; and
- the story is small enough to complete within the team's agreed delivery window.

## 19. Definition of Done

A story is done when:

- acceptance criteria pass;
- domain, API and UI behaviour are implemented as applicable;
- server-side authorisation is enforced;
- automated tests cover the important rules;
- accessibility has been considered and tested proportionately;
- audit and observability requirements are implemented;
- error and unavailable-integration behaviour is defined;
- documentation and decision records are updated;
- the change has been reviewed and deployed to the agreed environment; and
- the product owner can demonstrate the completed user outcome.

## 20. Architectural decisions to record early

Create short Architecture Decision Records for:

- chosen application stack and hosting platform;
- modular-monolith boundaries;
- identity and authorisation model;
- lifecycle state-machine ownership;
- relational database and migration approach;
- audit-event storage;
- API style and error format;
- integration and reliable-delivery patterns;
- frontend state and workflow configuration;
- accessibility target and supported browsers; and
- observability, retention and privacy standards.

## 21. Principal risks

### Ambiguous status ownership

If more than one system can update lifecycle status without a clear authority, state will become inconsistent. ExamStart should own the workflow state even when external evidence triggers a transition.

### Invalidating previously passed work

Changes after publication may invalidate checks, tryouts or scheduling confidence. Version linkage and explicit invalidation rules are essential.

### UI and backend rule drift

If the frontend and backend independently encode transitions, users may see actions the server rejects or gain access to invalid operations. Use a server-authoritative workflow model and shared contract tests.

### Integration availability

The portal must remain understandable when OnDemand, SharePoint, scheduling or notification services are unavailable. Define degraded behaviour rather than presenting indefinite loading or misleading success.

### Large operational datasets

The A&A dashboard should use server-side filtering and pagination. Do not reproduce the prototype's large hard-coded table as a production data-loading strategy.

### Prototype becoming an accidental specification

The prototype is evidence about workflow and usability, not a complete statement of data, security or operational requirements. Any behaviour not covered by an agreed rule should be treated as a question rather than inferred from static markup.

## 22. Immediate next steps for the engineering team

1. Review this overview with Product, A&A, iSolutions, security, accessibility and integration owners.
2. Run a state-transition workshop and approve the transition matrix.
3. Produce the data-ownership and permissions matrices.
4. Confirm the institutional technology and hosting constraints.
5. Create the initial Architecture Decision Records.
6. Convert the walking skeleton and first Awaiting Author slice into refined user stories.
7. Establish repositories, environments, delivery controls and the first deployable application shell.
8. Preserve the existing prototype as a usability reference and fixture source, not as production code.

# ExamStart Portal Prototype: Technical Path, Workflow and Usability

## Executive summary

The ExamStart Portal prototype was developed as a static, interactive demonstration of an exam-preparation workflow. Its purpose is to test whether academic authors and operational staff can understand an exam's current state, see what needs to happen next, and reach the right supporting system or person.

The project deliberately uses HTML, CSS and small amounts of JavaScript rather than a database-backed application. This allowed the work to concentrate on workflow design, terminology, status communication and usability before committing to a production architecture.

Development took place through 16 incremental source-control commits between 17 and 22 July 2026. The work progressed from a basic Author dashboard and four workspace pages to a responsive, hosted prototype containing:

- a combined Author dashboard;
- the six-state OnDemand lifecycle;
- explicit quality-check and tryout outcomes;
- scheduled exam and room information;
- an Assessment and Awards dashboard covering 102 representative exams;
- alternative workflows for exams delivered outside OnDemand;
- dashboard search, sorting and result counts;
- demonstration variants for warnings, roles and workflow types; and
- clearer boundaries between functional demo links and features reserved for the live service.

The current prototype is hosted at:

https://odgie1-cyber.github.io/examstartportal/

## 1. Why the prototype was built this way

The main uncertainty was not the underlying technology. It was whether the proposed workflow would make sense to users.

The prototype therefore prioritised four user questions:

1. Which exams are relevant to me?
2. What state is each exam in?
3. What do I need to do next?
4. Who should I contact or which external system should I use?

A static prototype was appropriate because it made it possible to model complete journeys quickly without first building authentication, permissions, databases or integrations. Each representative exam is linked to a workspace page that shows a particular workflow state. Moving between pages simulates how the live service would respond to changing exam data.

This is an intentional separation of concerns:

- The prototype validates workflow, language, information hierarchy and visual feedback.
- The future production project will implement data, security, integrations, automated testing and operational controls after the workflow has been approved.

## 2. Current technical structure

The site is a collection of static files hosted through GitHub Pages.

### Entry point

`index.html` is the landing page. It redirects to `dashboard.html` using a relative path. The relative route allows the prototype to work from its hosted subdirectory without tying it to a specific domain.

### Author dashboards

`dashboard.html` is the main combined Author view. It shows both OnDemand exams and exams delivered through alternative systems such as Moodle or Excel.

`dashboard-with-warning.html` contains the same core dashboard with an additional warning scenario. Keeping this as a separate demonstration page makes it possible to discuss warning content and placement without requiring live state management.

`non-ondemand-dashboard.html` isolates the alternative-system examples. It is a demonstration aid; in the proposed service, an author would normally see all their exams together.

### Assessment and Awards dashboard

`aa-dashboard.html` represents the operational view used by Assessment and Awards staff. It contains 102 representative rows so that filtering, scanning and status monitoring can be assessed at a more realistic scale.

### Exam workspaces

The workspace pages represent workflow states rather than dynamically loading a single exam record. Important examples include:

- `workspace-awaiting.html` — Awaiting Author;
- `workspace-failed.html` — Published But Needs Attention;
- `workspace-testing.html` — Published Awaiting Checks;
- `workspace-tryout-failed.html` — checks passed but no successful 100% tryout yet;
- `workspace-ready.html` — Published Passed Checks;
- `workspace-complete.html` — Scheduled; and
- `workspace-non-ondemand-*.html` — the simplified alternative-system workflow.

This page-per-state method is simple, predictable and useful in workshops. A stakeholder can open a precise scenario without manipulating test data.

### Shared presentation and behaviour

`styles.css` holds the common design system, including status colours, cards, buttons, tables, warning treatments and responsive layouts.

`includes.js` supplies shared header and footer content. When the site is served over HTTP, it loads `header.html` and `footer.html`. When files are opened directly from a computer, it inserts fallback markup instead. This allows the prototype to remain usable in both hosted and local demonstrations.

`dashboard-table.js` progressively enhances dashboard tables. It:

- creates an Exam System column from row metadata;
- removes the internal iSolutions Lead column from the Author presentation;
- adds accessible data labels used by responsive table layouts;
- enables column sorting;
- filters rows using a search field where one is present;
- updates the visible result count; and
- shows an empty-state message when nothing matches.

The underlying HTML remains readable even before JavaScript enhancement, which is helpful for resilience and review.

## 3. Workflow model

### OnDemand lifecycle

The prototype models six chronological states:

1. **Not Started** — the administrative exam shell exists, but work has not begun.
2. **Awaiting Author** — the academic author needs to prepare questions and the rubric in OnDemand.
3. **Published But Needs Attention** — quality checks found an issue that requires discussion and remediation.
4. **Published Awaiting Checks** — the published exam is ready for verification and an author tryout.
5. **Published Passed Checks** — technical checks and the required 100% tryout have passed.
6. **Scheduled** — the date, time and room arrangements are confirmed.

The workflow is deliberately sequential. Future steps remain visibly unavailable until their prerequisites have been completed. Access to the source exam remains available after the creation stage because authors may need to review it. Later pages explain that changing a published exam may require republication.

### Separate check and tryout outcomes

An important design refinement was to distinguish two different forms of assurance:

- **Quality Checks** indicate whether the exam meets technical and best-practice requirements.
- **Tryout** indicates whether an author has successfully completed the test version and achieved the expected 100% score.

These outcomes are displayed separately on dashboards and workspaces. This prevents a technical pass from being mistaken for complete author verification.

The dedicated tryout-failed scenario also demonstrates that an attempt can exist without satisfying the required result. The interface directs the author either to try again or ask for a breakdown of the results.

### Alternative exam systems

The prototype later expanded beyond OnDemand. Moodle and Excel examples use a simpler operational sequence:

1. Not Started;
2. Awaiting Author; and
3. Scheduled.

Quality Checks, Tryout and SharePoint are marked as not applicable when those OnDemand concepts do not belong to the alternative workflow. The Exam System column makes the difference visible without forcing users into separate primary dashboards.

## 4. Development path

### Phase 1: Initial workflow prototype — 17 July 2026

The first version established the core technical pattern:

- one Author dashboard;
- shared header and footer fragments;
- a shared stylesheet;
- four representative workspace pages; and
- direct links between dashboard rows and workspace states.

The initial states covered Awaiting Author, Published Awaiting Checks, Published But Needs Attention and Scheduled. This was sufficient to test the basic idea of using status-led workspaces.

An `index.html` redirect was then added so visitors could enter through the repository's root URL rather than needing to know the dashboard filename. A filename was also normalised to lowercase to prevent case-sensitivity problems on web hosting.

### Phase 2: Responsive layout — 17 July 2026

The next work made the site usable on smaller screens. Responsive rules were added for dashboards, workspace cards, columns and navigation. The mobile header was refined separately after the first responsive pass.

This mattered because wide status tables and multi-column workspaces can become difficult to understand on a phone or narrow laptop. The responsive design restructures content while preserving the order of workflow information.

### Phase 3: Scheduled exam and support information — 20 July 2026

The Scheduled workspace was expanded with results guidance, print-version access, room information and clearer support content.

The failed-check journey was also revised so that the interface did not merely report failure. It explained that an iSolutions team member would contact the author and offered a direct contact action. This shifted the design from system-centred error reporting toward user-centred recovery.

### Phase 4: More precise workflow outcomes — 20 July 2026

Dashboard data and workspace copy were refined to distinguish quality-check status from tryout status. A dedicated tryout-failed workspace was introduced.

This phase also improved language across the workflow. Messages increasingly explained both the current condition and the expected next action. The layout received another responsive pass after the content became richer.

### Phase 5: Role expansion and operational scale — 21 July 2026

The prototype expanded from an Author-only view to include Assessment and Awards.

The A&A dashboard used 102 representative exams so users could assess scanning and operational oversight under realistic volume. Search, sorting and visible result counts were introduced through shared JavaScript rather than page-specific implementations.

A status key was added and refined to explain the lifecycle from the operational perspective. A Published Passed Checks entry was added explicitly so the key matched the full workflow.

### Phase 6: Non-OnDemand workflows — 21 July 2026

Alternative exam systems were introduced first as individual dashboard and workspace examples. The approach was then refined into:

- a combined Author dashboard;
- a dedicated demonstration view for non-OnDemand exams;
- three simplified non-OnDemand workspace states; and
- an Exam System table column generated consistently across dashboards.

This was a significant usability decision. It avoided making authors determine which portal to use before they could see their exams, while still allowing the different operational processes to remain clear.

### Phase 7: Demo readiness and documentation — 22 July 2026

The final prototype pass concentrated on demonstration clarity:

- the root redirect was made portable;
- placeholder links were removed;
- features intended only for production were labelled “live service”;
- simulated actions were labelled “Preview” and their messages identify them as demo-only;
- SharePoint demonstration links were made internally consistent;
- duplicate exam codes representing simultaneous states were removed; and
- the project instructions were rewritten as a coherent source of truth.

The update was committed to the main branch and published through the existing GitHub Pages site.

## 5. How the implementation supports usability

### Status-first information architecture

Every dashboard row surfaces the current status and the required action. Every workspace repeats the status in a prominent header and explains what it means. This reduces the need for users to infer workflow state from the available buttons.

### Consistent visual language

Each lifecycle state has a consistent colour and label across dashboards, keys and workspaces. Text accompanies colour so meaning is not intended to depend on colour alone.

### Progressive disclosure

The dashboard provides a compact summary. Selecting an exam reveals the detailed steps, support contacts, external links, outcomes and scheduling information. Users are not required to absorb all detail before choosing the relevant exam.

### Visible next actions

Workspace cards are numbered and arranged in workflow order. Completed, active and future steps use different treatments. Disabled future steps demonstrate sequencing, while persistent OnDemand access supports review of the source exam.

### Recovery from problems

Failure states use direct, supportive language. Instead of presenting an unexplained technical failure, the interface explains that a conversation is required, says who will make contact and provides an email action.

### Separation of audiences

Authors receive a task-oriented view of their own exams. A&A receives a higher-volume monitoring view with filtering and a status key. The underlying statuses remain consistent, but the explanatory wording reflects each role's responsibilities.

### Honest prototype boundaries

Non-functional links can undermine a usability session because participants may interpret them as defects. The prototype now labels production-only items and preview actions explicitly. This helps facilitators keep discussion focused on the proposed workflow rather than missing integrations.

## 6. Deliberate technical trade-offs

### Static pages instead of dynamic state

The main advantage is speed and predictability. Every scenario is stable and easy to demonstrate. The limitation is duplicated markup and the absence of real transitions between states.

### Representative data instead of a database

Realistic rows help users judge labels, density and scanning behaviour. However, changes are not persisted and the data cannot be treated as operationally accurate.

### Simple JavaScript enhancement

Small scripts provide enough behaviour for search, sorting and shared page elements without introducing a framework. This keeps the prototype easy to inspect and host. A production service will need a structured component model, stronger testing and data-driven rendering.

### External links instead of integrations

OnDemand, guidance, email and SharePoint are represented by links. This is enough to test whether users understand where those actions belong. Authentication, permissions, API behaviour, error handling and audit trails remain future production concerns.

## 7. Current validation and limitations

Before the latest publication, the source was checked for:

- duplicate exam codes in the Author dashboard variants;
- placeholder `#` links;
- missing local file references;
- JavaScript syntax; and
- source-control whitespace errors.

The prototype does not yet claim production accessibility compliance or full browser support. It also has no automated build pipeline or end-to-end test suite. Those are intentionally deferred until the live-service project.

## 8. Recommended use in workflow and usability sessions

The prototype should be treated as a discussion and task-testing tool, not as a visual sign-off alone.

Suggested Author tasks:

1. Find an exam that needs your input.
2. Explain what you believe must happen next.
3. Find where you would edit or review the exam.
4. Respond to a failed quality check.
5. Determine whether an exam has passed both checks and tryout.
6. Find the confirmed details for a scheduled exam.
7. Identify how a Moodle or Excel exam differs from an OnDemand exam.

Suggested A&A tasks:

1. Find a particular module or author.
2. Identify exams waiting for author action.
3. Distinguish exams awaiting checks from exams ready for scheduling.
4. Determine which statuses require operational intervention.
5. Explain the meaning of “Not ExamStart” and “Not applicable.”

Useful research questions:

- Do users correctly interpret every status label?
- Can they distinguish Quality Checks from Tryout?
- Is the next action obvious without facilitator explanation?
- Do disabled steps clarify sequencing or create uncertainty?
- Does the combined dashboard make alternative exam systems sufficiently clear?
- Is the A&A table usable at realistic volume?
- Do warning and failure messages provide enough reassurance and direction?
- Which terms differ from the language staff already use?

## 9. Path from prototype to production

Once stakeholder testing confirms the workflow, the live-service project will need to define:

1. the authoritative data model for exams, people, roles, statuses and transitions;
2. authentication and role-based authorisation;
3. integration boundaries with OnDemand, SharePoint, scheduling, email and support systems;
4. audit history and ownership of each state change;
5. rules for automated versus manually confirmed transitions;
6. accessible components and supported-browser requirements;
7. automated validation, unit, integration and end-to-end testing;
8. hosting, security, monitoring, backups and operational support; and
9. migration of the validated wording and interaction model into reusable production components.

The most important principle is to carry the validated workflow forward without treating the prototype's static implementation as the production architecture. The prototype is evidence about user needs and task structure; the production system should implement that evidence securely and maintainably.

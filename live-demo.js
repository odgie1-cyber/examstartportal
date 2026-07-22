(function () {
    'use strict';

    var STORAGE_KEY = 'examstart-live-demo-v1';

    var DEFAULT_EXAM = {
        moduleCode: 'MATH1001',
        moduleTitle: 'Mathematics 1',
        lifecycleStatus: 'AWAITING_AUTHOR',
        qualityCheckResult: 'PENDING',
        tryoutResult: 'PENDING',
        authorName: 'Dr Alex Morgan',
        authorEmail: 'alex.morgan@soton.ac.uk',
        leadName: 'Dean Wall',
        leadEmail: 'dean.wall@soton.ac.uk',
        scheduleDate: '2026-08-08',
        scheduleTime: '09:00',
        scheduleDuration: '120',
        scheduleRooms: 'B58-R1043\nB58-R1047'
    };

    var STATUS = {
        NOT_STARTED: {
            label: 'Not Started',
            badgeClass: 'badge-not-started',
            heroClass: 'status-not-started',
            nextAction: 'The workflow has not begun',
            explanation: 'The exam record exists, but the preparation workflow has not begun.',
            stage: 0
        },
        AWAITING_AUTHOR: {
            label: 'Awaiting Author',
            badgeClass: 'badge-awaiting',
            heroClass: 'status-awaiting',
            nextAction: 'Add or configure questions and rubric',
            explanation: 'Your exam is ready for you to add questions and the marking rubric in OnDemand.',
            stage: 1
        },
        PUBLISHED_NEEDS_ATTENTION: {
            label: 'Published But Needs Attention',
            badgeClass: 'badge-attention',
            heroClass: 'status-attention',
            nextAction: 'Speak to iSolutions about the quality-check findings',
            explanation: 'Quality checks found something that must be discussed before the exam can continue.',
            stage: 2
        },
        PUBLISHED_AWAITING_CHECKS: {
            label: 'Published Awaiting Checks',
            badgeClass: 'badge-testing',
            heroClass: 'status-awaiting-checks',
            nextAction: 'Try out the exam and achieve 100%',
            explanation: 'The exam has been published and is ready for quality checks and an Author tryout.',
            stage: 3
        },
        PUBLISHED_PASSED_CHECKS: {
            label: 'Published Passed Checks',
            badgeClass: 'badge-ready',
            heroClass: 'status-passed',
            nextAction: 'The exam is ready to be scheduled',
            explanation: 'Quality checks and the required 100% tryout have passed. The exam is ready to be scheduled.',
            stage: 4
        },
        SCHEDULED: {
            label: 'Scheduled',
            badgeClass: 'badge-scheduled',
            heroClass: 'status-scheduled',
            nextAction: 'The exam arrangements have been confirmed',
            explanation: 'The exam has passed its checks and its date, time and room arrangements are confirmed.',
            stage: 5
        }
    };

    var RESULT = {
        quality: {
            PENDING: { label: 'Pending', badgeClass: 'audit-pending' },
            PASSED: { label: 'Pass', badgeClass: 'audit-pass' },
            FAILED: { label: 'Failed', badgeClass: 'audit-fail' }
        },
        tryout: {
            PENDING: { label: 'Pending', badgeClass: 'score-pending' },
            PASSED: { label: 'Pass - 100%', badgeClass: 'score-pass' },
            FAILED: { label: 'Attempted – No 100% Yet', badgeClass: 'score-fail' }
        }
    };

    var WORKSPACE_COPY = {
        AWAITING: {
            explanationPrefix: 'What this means:',
            explanation: 'We are waiting for you to tell us that your questions and rubric are ready to be published for initial testing. Get in touch when you are ready, or if you need a hand with anything.',
            createDescription: 'Open OnDemand using the link below and add your questions and rubric to the relevant folders.',
            qualityDescription: 'We check your exam against known best practices, and the results are shown here. We will contact you if we notice anything that needs your attention or if we make any changes.',
            qualityAction: 'Results of Quality Checks',
            tryoutDescription: 'Use this button to try out your exam. You should be able to score 100% on this version. If you do not, please let us know, and we can produce a breakdown report showing where things went wrong.',
            tryoutAction: 'Try Out Exam',
            leadHeading: '⚙️ iSolutions Member',
            leadIntroduction: 'This exam is being configured by',
            leadHelp: 'Need help or have a question? Get in touch.',
            leadAction: 'Email iSolutions Member',
            printHeading: '📄 Print Out Version of the Exam',
            printDescription: 'A full MS Word version with answers and a printable PDF version for a paper-and-pen sitting can be found here.',
            printAction: 'Go to SharePoint Folder',
            scheduleHeading: '📅 Live Schedule & Room Booking',
            scheduleUnavailable: 'No room bookings yet. They’ll appear once the exam is scheduled.',
            publicationWarning: false,
            resultsGuidance: false
        },
        FAILED: {
            explanationPrefix: 'Action paused:',
            explanation: 'Our checks found something we need to discuss with you before this exam can continue. You are not expected to resolve this without guidance.',
            qualityAction: 'Preview Quality Check Results',
            scheduleUnavailable: 'No seating or room data has been allocated. This data panel remains locked until the author completes all verification runs and final sign-off parameters are satisfied.',
            publicationWarning: false,
            resultsGuidance: false
        },
        TESTING: {
            explanationPrefix: 'What this means:',
            explanation: 'We have published your exam, and you will find a button below that allows you to attempt it. You should be able to score 100% on this version. If you do not, please let us know, and we can produce a breakdown report showing where things went wrong. Print versions of the exam are also available via the SharePoint button below.',
            qualityAction: 'Preview Results of Quality Checks',
            tryoutAction: 'Preview Try Out Exam',
            scheduleUnavailable: 'No seating or room data has been allocated. This data panel remains locked until the author completes all verification runs and final sign-off parameters are satisfied.',
            publicationWarning: true,
            resultsGuidance: false
        },
        READY: {
            explanationPrefix: 'What this means:',
            explanation: 'Your exam is ready to be scheduled. Please contact us if you make any changes.',
            createDescription: 'Your questions and rubric have been added to the relevant OnDemand folders.',
            qualityDescription: 'The technical and best-practice checks have been completed successfully.',
            qualityAction: 'Preview Quality Check Results',
            tryoutDescription: 'An author has completed the test run and achieved the required score of 100%.',
            tryoutAction: 'Preview Try Out Exam Again',
            leadHeading: 'iSolutions Lead',
            leadIntroduction: 'This exam is being configured by',
            leadHelp: 'Contact your lead if you make any changes or need help.',
            leadAction: 'Email iSolutions Lead',
            printHeading: 'Print versions',
            printDescription: 'Word and PDF versions of the exam are available in the SharePoint folder.',
            printAction: 'Open SharePoint Files',
            scheduleHeading: 'Schedule and room booking',
            scheduleUnavailable: 'This exam is ready to be scheduled. Date, time and room details will appear here once confirmed.',
            publicationWarning: true,
            resultsGuidance: false
        },
        SCHEDULED: {
            explanationPrefix: 'Workflow Complete:',
            explanation: 'This exam is approved and scheduled. Room bookings are listed below. Information about obtaining results can be found at the bottom of this page.',
            qualityAction: 'Results of Quality Checks',
            tryoutAction: 'Try Out Exam',
            publicationWarning: true,
            resultsGuidance: true
        }
    };

    function workspaceCopy(exam) {
        var base = WORKSPACE_COPY.AWAITING;
        var variant = {};
        if (exam.lifecycleStatus === 'PUBLISHED_NEEDS_ATTENTION') variant = WORKSPACE_COPY.FAILED;
        if (exam.lifecycleStatus === 'PUBLISHED_AWAITING_CHECKS') variant = WORKSPACE_COPY.TESTING;
        if (exam.lifecycleStatus === 'PUBLISHED_PASSED_CHECKS') variant = WORKSPACE_COPY.READY;
        if (exam.lifecycleStatus === 'SCHEDULED') variant = WORKSPACE_COPY.SCHEDULED;
        return Object.assign({}, base, variant);
    }

    function readExam() {
        try {
            var saved = window.localStorage.getItem(STORAGE_KEY);
            if (!saved) return Object.assign({}, DEFAULT_EXAM);
            return Object.assign({}, DEFAULT_EXAM, JSON.parse(saved));
        } catch (error) {
            return Object.assign({}, DEFAULT_EXAM);
        }
    }

    function writeExam(exam) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exam));
        window.dispatchEvent(new CustomEvent('examstart-demo-updated', { detail: exam }));
    }

    function resetExam() {
        window.localStorage.removeItem(STORAGE_KEY);
        var exam = Object.assign({}, DEFAULT_EXAM);
        window.dispatchEvent(new CustomEvent('examstart-demo-updated', { detail: exam }));
        return exam;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        var element = byId(id);
        if (element) element.textContent = value;
    }

    function setBadge(id, result, prefix) {
        var element = byId(id);
        if (!element || !result) return;
        element.className = result.badgeClass;
        element.textContent = (prefix || '') + result.label;
    }

    function setStatusBadge(containerId, labelId, status) {
        var badge = byId(containerId);
        if (!badge) return;
        badge.className = 'badge ' + status.badgeClass;
        setText(labelId, status.label);
    }

    function renderDashboard(exam) {
        var status = STATUS[exam.lifecycleStatus] || STATUS.AWAITING_AUTHOR;
        var examIsVisible = exam.lifecycleStatus !== 'NOT_STARTED';
        var table = byId('dashboard-exams-table');
        var emptyState = byId('demo-dashboard-empty');
        if (table) table.hidden = !examIsVisible;
        if (emptyState) emptyState.hidden = examIsVisible;
        setText('demo-dashboard-author', firstName(exam.authorName) + "'s");
        setText('demo-dashboard-code', exam.moduleCode);
        setText('demo-dashboard-title', exam.moduleTitle);
        setText('demo-dashboard-status', status.label);
        setText('demo-dashboard-action', nextAction(exam, status));
        setText('demo-dashboard-author-full', exam.authorName);
        setText('demo-dashboard-lead', exam.leadName);
        setStatusBadge('demo-dashboard-badge', 'demo-dashboard-status', status);
        setBadge('demo-dashboard-quality', RESULT.quality[exam.qualityCheckResult]);
        setBadge('demo-dashboard-tryout', RESULT.tryout[exam.tryoutResult]);
        var sharePoint = byId('demo-dashboard-sharepoint');
        if (sharePoint) {
            var safeCode = exam.moduleCode.toLowerCase().replace(/[^a-z0-9-]/g, '');
            sharePoint.href = 'https://soton.sharepoint.com/' + safeCode;
            sharePoint.textContent = 'Open ' + exam.moduleCode + ' SharePoint files';
        }
        document.title = exam.moduleCode + ' - ExamStart Author Dashboard';
    }

    function firstName(fullName) {
        var parts = String(fullName || 'Your').trim().split(/\s+/);
        if (parts.length > 1 && /^(dr|prof|professor|mr|mrs|ms|miss)\.?$/i.test(parts[0])) return parts[1];
        return parts[0] || 'Your';
    }

    function nextAction(exam, status) {
        if (exam.lifecycleStatus === 'PUBLISHED_AWAITING_CHECKS' && exam.tryoutResult === 'FAILED') {
            return 'Try Out Exam Again or Ask for Results';
        }
        return status.nextAction;
    }

    function setCardState(cardId, stateId, state, label) {
        var card = byId(cardId);
        var stateLabel = byId(stateId);
        if (!card) return;
        card.classList.remove('card-disabled', 'card-active-focus', 'audit-conversation-card');
        if (state === 'disabled') card.classList.add('card-disabled');
        if (state === 'active') card.classList.add('card-active-focus');
        if (state === 'attention') card.classList.add('audit-conversation-card');
        if (stateLabel) {
            stateLabel.className = 'live-demo-step-state live-demo-step-' + state;
            stateLabel.textContent = label;
        }
    }

    function setButtonState(id, enabled, previewMessage) {
        var button = byId(id);
        if (!button) return;
        button.disabled = !enabled;
        button.className = enabled ? 'btn btn-teal' : 'btn btn-disabled';
        button.onclick = enabled ? function () { window.alert(previewMessage); } : null;
    }

    function setLinkState(id, enabled) {
        var link = byId(id);
        if (!link) return;
        if (!link.dataset.destination) link.dataset.destination = link.getAttribute('href') || '';
        if (enabled) {
            link.setAttribute('href', link.dataset.destination);
            link.className = 'btn btn-teal';
            link.removeAttribute('aria-disabled');
            link.removeAttribute('tabindex');
        } else {
            link.removeAttribute('href');
            link.className = 'btn btn-disabled';
            link.setAttribute('aria-disabled', 'true');
            link.setAttribute('tabindex', '-1');
        }
    }

    function qualityMessage(result) {
        if (result === 'PASSED') return 'Quality checks passed.';
        if (result === 'FAILED') return 'Quality checks found issues that require attention.';
        return 'Quality checks are pending.';
    }

    function tryoutMessage(result) {
        if (result === 'PASSED') return 'Tryout passed: an author has scored 100%.';
        if (result === 'FAILED') return 'A tryout was attempted, but no one has achieved 100% yet.';
        return 'Pending: No one has attempted a tryout yet.';
    }

    function renderWorkspace(exam) {
        var status = STATUS[exam.lifecycleStatus] || STATUS.AWAITING_AUTHOR;
        var copy = workspaceCopy(exam);
        var stage = status.stage;
        setText('demo-workspace-code', exam.moduleCode);
        setText('demo-workspace-title', exam.moduleTitle);
        setText('demo-workspace-status', status.label);
        setText('demo-workspace-explanation-prefix', copy.explanationPrefix);
        setText('demo-workspace-explanation', copy.explanation);
        setText('demo-create-description', copy.createDescription);
        setText('demo-quality-description', copy.qualityDescription);
        setText('demo-tryout-description', copy.tryoutDescription);
        setText('demo-lead-heading', copy.leadHeading);
        setText('demo-lead-introduction', copy.leadIntroduction);
        setText('demo-lead-help', copy.leadHelp);
        setText('demo-print-heading', copy.printHeading);
        setText('demo-print-description', copy.printDescription);
        setText('demo-print-action', copy.printAction);
        setText('demo-schedule-heading', copy.scheduleHeading);
        setText('demo-schedule-unavailable', copy.scheduleUnavailable);
        setText('demo-lead-name', exam.leadName);
        document.title = exam.moduleCode + ' - ' + status.label;

        var hero = byId('demo-workspace-hero');
        hero.className = 'status-hero ' + status.heroClass;
        byId('demo-publication-warning').hidden = !copy.publicationWarning;
        byId('demo-results-guidance').hidden = !copy.resultsGuidance;
        byId('demo-attention-callout').hidden = exam.lifecycleStatus !== 'PUBLISHED_NEEDS_ATTENTION';

        setBadge('demo-workspace-quality', RESULT.quality[exam.qualityCheckResult], 'Quality Checks: ');
        setBadge('demo-workspace-tryout', RESULT.tryout[exam.tryoutResult], 'Tryout: ');

        var createState = stage === 1 ? 'active' : 'complete';
        setCardState('demo-step-create', 'demo-step-create-state', createState,
            stage === 1 ? 'Current step' : 'Available');
        setLinkState('demo-ondemand-action', true);
        byId('demo-create-next').hidden = createState !== 'active';

        var qualityEnabled = stage >= 2;
        var qualityState = !qualityEnabled ? 'disabled' : exam.lifecycleStatus === 'PUBLISHED_NEEDS_ATTENTION' ? 'attention' : stage === 3 && exam.qualityCheckResult !== 'PASSED' ? 'active' : 'complete';
        setCardState('demo-step-quality', 'demo-step-quality-state', qualityState,
            !qualityEnabled ? 'Unavailable' : qualityState === 'attention' ? 'Needs attention' : qualityState === 'active' ? 'In progress' : 'Available');
        setButtonState('demo-quality-action', qualityEnabled,
            'Demo only: the live service will open the quality-check results for ' + exam.moduleCode + '.');
        setText('demo-quality-action', copy.qualityAction);
        byId('demo-quality-next').hidden = qualityState !== 'active';
        renderQualityPresentation(exam, qualityEnabled);

        var tryoutEnabled = stage >= 3;
        var tryoutState = !tryoutEnabled ? 'disabled' : stage === 3 ? 'active' : 'complete';
        setCardState('demo-step-tryout', 'demo-step-tryout-state', tryoutState,
            !tryoutEnabled ? 'Unavailable' : tryoutState === 'active' ? 'Current step' : 'Available');
        setButtonState('demo-tryout-action', tryoutEnabled,
            'Demo only: the live service will launch the secure tryout for ' + exam.moduleCode + '.');
        setText('demo-tryout-action', copy.tryoutAction);
        byId('demo-tryout-next').hidden = tryoutState !== 'active';
        renderTryoutPresentation(exam, tryoutEnabled, tryoutState, copy);

        setMailLink('demo-lead-email', exam.leadEmail, copy.leadAction);
        setMailLink('demo-attention-email', exam.leadEmail, 'Email iSolutions lead', exam.moduleCode + ' quality-check findings');
        setMailLink('demo-quality-contact', exam.leadEmail, 'Contact Technical Lead', exam.moduleCode + ' quality-check findings');
        setMailLink('demo-tryout-results-email', exam.leadEmail, 'Ask for Tryout Results', exam.moduleCode + ' tryout results');
        renderSchedule(exam, stage === 5);
    }

    function renderQualityPresentation(exam, qualityEnabled) {
        var element = byId('demo-quality-result');
        var heading = byId('demo-quality-result-heading');
        var message = byId('demo-quality-result-message');
        var contact = byId('demo-quality-contact');
        var lifecycle = exam.lifecycleStatus;
        var result = exam.qualityCheckResult;
        var isAttention = lifecycle === 'PUBLISHED_NEEDS_ATTENTION';
        var showResult = qualityEnabled;

        element.hidden = !showResult;
        contact.hidden = !isAttention;
        heading.hidden = true;
        heading.textContent = '';
        message.textContent = '';
        if (!showResult) return;

        if (isAttention) {
            element.className = 'audit-fail live-demo-card-result-pill';
            message.textContent = '⚠ Quality Checks: Failed';
        } else if (result === 'PASSED') {
            element.className = 'audit-pass live-demo-card-result-pill';
            message.textContent = '✓ Quality Checks: Pass';
        } else if (result === 'FAILED') {
            element.className = 'audit-fail live-demo-card-result-pill';
            message.textContent = '⚠ Quality Checks: Failed';
        } else {
            element.className = 'alert-badge tryout-result tryout-result-pending';
            message.textContent = qualityMessage(result);
        }
    }

    function setResultMessageClass(id, result) {
        var element = byId(id);
        if (!element) return;
        var suffix = result === 'PASSED' ? 'pass' : result === 'FAILED' ? 'fail' : 'pending';
        element.className = 'alert-badge tryout-result tryout-result-' + suffix;
    }

    function renderTryoutPresentation(exam, tryoutEnabled, tryoutState, copy) {
        var failed = tryoutEnabled && exam.tryoutResult === 'FAILED';
        var heading = byId('demo-tryout-result-heading');
        var message = byId('demo-tryout-result-message');
        var button = byId('demo-tryout-action');
        var resultsEmail = byId('demo-tryout-results-email');
        var nextMarker = byId('demo-tryout-next');
        var card = byId('demo-step-tryout');
        var resultBlock = byId('demo-tryout-result');
        var actions = byId('demo-tryout-actions');

        setResultMessageClass('demo-tryout-result', tryoutEnabled ? exam.tryoutResult : 'PENDING');
        heading.hidden = !failed;
        heading.textContent = failed ? 'Tryout not yet passed:' : '';
        message.textContent = failed
            ? 'One or more attempts have been made, but no one has scored 100% yet. You can try again or ask us for the results.'
            : tryoutMessage(tryoutEnabled ? exam.tryoutResult : 'PENDING');
        button.textContent = failed ? 'Preview Try Out Exam Again' : copy.tryoutAction;
        resultsEmail.hidden = !failed;
        nextMarker.hidden = tryoutState !== 'active';
        nextMarker.textContent = failed ? 'Action Needed' : 'Next Action';
        if (card && typeof card.insertBefore === 'function') {
            if (failed) card.insertBefore(resultBlock, actions);
            else card.insertBefore(actions, resultBlock);
        }
    }

    function setMailLink(id, email, label, subject) {
        var link = byId(id);
        if (!link) return;
        var href = 'mailto:' + encodeURIComponent(email || '');
        if (subject) href += '?subject=' + encodeURIComponent(subject);
        link.href = href;
        link.textContent = label;
    }

    function renderSchedule(exam, isScheduled) {
        var panel = byId('demo-schedule-panel');
        var unavailable = byId('demo-schedule-unavailable');
        var details = byId('demo-schedule-details');
        panel.classList.toggle('card-disabled', !isScheduled);
        panel.classList.toggle('live-demo-schedule-confirmed', isScheduled);
        unavailable.hidden = isScheduled;
        details.hidden = !isScheduled;
        if (!isScheduled) return;

        setText('demo-schedule-date', formatDate(exam.scheduleDate) || 'To be confirmed');
        setText('demo-schedule-time', exam.scheduleTime || 'To be confirmed');
        setText('demo-schedule-duration', exam.scheduleDuration ? exam.scheduleDuration + ' minutes' : 'To be confirmed');
        var rooms = String(exam.scheduleRooms || '').split(/\r?\n/).map(function (room) { return room.trim(); }).filter(Boolean);
        setText('demo-schedule-rooms', rooms.length ? rooms.join(', ') : 'To be confirmed');
    }

    function formatDate(value) {
        if (!value) return '';
        var parts = value.split('-');
        if (parts.length !== 3) return value;
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    function populateAdminForm(exam) {
        var form = byId('demo-admin-form');
        if (!form) return;
        Object.keys(DEFAULT_EXAM).forEach(function (key) {
            if (form.elements[key]) form.elements[key].value = exam[key] || '';
        });
        renderAdminPreview(exam);
    }

    function renderAdminPreview(exam) {
        var status = STATUS[exam.lifecycleStatus] || STATUS.AWAITING_AUTHOR;
        setText('demo-admin-preview-code', exam.moduleCode);
        setText('demo-admin-preview-title', exam.moduleTitle);
        setText('demo-admin-preview-status', status.label);
        setText('demo-admin-preview-author', exam.authorName);
        setText('demo-admin-preview-lead', exam.leadName);
        setText('demo-admin-preview-action', nextAction(exam, status));
        setStatusBadge('demo-admin-preview-badge', 'demo-admin-preview-status', status);
    }

    function readAdminForm(form) {
        var exam = {};
        Object.keys(DEFAULT_EXAM).forEach(function (key) {
            exam[key] = String(form.elements[key].value || '').trim();
        });
        exam.moduleCode = exam.moduleCode.toUpperCase();
        return exam;
    }

    function initialiseAdmin() {
        var form = byId('demo-admin-form');
        var resetButton = byId('demo-admin-reset');
        var message = byId('demo-admin-message');
        populateAdminForm(readExam());

        form.addEventListener('input', function () {
            renderAdminPreview(readAdminForm(form));
            message.textContent = 'Unsaved changes';
            message.className = 'live-demo-save-message live-demo-message-unsaved';
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            var exam = readAdminForm(form);
            writeExam(exam);
            populateAdminForm(exam);
            message.textContent = 'Saved. The Author view has been updated.';
            message.className = 'live-demo-save-message live-demo-message-saved';
        });

        resetButton.addEventListener('click', function () {
            if (!window.confirm('Reset MATH1001 and all demo fields to their original values?')) return;
            var exam = resetExam();
            populateAdminForm(exam);
            message.textContent = 'Demo reset to the original MATH1001 values.';
            message.className = 'live-demo-save-message live-demo-message-saved';
        });
    }

    function renderCurrentPage(exam) {
        var page = document.body.getAttribute('data-live-demo-page');
        if (page === 'dashboard') renderDashboard(exam);
        if (page === 'workspace') renderWorkspace(exam);
        if (page === 'admin') renderAdminPreview(exam);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var page = document.body.getAttribute('data-live-demo-page');
        if (!page) return;
        if (page === 'admin') initialiseAdmin();
        else renderCurrentPage(readExam());
    });

    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY) renderCurrentPage(readExam());
    });

    window.addEventListener('examstart-demo-updated', function (event) {
        renderCurrentPage(event.detail || readExam());
    });
}());

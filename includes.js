document.addEventListener('DOMContentLoaded', function () {
    var headerMarkup = '<div class="header-bar">' +
        '<div class="brand-title">ExamStart <span style="font-weight:300; font-size:14px;">University of Southampton</span></div>' +
        '</div>' +
        '<div class="nav-links">' +
        '<a href="dashboard.html">Dashboard</a>' +
        '<a href="#">Session Search</a>' +
        '<a href="#">Help</a>' +
        '</div>';

    var footerMarkup = '<div class="footer-bar">' +
        '<a href="#">Accessibility statement</a>' +
        '<a href="#">Freedom of information</a>' +
        '<a href="#">University Contacts</a>' +
        '<a href="#">IT Help</a>' +
        '<a href="dashboard-with-warning.html" class="demo-warning-switch" hidden>Show warning</a>' +
        '<a href="non-ondemand-dashboard.html" class="demo-workflow-switch">Demo Non-OnDemand exams</a>' +
        '<a href="aa-dashboard.html" class="demo-role-switch">Switch to A&amp;A</a>' +
        '</div>';

    function configureDemoRoleSwitch(container) {
        var roleSwitch = container.querySelector('.demo-role-switch');
        var warningSwitch = container.querySelector('.demo-warning-switch');
        var workflowSwitch = container.querySelector('.demo-workflow-switch');
        if (!roleSwitch) return;

        var currentPage = window.location.pathname.split('/').pop().toLowerCase();
        if (currentPage === 'aa-dashboard.html') {
            roleSwitch.href = 'dashboard.html';
            roleSwitch.textContent = 'Switch to Author';
        }

        var isNonOnDemandView = currentPage === 'non-ondemand-dashboard.html' ||
            currentPage.indexOf('workspace-non-ondemand') === 0;
        if (workflowSwitch && isNonOnDemandView) {
            workflowSwitch.href = 'dashboard.html';
            workflowSwitch.textContent = 'Return to combined Author view';
        }

        if (warningSwitch && currentPage === 'dashboard.html') {
            warningSwitch.hidden = false;
        } else if (warningSwitch && currentPage === 'dashboard-with-warning.html') {
            warningSwitch.href = 'dashboard.html';
            warningSwitch.textContent = 'Hide warning';
            warningSwitch.hidden = false;
        }
    }

    function setMarkup(el, html, selector) {
        el.innerHTML = html;
        if (selector === '#site-footer') configureDemoRoleSwitch(el);
    }

    function load(selector, url, fallbackMarkup) {
        var el = document.querySelector(selector);
        if (!el) return;

        if (window.location.protocol === 'file:') {
            setMarkup(el, fallbackMarkup, selector);
            return;
        }

        fetch(url).then(function (resp) {
            if (!resp.ok) throw new Error('Network error');
            return resp.text();
        }).then(function (html) {
            setMarkup(el, html, selector);
        }).catch(function () {
            setMarkup(el, fallbackMarkup, selector);
        });
    }

    load('#site-header', 'header.html', headerMarkup);
    load('#site-footer', 'footer.html', footerMarkup);
});

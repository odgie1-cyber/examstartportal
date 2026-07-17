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
        '<a href="#">Accessibility statement</a> | <a href="#">Freedom of information</a> | <a href="#">University Contacts</a> | <a href="#">IT Help</a>' +
        '</div>';

    function load(selector, url, fallbackMarkup) {
        var el = document.querySelector(selector);
        if (!el) return;

        if (window.location.protocol === 'file:') {
            el.innerHTML = fallbackMarkup;
            return;
        }

        fetch(url).then(function (resp) {
            if (!resp.ok) throw new Error('Network error');
            return resp.text();
        }).then(function (html) {
            el.innerHTML = html;
        }).catch(function () {
            el.innerHTML = fallbackMarkup;
        });
    }

    load('#site-header', 'header.html', headerMarkup);
    load('#site-footer', 'footer.html', footerMarkup);
});

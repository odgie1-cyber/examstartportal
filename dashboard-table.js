document.addEventListener('DOMContentLoaded', function () {
    var tables = document.querySelectorAll('[data-dashboard-table]');

    tables.forEach(function (table) {
        var tbody = table.tBodies[0];
        if (!tbody) return;

        var rows = Array.prototype.slice.call(tbody.rows);
        var content = table.closest('.dashboard-content');
        var filter = content ? content.querySelector('[data-table-filter]') : null;
        var count = content ? content.querySelector('[data-table-count]') : null;
        var emptyMessage = document.createElement('p');
        var activeColumn = -1;
        var activeDirection = 'ascending';

        emptyMessage.className = 'dashboard-table-empty';
        emptyMessage.textContent = 'No exams match your search.';
        emptyMessage.hidden = true;
        table.insertAdjacentElement('afterend', emptyMessage);

        function updateFilter() {
            var query = filter ? filter.value.trim().toLocaleLowerCase() : '';
            var visibleCount = 0;

            rows.forEach(function (row) {
                var matches = !query || row.textContent.toLocaleLowerCase().indexOf(query) !== -1;
                row.hidden = !matches;
                if (matches) visibleCount += 1;
            });

            if (count) {
                count.textContent = visibleCount === rows.length
                    ? rows.length + ' exams'
                    : visibleCount + ' of ' + rows.length + ' exams';
            }
            emptyMessage.hidden = visibleCount !== 0;
        }

        Array.prototype.forEach.call(table.tHead.rows[0].cells, function (heading, columnIndex) {
            var label = heading.textContent.trim();
            var button = document.createElement('button');

            button.type = 'button';
            button.className = 'dashboard-sort-button';
            button.textContent = label;
            button.setAttribute('aria-label', 'Sort by ' + label);
            heading.textContent = '';
            heading.appendChild(button);
            heading.setAttribute('aria-sort', 'none');

            button.addEventListener('click', function () {
                var direction = activeColumn === columnIndex && activeDirection === 'ascending'
                    ? 'descending'
                    : 'ascending';

                rows.sort(function (firstRow, secondRow) {
                    var firstValue = firstRow.cells[columnIndex].textContent.trim();
                    var secondValue = secondRow.cells[columnIndex].textContent.trim();
                    var comparison = firstValue.localeCompare(secondValue, 'en-GB', {
                        numeric: true,
                        sensitivity: 'base'
                    });
                    return direction === 'ascending' ? comparison : -comparison;
                });

                rows.forEach(function (row) {
                    tbody.appendChild(row);
                });

                Array.prototype.forEach.call(table.tHead.rows[0].cells, function (otherHeading) {
                    otherHeading.setAttribute('aria-sort', 'none');
                });
                heading.setAttribute('aria-sort', direction);
                activeColumn = columnIndex;
                activeDirection = direction;
            });
        });

        if (filter) filter.addEventListener('input', updateFilter);
        updateFilter();
    });
});

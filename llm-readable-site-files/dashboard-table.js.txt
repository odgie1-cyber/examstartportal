document.addEventListener('DOMContentLoaded', function () {
    var tables = document.querySelectorAll('[data-dashboard-table]');

    tables.forEach(function (table) {
        var tbody = table.tBodies[0];
        if (!tbody) return;

        var headingRow = table.tHead && table.tHead.rows[0];
        if (!headingRow) return;

        var leadColumnIndex = -1;
        Array.prototype.forEach.call(headingRow.cells, function (heading, index) {
            if (heading.textContent.trim() === 'iSolutions Lead') leadColumnIndex = index;
        });
        if (leadColumnIndex !== -1) {
            Array.prototype.forEach.call(tbody.rows, function (row) {
                if (row.cells[leadColumnIndex]) row.deleteCell(leadColumnIndex);
            });
            headingRow.deleteCell(leadColumnIndex);
        }

        var systemHeading = document.createElement('th');
        systemHeading.className = 'col-system';
        systemHeading.textContent = 'Exam System';
        headingRow.insertBefore(systemHeading, headingRow.cells[1]);

        Array.prototype.forEach.call(tbody.rows, function (row) {
            var examCell = row.cells[0];
            var systemName = 'OnDemand';
            var metadata = examCell.querySelectorAll('.dashboard-exam-meta');

            Array.prototype.forEach.call(metadata, function (item) {
                var match = item.textContent.trim().match(/^Exam system:\s*(.+)$/i);
                if (match) {
                    systemName = match[1];
                    item.remove();
                }
            });

            var systemCell = document.createElement('td');
            systemCell.textContent = systemName;
            row.insertBefore(systemCell, row.cells[1]);
        });

        var headingLabels = Array.prototype.map.call(headingRow.cells, function (heading) {
            return heading.textContent.trim();
        });
        Array.prototype.forEach.call(tbody.rows, function (row) {
            Array.prototype.forEach.call(row.cells, function (cell, index) {
                cell.setAttribute('data-label', headingLabels[index]);
            });
        });

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

        Array.prototype.forEach.call(headingRow.cells, function (heading, columnIndex) {
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

                Array.prototype.forEach.call(headingRow.cells, function (otherHeading) {
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

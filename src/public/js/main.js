document.addEventListener('DOMContentLoaded', function () {
    loadTableData();

    document.getElementById('homeForm').addEventListener('submit', function (event) {
        event.preventDefault();
        redirectTo('/event');
    });

    document.getElementById('profileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        redirectTo('/profile');
    });

    document.getElementById('selectServiceForm').addEventListener('submit', function (event) {
        event.preventDefault();
        redirectTo('/selectService');
    });

    document.getElementById('logoutForm').addEventListener('submit', function (event) {
        event.preventDefault();
        redirectTo('/logout');
    });
});

function loadTableData() {
    // Show the loading spinner
    document.getElementById("loading-spinner").style.display = "flex";

    // Make an AJAX POST request to fetch event data
    fetch('/event/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Add any necessary data here
    })
        .then(response => response.json())
        .then(data => {
            displayData(data);
        })
        .catch(error => {
            console.error('Error fetching event data:', error);
            document.getElementById("loading-spinner").style.display = "none";
        });
}

function displayData(data) {
    var container = document.getElementById("table-container");
    container.innerHTML = ""; // Clear any existing content

    // Hide the loading spinner
    document.getElementById("loading-spinner").style.display = "none";

    // Iterate over each category
    Object.entries(data).forEach(([category, events]) => {
        // Create a new section for each category
        var section = document.createElement("section");
        section.id = "section-" + category;
        var heading = document.createElement("h2");
        heading.textContent = category;
        section.appendChild(heading);
        container.appendChild(section);

        // Create a table for the events in the category
        var tableContainer = document.createElement("div");
        tableContainer.classList.add("table-scroll-container");

        var table = document.createElement("table");
        table.classList.add("table-scroll");

        // Create table header
        var thead = document.createElement("thead");
        var headerRow = document.createElement("tr");
        var headers = ["活動名稱", "活動支援時間", "工作地點(校區/地點)", "工作時數(時)", "人數需求上限(人)", "目前餘額", "備註說明"];

        headers.forEach(function (header) {
            var th = document.createElement("th");
            th.scope = "col";
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        var tbody = document.createElement("tbody");

        // Iterate over each event in the category
        Object.entries(events).forEach(([eventName, details]) => {
            var row = document.createElement("tr");

            // Insert event details into the row
            var eventCell = document.createElement("th");
            eventCell.scope = "row";
            eventCell.textContent = eventName;
            row.appendChild(eventCell);

            var fields = ["活動支援時間", "工作地點(校區/地點)", "工作時數(時)", "人數需求上限(人)", "目前餘額", "備註說明"];
            fields.forEach(function (field) {
                var cell = document.createElement("td");
                cell.textContent = details[field] || ""; // Handle missing fields
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);

        // Add table to the container and then to the section
        tableContainer.appendChild(table);
        section.appendChild(tableContainer);
    });
}

function redirectTo(url) {
    window.location.href = `${url}`;
}
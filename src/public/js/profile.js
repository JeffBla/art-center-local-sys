document.addEventListener("DOMContentLoaded", function () {
    getPersonalInfo();
    LoadSelectedEvent();
});

function getPersonalInfo() {
    fetch('/user/info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(personalInfo => {
            document.getElementById("username").innerText = personalInfo.username;
            document.getElementById("username-span").innerText = personalInfo.username;
            document.getElementById("student-id-span").innerText = personalInfo.studentID;
            document.getElementById("email-span").innerText = personalInfo.email;
            document.getElementById("phone-span").innerText = personalInfo.phone;
        })
        .catch(error => {
            console.error('Error fetching personal info:', error);
        });
}

function LoadSelectedEvent() {
    let loading = document.getElementById("popping-loading");
    let emptyEvent = document.getElementById("empty-event");

    // Show the loading spinner
    loading.style.display = "block";

    fetch('/user/event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(eventsDetails => {
            // Check if the events are empty
            if (eventsDetails.length === 0) {
                emptyEvent.style.display = "block";
                emptyEvent.textContent = "沒有紀錄";
            } else {
                emptyEvent.style.display = "none";
                writeTableContent(eventsDetails);
            }

            // Hide the loading spinner after data is loaded
            loading.style.display = "none";
        })
        .catch(error => {
            console.error('Error loading events:', error);
            loading.style.display = "none";
        });
}

function writeTableContent(eventsDetails) {
    console.log(eventsDetails);
    defaultNote = "無";
    eventsDetails.forEach(event => {
        appendEventRow(event["活動名稱-內容"], event["支援時間(日期-星期-24小時制)"], event["工作地點(校區-地點)"], event["工作時數(時)"], event["備註說明"] || defaultNote);
    });
}

function appendEventRow(eventname, time, place, hours, note) {
    // Get the table element
    let table = document.getElementById("my-service");

    // Create a new row
    let newRow = table.insertRow();

    // Create and append cells to the new row
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    let cell4 = newRow.insertCell(3);
    let cell5 = newRow.insertCell(4);
    let cell6 = newRow.insertCell(5); // New cell for the cancel button

    // Add content to each cell
    cell1.innerHTML = eventname;
    cell2.innerHTML = time;
    cell3.innerHTML = place;
    cell4.innerHTML = hours;
    cell5.innerHTML = note;

    // Add cancel button to the new cell
    let cancelButton = document.createElement("button");
    cancelButton.innerHTML = "放棄選擇此活動";
    cancelButton.onclick = function () {
        cancelEvent(eventname, newRow);
    };
    cell6.appendChild(cancelButton);
}

function cancelEvent(eventname, row) {
    // Remove the row from the table
    row.parentNode.removeChild(row);

    $.ajax({
        url: '/event/cancel-event',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({eventName: eventname}),
        success: function (response) {
            console.log(response);
        }, error: function (error) {
            console.error('Error cancelling event:', error);
        }
    });
}
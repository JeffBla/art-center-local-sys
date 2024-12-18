function LoadSelectBoxOption() {
    // Show the loading spinner
    document.getElementById("loading-spinner").style.display = "flex";

    console.log("Loading selection data...");
    // Call the Apps Script function to get the data
    google.script.run.withSuccessHandler(generateSelectBox).getEventSheetData();

    console.log("Complete Loading data...");
}

function generateSelectBox(data) {
    // Hide the loading spinner
    document.getElementById("loading-spinner").style.display = "none";

    // Create the select element
    const select = document.createElement("select");
    select.id = "selectbox";
    select.setAttribute("data-selected", "");
    select.name = "event";

    // Add the default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.textContent = "選擇一個活動";
    select.appendChild(defaultOption);

    // Create optgroups and options
    for (const [category, events] of Object.entries(data)) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category;

        for (const [eventName, eventDetails] of Object.entries(events)) {
            const option = document.createElement("option");
            option.value = eventName;
            option.textContent = eventName;
            optgroup.appendChild(option);
        }

        select.appendChild(optgroup);
    }
    // Insert the select element into the DOM
    const container = document.getElementById("selectbox-container");
    container.innerHTML = ""; // Clear any existing content
    container.appendChild(select);

    // Add event listener to the newly created select element
    select.addEventListener("change", handleSelectChange);

    SetDisabledOptions(data);
}

function handleSelectChange() {
    const selectedValue = this.value;
    const infoDiv = document.querySelector(".info");
    const loader = infoDiv.querySelector(".loader");
    const noSelection = infoDiv.querySelector(".no-selection");
    const eventInfo = infoDiv.querySelector(".event-info");

    // Set the data-selected attribute to the selected event value
    this.setAttribute("data-selected", selectedValue);
    console.log("Selected event: " + selectedValue);

    // Display loading animation
    infoDiv.classList.add("loading");
    noSelection.style.display = "none";
    eventInfo.style.display = "none";

    // Simulate fetching event details (replace with real data fetching logic if needed)
    setTimeout(() => {
        // Hide loading animation
        infoDiv.classList.remove("loading");

        google.script.run.withSuccessHandler(setInfo).getEventInfo(selectedValue);
    }, 3000); // Simulate a delay of 3 seconds
}

// Enable all first, then disable the required
function DisableSelectBoxOption(disabledValues) {
    // Enable all options first
    let options = document.getElementById("selectbox").options;
    for (let i = 0; i < options.length; i++) {
        options[i].disabled = false;
    }
    // Loop through the values and disable the corresponding options
    disabledValues.forEach(function (value) {
        let optionToDisable = document.querySelector("#selectbox option[value='" + value + "']");
        if (optionToDisable) {
            optionToDisable.disabled = true;
        }
    });
}

function setInfo(eventInfos) {
    let eventNames = document.getElementById("event-name");
    let eventTime = document.getElementById("event-time");
    let eventPlace = document.getElementById("event-place");
    let eventHours = document.getElementById("event-hours");
    let eventNote = document.getElementById("event-note");
    const infoDiv = document.querySelector(".info");
    const eventInfo = infoDiv.querySelector(".event-info");

    eventNames.textContent = "活動名稱: " + eventInfos[0];
    eventTime.textContent = "活動時間: " + eventInfos[1];
    eventPlace.textContent = "活動地點: " + eventInfos[2];
    eventHours.textContent = "活動時數: " + eventInfos[3];
    eventNote.textContent = "備註: " + eventInfos[4];

    // Show the event info
    eventInfo.style.display = "block";
}

function clearInfo() {
    let eventNames = document.getElementById("event-name");
    let eventTime = document.getElementById("event-time");
    let eventPlace = document.getElementById("event-place");
    let eventHours = document.getElementById("event-hours");
    let eventNote = document.getElementById("event-note");
    const infoDiv = document.querySelector(".info");
    const eventInfo = infoDiv.querySelector(".event-info");

    eventNames.textContent = "";
    eventTime.textContent = "";
    eventPlace.textContent = "";
    eventHours.textContent = "";
    eventNote.textContent = "";

    // Hide the event info
    eventInfo.style.display = "none";
}

function confirmSelection() {
    // Disable the confirm button to prevent multiple clicks
    document.getElementById("confirm-btn").disabled = true;

    event.preventDefault();
    const selectedValue = document.getElementById("selectbox").value;
    const username = document.getElementById("username").innerHTML;

    // Call the Google Apps Script function to handle the event
    if (selectedValue) {
        google.script.run
            .withSuccessHandler(onEvnetConfirmSuccess) // Callback for success
            .withFailureHandler(onEvnetConfirmFailure) // Callback for failure
            .eventConfirmClicked(username, selectedValue);
    } else {
        alert("Please select an event!");
        document.getElementById("confirm-btn").disabled = false;
    }

    fetchDisabledOptions();
}

// Success handler after data is written to the sheet
function onEvnetConfirmSuccess(result) {
    if (result == true) {
        alert("Event selection confirmed!");
    } else {
        alert("Event selection failed! Please try again.");
    }
    document.getElementById("confirm-btn").disabled = false;
    clearInfo();
    LoadSelectBoxOption();
}

// Failure handler in case something goes wrong
function onEvnetConfirmFailure(error) {
    alert("Error: " + error);
    document.getElementById("confirm-btn").disabled = false;
}

function fetchDisabledOptions() {
    // Call Google Apps Script function
    google.script.run.withSuccessHandler(DisableSelectBoxOption).getDisabledOptions();
}

function SetDisabledOptions(data) {
    let disabledValues = [];
    for (const [category, events] of Object.entries(data)) {
        for (const [eventName, eventDetails] of Object.entries(events)) {
            if (eventDetails["目前餘額"] <= 0) {
                disabledValues.push(eventName);
            }
        }
    }
    DisableSelectBoxOption(disabledValues);
}

/**************************** Main **********************************/
document.getElementById("confirm-btn").addEventListener("click", confirmSelection);

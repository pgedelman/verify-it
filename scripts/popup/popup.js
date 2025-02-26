// Get the container element and attach a shadow root
const popupContainer = document.getElementById("verifyit-popup-container");
const shadow = popupContainer.attachShadow({ mode: "open" });

// Inject the popup's styles and markup into the shadow DOM
shadow.innerHTML = `
  <style>
    /* Popup styling: fully isolated in the Shadow DOM */
    body {
      margin: 0 !important;
      font-family: Arial, sans-serif;
      background: #f0f0f0;
    }

    #popup {
      width: 320px;
      background: linear-gradient(135deg, #ffffff, #e9e9e9);
      padding: 20px;
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin: 20px auto;
    }

    #popup h2 {
      text-align: center;
      color: #444;
      margin-top: 0;
      margin-bottom: 20px;
    }

    .control-group {
      margin-bottom: 20px;
    }

    .control-group label,
    .control-group p {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #555;
    }

    input[type="range"] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #d3d3d3;
      outline: none;
      transition: background 0.3s ease, height 0.3s ease;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
      transition: transform 0.2s ease, background 0.2s ease;
    }

    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    button {
      margin-right: 10px;
      padding: 8px 16px;
      cursor: pointer;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.3s ease;
    }

    button:hover {
      background: #45a049;
    }

    select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-size: 14px;
      outline: none;
    }

    /* Visual indicator for active analyze display buttons */
    #analyze-display-icon.active,
    #analyze-display-right-click.active {
      outline: 2px solid #45a049;
      background-color: #3e8e41;
    }

    /* History Section Styling */
    #history-container {
      display: block; /* visible by default */
      max-height: 150px;
      overflow-y: auto;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px;
      position: relative;
    }
    
    /* Header row styling for the history table */
    .history-header-row {
      display: flex;
      background-color: #f7f7f7;
      border-bottom: 1px solid #ccc;
      padding: 5px;
      font-weight: bold;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    
    .history-header-cell {
      margin-right: 10px;
    }
    
    .history-header-cell.accuracy {
      width: 40px;
      flex-shrink: 0;
    }
    
    .history-header-cell.input {
      flex: 1;
      overflow: hidden;
    }
    
    .history-header-cell.output {
      flex: 2;
      overflow: hidden;
    }

    /* History row styling */
    .history-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      padding: 5px 0;
      border-bottom: 1px solid #eee;
    }
    
    .history-cell {
      margin-right: 10px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    
    .history-cell.accuracy {
      width: 40px;
      flex-shrink: 0;
    }
    
    .history-cell.input {
      flex: 1;
    }
    
    .history-cell.output {
      flex: 2;
    }
    
    .history-bubble {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      /* No text will be shown inside the bubble */
      font-size: 12px;
      font-weight: bold;
      margin-right: 10px;
    }
  </style>
  
  <div id="popup">
    <h2>Verify-It</h2>
    <!-- Typing Speed Slider Group -->
    <div class="control-group">
      <label for="typing-speed-slider">Typing Speed:</label>
      <input type="range" id="typing-speed-slider" min="1" max="10" value="5">
    </div>
    
    <!-- Analyze Display Selection -->
    <div class="control-group">
      <p>Select Analyze Button Display:</p>
      <button id="analyze-display-icon">Popup</button>
      <button id="analyze-display-right-click" class="active">Right-Click</button>
    </div>
    
    <!-- History Section -->
    <div class="control-group" id="history-section">
      <p id="history-header" style="cursor: pointer;">History</p>
      <div id="history-container">
        <!-- Header and history items will be injected here -->
      </div>
    </div>
  </div>
`;

// Access elements within the shadow DOM
const typingSpeedSlider = shadow.querySelector("#typing-speed-slider");
const analyzeDisplayIcon = shadow.querySelector("#analyze-display-icon");
const analyzeDisplayRightClick = shadow.querySelector("#analyze-display-right-click");
const historyHeader = shadow.querySelector("#history-header");
const historyContainer = shadow.querySelector("#history-container");

// Initialize settings in a single storage call to avoid race conditions
chrome.storage.local.get(["typingSpeed", "analyzeDisplay"], (data) => {
  // Initialize Typing Speed
  if (data.typingSpeed !== undefined) {
    typingSpeedSlider.value = data.typingSpeed;
  }

  // Initialize Analyze Display setting
  if (data.analyzeDisplay === "icon") {
    analyzeDisplayIcon.classList.add("active");
    analyzeDisplayRightClick.classList.remove("active");
  } else {
    // Default to right-click if not set or any other value
    analyzeDisplayRightClick.classList.add("active");
    analyzeDisplayIcon.classList.remove("active");
  }
});

// Set up event listeners for persistent settings changes

typingSpeedSlider.addEventListener("input", () => {
  const value = typingSpeedSlider.value;
  chrome.storage.local.set({ typingSpeed: value });
  console.log("Typing Speed set to:", value);
});

analyzeDisplayIcon.addEventListener("click", () => {
  console.log("Popup display selected for Analyze button.");
  chrome.storage.local.set({ analyzeDisplay: "icon" });
  chrome.runtime.sendMessage({ action: "toggle-analyze-display", show: false });
  analyzeDisplayIcon.classList.add("active");
  analyzeDisplayRightClick.classList.remove("active");
});

analyzeDisplayRightClick.addEventListener("click", () => {
  console.log("Right-Click display selected for Analyze button.");
  chrome.storage.local.set({ analyzeDisplay: "right-click" });
  chrome.runtime.sendMessage({ action: "toggle-analyze-display", show: true });
  analyzeDisplayRightClick.classList.add("active");
  analyzeDisplayIcon.classList.remove("active");
});

// Toggle the display of the History container when the header is clicked
historyHeader.addEventListener("click", () => {
  if (historyContainer.style.display === "none" || historyContainer.style.display === "") {
    historyContainer.style.display = "block";
  } else {
    historyContainer.style.display = "none";
  }
});

/* 
   Helper method: getBubbleColor()
   - Accepts a truthiness value (ensuring it is a number) and returns a color.
   - ≥ 0.8: green, 0.4 - 0.8: amber, and below 0.4: red.
*/
function getBubbleColor(score) {
  // Ensure the score is a number in case it's stored as a string.
  const numericScore = typeof score === "number" ? score : parseFloat(score);
  if (isNaN(numericScore)) {
    return "#9E9E9E"; // gray if not a number
  }
  if (numericScore >= 0.8) {
    return "#4CAF50"; // green for high accuracy
  } else if (numericScore >= 0.4) {
    return "#FFC107"; // amber for medium accuracy
  } else {
    return "#F44336"; // red for low accuracy
  }
}

/* 
   Updated refreshHistory() function.
   - Inserts a header row with "Accuracy", "Input", and "Output" at the top.
   - When history is empty, it shows "Your history will show up after you analyze text!" below the header.
   - Each history item uses:
       • The stored truthiness (converted to a number) to determine the bubble color (Accuracy column), with the bubble containing no text.
       • The first 10 characters of input.
       • The first 20 characters of output.
*/
function refreshHistory() {
  chrome.storage.local.get("history", (data) => {
    const history = data.history || [];
    // Clear existing history items.
    historyContainer.innerHTML = "";

    // Create header row inside history container.
    const headerRow = document.createElement("div");
    headerRow.className = "history-header-row";

    const accuracyHeader = document.createElement("div");
    accuracyHeader.className = "history-header-cell accuracy";
    accuracyHeader.textContent = "Accuracy";

    const inputHeader = document.createElement("div");
    inputHeader.className = "history-header-cell input";
    inputHeader.textContent = "Input";

    const outputHeader = document.createElement("div");
    outputHeader.className = "history-header-cell output";
    outputHeader.textContent = "Output";

    headerRow.appendChild(accuracyHeader);
    headerRow.appendChild(inputHeader);
    headerRow.appendChild(outputHeader);
    historyContainer.appendChild(headerRow);

    if (history.length === 0) {
      const noHistoryMessage = document.createElement("p");
      noHistoryMessage.textContent = "Your history will show up after you analyze text!";
      noHistoryMessage.style.padding = "5px";
      historyContainer.appendChild(noHistoryMessage);
      return;
    }

    // Loop through each history item.
    history.forEach(item => {
      // Force the truthiness to be a valid number (in case it's stored as a string).
      const truthiness = parseFloat(item.truthiness);
      
      // Create container for the history row.
      const itemRow = document.createElement("div");
      itemRow.className = "history-item";

      // Accuracy cell: a bubble with no text.
      const accuracyCell = document.createElement("div");
      accuracyCell.className = "history-cell accuracy";
      const bubble = document.createElement("div");
      bubble.className = "history-bubble";
      bubble.style.backgroundColor = getBubbleColor(truthiness);
      // No text inside the bubble.
      accuracyCell.appendChild(bubble);

      // Input cell: first 10 characters of input.
      const inputCell = document.createElement("div");
      inputCell.className = "history-cell input";
      inputCell.textContent = item.input.substring(0, 10);

      // Output cell: first 20 characters of output.
      const outputCell = document.createElement("div");
      outputCell.className = "history-cell output";
      outputCell.textContent = item.output.substring(0, 20);

      // Append cells to the history row.
      itemRow.appendChild(accuracyCell);
      itemRow.appendChild(inputCell);
      itemRow.appendChild(outputCell);

      // Append the history row to the history container.
      historyContainer.appendChild(itemRow);
    });
  });
}

// On popup load, refresh the history display.
refreshHistory();

// Listen for changes in chrome.storage.local to update the history display in real-time.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.history) {
    refreshHistory();
  }
});

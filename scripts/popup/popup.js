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
      background: #ffffff;
    }

    #popup {
      width: 500px;  /* Increased width for landscape layout */
      padding: 15px;
      box-sizing: border-box;
    }

    #popup h2 {
      text-align: center;
      color: #444;
      margin-top: 0;
      margin-bottom: 15px;
    }

    /* Top controls container */
    .controls-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 20px;
      align-items: flex-start;  /* Align items to the top */
    }

    /* Adjust control groups for side-by-side layout */
    .control-group {
      flex: 1;
    }

    .control-group label,
    .control-group p {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #555;
      margin-top: 0;  /* Remove top margin to align text */
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

    /* Button group styling */
    .button-group {
      display: flex;
      border: 1px solid #4CAF50;
      border-radius: 4px;
      overflow: hidden;  /* Ensures inner buttons don't break the border radius */
    }

    .button-group button {
      flex: 1;
      margin: 0;  /* Remove default button margins */
      padding: 8px 16px;
      border: none;
      border-radius: 0;  /* Remove border radius from individual buttons */
      background: #ffffff;
      color: #4CAF50;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .button-group button:hover {
      background: #e8f5e9;
    }

    .button-group button.active {
      background: #4CAF50;
      color: white;
    }

    /* Remove the old button styles */
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
      display: flex;
      flex-direction: column;
      height: 150px;
      border: 1px solid #ccc;
      border-radius: 4px;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    /* History Header Styling */
    .history-header {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: 8px 0;
      background-color: #e0e0e0;
      border-bottom: 2px solid #ccc;
      font-weight: bold;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .history-header-cell {
      box-sizing: border-box;
      padding: 0 8px;
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
    }
    
    /* Add dividers between columns in history header */
    .history-header-cell:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background-color: #ccc;
    }
    
    .history-header-cell.accuracy {
      width: 14%;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .history-header-cell.input {
      width: 20%;
      flex-shrink: 0;
    }
    
    .history-header-cell.output {
      width: 50%;
      flex-shrink: 0;
    }
    
    .history-header-cell.action {
      width: 10%;
      flex-shrink: 0;
      text-align: center;
    }
    
    /* Detail Header Styling */
    .detail-header {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: 8px 0;
      background-color: #e0e0e0;
      border-bottom: 2px solid #ccc;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .back-button {
      cursor: pointer;
      margin: 0 10px;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .back-button::before {
      content: "←";
      font-size: 16px;
      color: #4CAF50;
      font-weight: bold;
    }

    .detail-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-grow: 1;
    }
    
    /* History Content Styling */
    .content-area {
      flex-grow: 1;
      overflow-y: auto;
    }
    
    .history-item {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: 8px 0;
      min-height: 60px;
    }

    /* Increased contrast for alternating row colors */
    .history-item:nth-child(even) {
      background-color: #f0f0f0;
    }

    .history-item:nth-child(odd) {
      background-color: #ffffff;
    }
    
    .history-cell {
      box-sizing: border-box;
      padding: 0 8px;
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
    }
    
    /* Add dividers between columns */
    .history-cell:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background-color: #ccc;
    }
    
    .history-cell.accuracy {
      width: 14%;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .history-cell.input {
      width: 20%;
      flex-shrink: 0;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
    }
    
    .history-cell.output {
      width: 50%;
      flex-shrink: 0;
      word-wrap: break-word;
      white-space: normal;
      line-height: 1.2;
    }
    
    /* Text truncation for input and output */
    .text-truncate {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-height: 36px; /* Approximately 2 lines */
    }

    .history-cell.action {
      width: 10%;
      flex-shrink: 0;
      text-align: center;
    }

    .history-bubble {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }

    .history-cell.action::after {
      content: "→";
      font-size: 16px;  /* Bigger arrow */
      color: #4CAF50;
      font-weight: bold;
      cursor: pointer;
    }

    /* History view specific styles */
    #history-view {
      display: block;
    }

    /* Detail view specific styles */
    #detail-view {
      display: none;
      flex-direction: column;
      height: 100%;
    }

    .detail-content {
      padding: 10px;
      overflow-y: auto;
    }

    .detail-section {
      margin-bottom: 15px;
    }

    .detail-section-title {
      margin-bottom: 5px;
      color: #555;
      font-weight: bold;
    }

    .detail-text {
      margin: 0;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
  
  <div id="popup">
    <h2>Verify-It</h2>
    <div class="controls-container">
      <!-- Typing Speed Slider Group -->
      <div class="control-group">
        <label for="typing-speed-slider">Typing Speed:</label>
        <input type="range" id="typing-speed-slider" min="1" max="10" value="5">
      </div>
      
      <!-- Analyze Display Selection -->
      <div class="control-group">
        <p>Select Analyze Button Display:</p>
        <div class="button-group">
          <button id="analyze-display-icon">Popup</button>
          <button id="analyze-display-right-click" class="active">Right-Click</button>
        </div>
      </div>
    </div>
    
    <!-- History Section -->
    <div class="control-group" id="history-section">
      <p>History</p>
      <div id="history-container">
        <!-- History View with its own header -->
        <div id="history-view">
          <div class="history-header">
            <div class="history-header-cell accuracy">Accuracy</div>
            <div class="history-header-cell input">Input</div>
            <div class="history-header-cell output">Output</div>
            <div class="history-header-cell action"></div>
          </div>
          <div class="content-area">
            <!-- History items will be injected here -->
          </div>
        </div>

        <!-- Detail View with a completely separate header -->
        <div id="detail-view">
          <div class="detail-header">
            <div class="back-button"></div>
            <div class="detail-header-info">
              <!-- Accuracy bubble and truncated input will be injected here -->
            </div>
          </div>
          <div class="detail-content">
            <!-- Query details will be injected here -->
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// Access elements within the shadow DOM
const typingSpeedSlider = shadow.querySelector("#typing-speed-slider");
const analyzeDisplayIcon = shadow.querySelector("#analyze-display-icon");
const analyzeDisplayRightClick = shadow.querySelector("#analyze-display-right-click");
const historyView = shadow.querySelector("#history-view");
const historyContentArea = shadow.querySelector("#history-view .content-area");
const detailView = shadow.querySelector("#detail-view");
const detailHeaderInfo = shadow.querySelector(".detail-header-info");
const detailContent = shadow.querySelector(".detail-content");
const backButton = shadow.querySelector(".back-button");

// Variables to store scroll position
let historyScrollPosition = 0;

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

// Set up back button event listener
backButton.addEventListener("click", showHistoryView);

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
   Function to show the history view and hide the detail view
*/
function showHistoryView() {
  // Show history view and hide detail view
  historyView.style.display = "block";
  detailView.style.display = "none";
  
  // Restore the scroll position
  historyContentArea.scrollTop = historyScrollPosition;
  
  // Refresh history content
  refreshHistory();
}

/* 
   Function to show the detail view for a specific query
*/
function showDetailView(queryIndex) {
  chrome.storage.local.get("history", (data) => {
    const history = data.history || [];
    if (queryIndex >= 0 && queryIndex < history.length) {
      const item = history[queryIndex];
      const truthiness = parseFloat(item.truthiness);
      
      // Store current scroll position before switching views
      historyScrollPosition = historyContentArea.scrollTop;
      
      // Set up detail header info
      detailHeaderInfo.innerHTML = '';
      const bubble = document.createElement("div");
      bubble.className = "history-bubble";
      bubble.style.backgroundColor = getBubbleColor(truthiness);
      
      detailHeaderInfo.appendChild(bubble);
      
      // Create detail content
      detailContent.innerHTML = `
        <div class="detail-section">
          <div class="detail-section-title">Input</div>
          <div class="detail-text">${item.input}</div>
        </div>
        
        <div class="detail-section">
          <div class="detail-section-title">Output</div>
          <div class="detail-text">${item.output}</div>
        </div>
      `;
      
      // Show detail view and hide history view
      historyView.style.display = "none";
      detailView.style.display = "flex";
      
      // Reset the scroll position of the detail view
      detailContent.scrollTop = 0;
    }
  });
}

/* 
   Updated refreshHistory() function with clickable arrows
*/
function refreshHistory() {
  chrome.storage.local.get("history", (data) => {
    const history = data.history || [];
    historyContentArea.innerHTML = "";

    if (history.length === 0) {
      const noHistoryMessage = document.createElement("p");
      noHistoryMessage.textContent = "Your history will show up after you analyze text!";
      noHistoryMessage.style.padding = "10px";
      historyContentArea.appendChild(noHistoryMessage);
      return;
    }

    // Loop through each history item
    history.forEach((item, index) => {
      const truthiness = parseFloat(item.truthiness);
      
      const itemRow = document.createElement("div");
      itemRow.className = "history-item";

      const accuracyCell = document.createElement("div");
      accuracyCell.className = "history-cell accuracy";
      const bubble = document.createElement("div");
      bubble.className = "history-bubble";
      bubble.style.backgroundColor = getBubbleColor(truthiness);
      accuracyCell.appendChild(bubble);

      const inputCell = document.createElement("div");
      inputCell.className = "history-cell input";
      const inputText = document.createElement("div");
      inputText.className = "text-truncate";
      inputText.textContent = item.input;
      inputCell.appendChild(inputText);

      const outputCell = document.createElement("div");
      outputCell.className = "history-cell output";
      const outputText = document.createElement("div");
      outputText.className = "text-truncate";
      outputText.textContent = item.output;
      outputCell.appendChild(outputText);

      const actionCell = document.createElement("div");
      actionCell.className = "history-cell action";
      actionCell.addEventListener("click", () => {
        showDetailView(index);
      });

      itemRow.appendChild(accuracyCell);
      itemRow.appendChild(inputCell);
      itemRow.appendChild(outputCell);
      itemRow.appendChild(actionCell);

      historyContentArea.appendChild(itemRow);
    });
  });
}

// On popup load, show history view
refreshHistory();

// Listen for changes in chrome.storage.local to update the history display in real-time.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.history) {
    // Only refresh history if we're currently in history view
    if (historyView.style.display === "block") {
      refreshHistory();
    }
  }
});
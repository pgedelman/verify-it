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
    
    <!-- General Selection Dropdown -->
    <div class="control-group">
      <p>General Selection:</p>
      <select id="general-selection">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
    </div>
  </div>
`;

// Access elements within the shadow DOM
const typingSpeedSlider = shadow.querySelector("#typing-speed-slider");
const analyzeDisplayIcon = shadow.querySelector("#analyze-display-icon");
const analyzeDisplayRightClick = shadow.querySelector("#analyze-display-right-click");
const generalSelection = shadow.querySelector("#general-selection");

// Initialize with stored settings if available
const storedTypingSpeed = localStorage.getItem("typingSpeed");
if (storedTypingSpeed !== null) {
  typingSpeedSlider.value = storedTypingSpeed;
}

// Set up event listeners

typingSpeedSlider.addEventListener("input", () => {
  localStorage.setItem("typingSpeed", typingSpeedSlider.value);
  console.log("Typing Speed set to:", typingSpeedSlider.value);
});

analyzeDisplayIcon.addEventListener("click", () => {
  console.log("Popup display selected for Analyze button.");
  localStorage.setItem("analyzeDisplay", "icon");
  analyzeDisplayIcon.classList.add("active");
  analyzeDisplayRightClick.classList.remove("active");
});

analyzeDisplayRightClick.addEventListener("click", () => {
  console.log("Right-Click display selected for Analyze button.");
  localStorage.setItem("analyzeDisplay", "right-click");
  analyzeDisplayRightClick.classList.add("active");
  analyzeDisplayIcon.classList.remove("active");
});

generalSelection.addEventListener("change", () => {
  console.log("General selection changed to:", generalSelection.value);
});

document.addEventListener("DOMContentLoaded", function() {
  // Typing Speed Slider Group
  var typingSpeedSlider = document.getElementById("typing-speed-slider");

  // Initialize slider value from localStorage if available
  var storedTypingSpeed = localStorage.getItem("typingSpeed");
  if (storedTypingSpeed !== null) {
    typingSpeedSlider.value = storedTypingSpeed;
    // Dispatch event so bubble.js receives the current typing speed immediately
    window.dispatchEvent(new CustomEvent("typingSpeedChanged", {
      detail: { typingSpeed: storedTypingSpeed }
    }));
  }

  // Update the typing speed setting along with the slider movement using a custom event
  typingSpeedSlider.addEventListener("input", function() {
    localStorage.setItem("typingSpeed", typingSpeedSlider.value);
    console.log("Typing Speed set to:", typingSpeedSlider.value);
    window.dispatchEvent(new CustomEvent("typingSpeedChanged", {
      detail: { typingSpeed: typingSpeedSlider.value }
    }));
  });
////////////////////////////////////////////////////////////////////////////////////////////////
  // Analyze Button Display Options
  var analyzeDisplayIcon = document.getElementById("analyze-display-icon");
  var analyzeDisplayRClick = document.getElementById("analyze-display-right-click");

  // Initialize analyzeDisplay based on localStorage, defaulting to "icon"
  var storedAnalyzeDisplay = localStorage.getItem("analyzeDisplay") || "icon";
  
  // Set visual indicator based on the active setting.
  if (storedAnalyzeDisplay === "icon") {
    analyzeDisplayIcon.classList.add("active");
    analyzeDisplayRClick.classList.remove("active");
    chrome.runtime.sendMessage({ action: "toggle-analyze-display", show: false });
  } else {
    analyzeDisplayRClick.classList.add("active");
    analyzeDisplayIcon.classList.remove("active");
    chrome.runtime.sendMessage({ action: "toggle-analyze-display", show: true});
  }

  // Analyze display mode selection: update localStorage and visual indicator.
  analyzeDisplayIcon.addEventListener("click", function() {
    console.log("Icon display selected for Analyze button.");
    localStorage.setItem("analyzeDisplay", "icon");
    analyzeDisplayIcon.classList.add("active");
    analyzeDisplayRClick.classList.remove("active");
    chrome.runtime.sendMessage({ action: "toggle-analyze-display", show: false });
  });

  analyzeDisplayRClick.addEventListener("click", function() {
    console.log("Text display selected for Analyze button.");
    localStorage.setItem("analyzeDisplay", "right-click");
    analyzeDisplayRClick.classList.add("active");
    analyzeDisplayIcon.classList.remove("active");
    chrome.runtime.sendMessage({ action: "toggle-analyze-display", show: true });
  });
//////////////////////////////////////////////////////////////////////////////////////////////
  // General Selection Dropdown
  var generalSelection = document.getElementById("general-selection");
  generalSelection.addEventListener("change", function() {
    console.log("General selection changed to:", generalSelection.value);
    window.dispatchEvent(new CustomEvent("generalSelectionChanged", {
      detail: { generalOption: generalSelection.value }
    }));
  });
});

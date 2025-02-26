// Create a container element and attach a shadow root to encapsulate the bubble UI
const bubbleContainer = document.createElement("div");
bubbleContainer.id = "verifyit-bubble-container";
document.body.appendChild(bubbleContainer);
const shadow = bubbleContainer.attachShadow({ mode: "open" });

// Immediately inject CSS styles into the shadow DOM for full isolation
function injectStyles(shadowRoot) {
  const style = document.createElement("style");
  style.textContent = `
    /* Base bubble styling */
    .pink-bubble {
      width: 60px;
      height: 60px;
      position: fixed;
      bottom: 100px;
      right: 100px;
      border-radius: 50%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      z-index: 9999;
      user-select: none;
      pointer-events: auto;
      transition: border-radius 0.3s ease;
      overflow: hidden;
      background-color: #f0f0f0;
    }
    /* Expanded bubble styling with fixed positioning */
    .pink-bubble.expanded {
      width: 320px;
      height: 180px;
      min-width: 320px;
      min-height: 180px;
      border-radius: 10px;
      justify-content: flex-start;
      resize: both;
      overflow: hidden;
    }
    /* Bubble icon styling */
    .bubble-icon {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      transition: width 0.3s ease, height 0.3s ease, margin 0.3s ease, top 0.3s ease, left 0.3s ease;
    }
    /* When expanded, shrink the icon and move it to the left */
    .pink-bubble.expanded .bubble-icon {
      width: 30px;
      height: 30px;
      position: absolute;
      top: 10px;
      left: 10px;
      margin: 0;
    }
    /* Updated Clear button styling - positioned UNDER the icon */
    .clear-button {
      position: absolute;
      top: 50px; /* Positioned below the icon */
      left: 10px; /* Aligned with icon */
      display: none;
      padding: 5px 10px;
      font-size: 12px;
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      z-index: 1;
      min-width: 50px;
      text-align: center;
    }
    .clear-button:hover {
      background-color: #e8e8e8;
    }
    /* Expand/Shrink button styling - positioned below the clear button */
    .expand-button {
      position: absolute;
      top: 85px; /* Positioned below the clear button */
      left: 10px; /* Aligned with icon and clear button */
      display: none;
      padding: 5px 10px;
      font-size: 12px;
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      z-index: 1;
      min-width: 50px;
      text-align: center;
    }
    .expand-button:hover {
      background-color: #e8e8e8;
    }
    /* Modern truthiness scale with notch indicator */
    .truthiness-scale {
      position: absolute;
      top: 10px; /* Aligned with the top of the bubble icon */
      left: 80px; /* Adjusted to avoid overlap */
      width: 12px; /* Slimmer width for more modern look */
      height: 150px; /* Match bubble height */
      border-radius: 8px;
      overflow: visible; /* Allow notch to overflow */
      display: none;
      background: linear-gradient(
        to top,
        #ff5252 0%,    /* Red for false */
        #ffeb3b 50%,   /* Yellow for uncertain */
        #4caf50 100%   /* Green for true */
      );
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 2; /* Ensure it's above the background */
    }
    /* Modern notch indicator styling */
    .notch-indicator {
      position: absolute;
      left: 50%; /* Center horizontally */
      transform: translateX(-50%) translateY(-50%); /* Center on both axes */
      width: 18px;
      height: 8px; /* Thinner for more modern look */
      background-color: #fff;
      border-radius: 4px;
      transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      z-index: 2;
    }
    /* Notch shadow styling for better visual depth */
    .notch-indicator::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      box-shadow: inset 0 1px 1px rgba(0,0,0,0.1);
    }
    /* Container for text content – scrolls as one */
    .bubble-content {
      position: absolute;
      top: 6px;
      left: 110px; /* More room so text doesn't overlap scale */
      right: 10px;
      bottom: 10px;
      overflow-y: auto;
      padding-right: 10px;
      z-index: 1; /* Below scale, but above background */
    }
    /* Summary text styling (first two sentences) */
    .bubble-summary {
      font-size: 14px;
      color: #000;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      margin: 0;
    }
    /* Detailed text styling (rest of the content) */
    .bubble-details {
      font-size: 14px;
      color: #000;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      margin-top: 5px;  /* Reduced gap */
      border-top: 1px solid #eee;
      padding-top: 5px; /* Reduced gap */
    }
    /* Hide detailed text by default in the expanded bubble */
    .bubble-details.hidden {
      display: none;
    }
    .pink-bubble.neutral-status { background-color: #f0f0f0; }
    .pink-bubble.true-status { background-color: #d4edda; }
    .pink-bubble.uncertain-status { background-color: #fff3cd; }
    .pink-bubble.false-status { background-color: #f8d7da; }
    /* Updated drag boundary styling to cover the full viewport */
    .drag-boundary {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 2px dashed rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      z-index: 9998;
      display: none;
      pointer-events: none;
    }
  `;
  shadowRoot.appendChild(style);
}

// Create the bubble and its child elements inside the shadow DOM
function createBubble(shadowRoot) {
  // Create the bubble element
  const pinkBubble = document.createElement("div");
  pinkBubble.className = "pink-bubble neutral-status";
  shadowRoot.appendChild(pinkBubble);

  // Create the icon element
  const bubbleIcon = document.createElement("img");
  bubbleIcon.className = "bubble-icon";
  bubbleIcon.src = chrome.runtime.getURL("images/verifyit-icon.png");
  bubbleIcon.alt = "VerifyIt Icon";
  bubbleIcon.onerror = function() {
    console.error("Failed to load verifyit icon image at images/verifyit-icon.png");
  };
  pinkBubble.appendChild(bubbleIcon);

  // Create the clear button element
  const clearButton = document.createElement("button");
  clearButton.className = "clear-button";
  clearButton.textContent = "Clear";
  pinkBubble.appendChild(clearButton);
  
  // Create the expand/shrink button
  const expandButton = document.createElement("button");
  expandButton.className = "expand-button";
  expandButton.textContent = "Expand";
  pinkBubble.appendChild(expandButton);

  // Create the truthiness scale
  const truthinessScale = document.createElement("div");
  truthinessScale.className = "truthiness-scale";
  pinkBubble.appendChild(truthinessScale);
  
  // Create the notch indicator element
  const notchIndicator = document.createElement("div");
  notchIndicator.className = "notch-indicator";
  notchIndicator.style.top = "50%"; // Default position (uncertain)
  truthinessScale.appendChild(notchIndicator);
  
  // Create a container for both summary and details so they scroll together
  const bubbleContent = document.createElement("div");
  bubbleContent.className = "bubble-content";
  pinkBubble.appendChild(bubbleContent);

  // Create the summary text container (for first two sentences)
  const bubbleSummary = document.createElement("div");
  bubbleSummary.className = "bubble-summary";
  bubbleContent.appendChild(bubbleSummary);
  
  // Create the detailed text container (for the rest of the content)
  const bubbleDetails = document.createElement("div");
  bubbleDetails.className = "bubble-details hidden"; // hidden by default
  bubbleContent.appendChild(bubbleDetails);

  // Create the drag boundary element
  const dragBoundary = document.createElement("div");
  dragBoundary.className = "drag-boundary";
  shadowRoot.appendChild(dragBoundary);

  return { 
    pinkBubble, 
    bubbleIcon, 
    bubbleSummary,
    bubbleDetails,
    bubbleContent,
    dragBoundary, 
    clearButton,
    expandButton,
    truthinessScale, 
    notchIndicator
  };
}

injectStyles(shadow);
const { 
  pinkBubble, 
  bubbleIcon, 
  bubbleSummary,
  bubbleDetails,
  bubbleContent,
  dragBoundary, 
  clearButton,
  expandButton,
  truthinessScale, 
  notchIndicator
} = createBubble(shadow);

// --- Utility Functions ---

// Formats text by adding spaces and removing markdown asterisks.
function formatText(text) {
  let formatted = text.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  formatted = formatted.replace(/\*(.*?)\*/g, "$1");
  return formatted;
}

// Implements a typewriter effect.
function typeWriter(text, element) {
  element.innerText = "";
  let index = 0;
  const controller = { cancelled: false };
  currentTypeWriter = controller;

  function type() {
    if (controller.cancelled) return;
    if (index < text.length) {
      element.innerText += text.charAt(index);
      index++;
      let delay = Math.max(5, 150 - currentTypingSpeed * 30);
      setTimeout(type, delay);
    }
  }
  type();
}

// Amplifies small differences in the truthiness score.
function amplifyScore(score, factor = 2) {
  let amplified = 0.5 + (score - 0.5) * factor;
  return Math.min(Math.max(amplified, 0), 1);
}

// --- Global Variables ---
let currentTypeWriter = null;
let currentTypingSpeed = 5;
let bubbleState = "idle"; // 'idle' or 'active'
let isExpanded = false;   // Only used if the bubble is active
let isDetailsExpanded = false; // Track if details are expanded

// --- Global variable to detect drag versus click on the bubble icon ---
let iconMouseDown = null;

// --- Setup ---

// --- Drag-and-Drop Functionality ---
let isDragging = false;
let offsetX, offsetY;

// Helper function to check if the mousedown happened in the native resizer area.
function isInResizerArea(event) {
  const rect = pinkBubble.getBoundingClientRect();
  return (event.clientX > rect.right - 16 && event.clientY > rect.bottom - 16);
}

pinkBubble.addEventListener("mousedown", (event) => {
  // Prevent dragging if clicking the clear button.
  if (event.target === clearButton) return;
  
  // In active, expanded state, if the mousedown is in the resizer area, let native resize work.
  if (bubbleState === "active" && isExpanded && isInResizerArea(event)) {
    return;
  }
  
  isDragging = true;
  offsetX = event.clientX - pinkBubble.getBoundingClientRect().left;
  offsetY = event.clientY - pinkBubble.getBoundingClientRect().top;
  pinkBubble.style.cursor = "grabbing";
  dragBoundary.style.display = "block";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const bubbleWidth = pinkBubble.offsetWidth;
    const bubbleHeight = pinkBubble.offsetHeight;
    let x = event.clientX - offsetX;
    let y = event.clientY - offsetY;
    
    // Constrain the bubble within the viewport boundaries
    x = Math.min(Math.max(0, x), window.innerWidth - bubbleWidth);
    y = Math.min(Math.max(0, y), window.innerHeight - bubbleHeight);
  
    pinkBubble.style.left = x + "px";
    pinkBubble.style.top = y + "px";
  }
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    pinkBubble.style.cursor = "grab";
    dragBoundary.style.display = "none";
    document.body.style.userSelect = "";
  }
});

// Prevent accidental text selection, unless the click is on the native resize area.
pinkBubble.addEventListener("mousedown", (event) => {
  if (bubbleState === "active" && isExpanded && isInResizerArea(event)) {
    return;
  }
  event.preventDefault();
});

//////////////////////////
// ICON & CLEAR BUTTON  //
//////////////////////////

// Handle icon clicks for expanding/collapsing the bubble
bubbleIcon.addEventListener("click", (event) => {
  event.stopPropagation();
  
  if (bubbleState === "active") {
    isExpanded = !isExpanded;
    if (isExpanded) {
      // Transition to expanded state
      pinkBubble.style.width = "";
      pinkBubble.style.height = "";
      pinkBubble.style.borderRadius = "";
      pinkBubble.classList.add("expanded");
      // Ensure the text container is visible
      bubbleContent.style.display = "block";
      clearButton.style.display = "block";
      expandButton.style.display = "block";
      truthinessScale.style.display = "block";
      
      // Show details if they were previously expanded
      if (isDetailsExpanded) {
        bubbleDetails.classList.remove("hidden");
      }
    } else {
      // Transition to minimized state
      pinkBubble.classList.remove("expanded");
      // Hide the detailed content and reset controls
      bubbleDetails.classList.add("hidden");
      clearButton.style.display = "none";
      expandButton.style.display = "none";
      truthinessScale.style.display = "none";
      // Force idle sizing inline for a perfect circle
      pinkBubble.style.width = "60px";
      pinkBubble.style.height = "60px";
      pinkBubble.style.borderRadius = "50%";
    }
  }
});

// --- Expand/Shrink Button Functionality ---
expandButton.addEventListener("click", (event) => {
  event.stopPropagation();
  
  isDetailsExpanded = !isDetailsExpanded;
  
  if (isDetailsExpanded) {
    expandButton.textContent = "Shrink";
    bubbleDetails.classList.remove("hidden");
  } else {
    expandButton.textContent = "Expand";
    bubbleDetails.classList.add("hidden");
  }
});

// --- Clear Button Functionality --- 
clearButton.addEventListener("click", (event) => {
  event.stopPropagation();
  
  // Clear the text and revert the bubble to idle state
  bubbleSummary.innerText = "";
  bubbleDetails.innerText = "";
  pinkBubble.classList.remove("expanded");
  bubbleState = "idle";
  isExpanded = false;
  isDetailsExpanded = false;
  clearButton.style.display = "none";
  expandButton.style.display = "none";
  expandButton.textContent = "Expand";
  truthinessScale.style.display = "none";
  
  // Reset inline dimensions for the idle (circular) look
  pinkBubble.style.width = "60px";
  pinkBubble.style.height = "60px";
  pinkBubble.style.borderRadius = "50%";
});

// --- Listen for Analysis Result Messages --- 
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "ANALYSIS_RESULT") {
    const resultText = event.data.data;
    
    // Split the text into sentences
    const sentences = resultText.split(/(?<=[.!?])\s+/);
    
    // Combine first two sentences into summary paragraph
    let summaryText = "";
    if (sentences.length >= 2) {
      summaryText = sentences[0] + " " + sentences[1];
    } else {
      summaryText = sentences[0] || "";
    }
    
    // Get the rest of the text as details (if any)
    let detailsText = "";
    if (sentences.length > 2) {
      detailsText = resultText.substring(summaryText.length).trim();
    }
    
    // Process the truthiness score
    let score = 0.5; // Default to uncertain
    if (typeof event.data.truthiness !== "undefined") {
      score = Math.min(Math.max(event.data.truthiness, 0), 1);
    }
    
    // Amplify the score to emphasize differences
    score = amplifyScore(score, 3);

    // Update the notch indicator position based on the score
    const notchPosition = (1 - score) * 100;
    notchIndicator.style.top = `${notchPosition}%`;
    
    // Set bubble to active state and auto-expand
    bubbleState = "active";
    isExpanded = true;
    isDetailsExpanded = false; // Start with details collapsed
    
    // Clear any inline sizing for proper expansion
    pinkBubble.style.width = "";
    pinkBubble.style.height = "";
    pinkBubble.style.borderRadius = "";
    pinkBubble.classList.add("expanded");
    
    // Initialize text content
    bubbleSummary.innerText = "";
    bubbleDetails.innerText = "";
    
    // Hide details initially
    bubbleDetails.classList.add("hidden");
    
    // Display controls
    clearButton.style.display = "block";
    expandButton.style.display = "block";
    expandButton.textContent = "Expand"; // Reset to "Expand"
    truthinessScale.style.display = "block";
    
    // Start typewriter effect for summary text
    if (currentTypeWriter) {
      currentTypeWriter.cancelled = true;
    }
    typeWriter(summaryText, bubbleSummary);
    
    // Set the details text without typewriter effect
    bubbleDetails.innerText = detailsText;
  }
});

// Initialize the bubble with draggable functionality in all states
pinkBubble.style.cursor = "grab";

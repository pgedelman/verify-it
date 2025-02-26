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
    /* Updated Clear button styling - positioned UNDER the icon with proper width */
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
      min-width: 50px; /* Increased from 30px to fit text */
      text-align: center;
    }
    .clear-button:hover {
      background-color: #e8e8e8;
    }
    /* Updated truthiness scale - placed with better spacing */
    .truthiness-scale {
      position: absolute;
      top: 10px; /* Aligned with the top of the bubble icon */
      left: 70px; /* Increased from 50px to create better gap from icon/button */
      width: 15px; /* Slightly wider for better visibility */
      height: 150px; /* Increased from 100px to better match bubble height */
      background-color: #eee;
      border-radius: 4px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      display: none;
    }
    .scale-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(
        to top,
        #ff5252 0%,    /* Red for false */
        #ffeb3b 50%,   /* Yellow for uncertain */
        #4caf50 100%   /* Green for true */
      );
      border-radius: 4px;
      transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    /* Updated Bubble text styling - adjusted for new scale position */
    .bubble-text {
      opacity: 0;
      transition: opacity 0.3s ease;
      font-size: 14px;
      color: #000;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      height: 100%;
      overflow-y: auto;
      max-height: 100%;
      display: none;
    }
    .bubble-text.visible {
      opacity: 1;
      display: block;
    }
    .pink-bubble.expanded .bubble-text {
      margin: 10px;
      padding: 0 10px;
      width: calc(100% - 100px); /* Adjusted for the larger scale width */
      height: calc(100% - 20px);
      position: absolute;
      left: 95px; /* Positioned to the right of the truthiness scale */
      top: 6px; /* Changed from 10px to 8px to move text slightly higher */
    }
    .pink-bubble.neutral-status { background-color: #f0f0f0; }
    .pink-bubble.true-status { background-color: #d4edda; }
    .pink-bubble.uncertain-status { background-color: #fff3cd; }
    .pink-bubble.false-status { background-color: #f8d7da; }
    .bubble-text { pointer-events: none; }
    .bubble-text.visible { pointer-events: auto; }
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

// The rest of the code remains the same as your original implementation
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

  // Create the truthiness scale
  const truthinessScale = document.createElement("div");
  truthinessScale.className = "truthiness-scale";
  pinkBubble.appendChild(truthinessScale);
  
  // Create the scale fill element
  const scaleFill = document.createElement("div");
  scaleFill.className = "scale-fill";
  truthinessScale.appendChild(scaleFill);

  // Create the text container element
  const bubbleText = document.createElement("div");
  bubbleText.className = "bubble-text";
  pinkBubble.appendChild(bubbleText);

  // Create the drag boundary element
  const dragBoundary = document.createElement("div");
  dragBoundary.className = "drag-boundary";
  shadowRoot.appendChild(dragBoundary);

  return { pinkBubble, bubbleIcon, bubbleText, dragBoundary, clearButton, truthinessScale, scaleFill };
}

injectStyles(shadow);
const { pinkBubble, bubbleIcon, bubbleText, dragBoundary, clearButton, truthinessScale, scaleFill } = createBubble(shadow);

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

// --- Global variable to detect drag versus click on the bubble icon ---
let iconMouseDown = null;

// --- Setup ---

// --- Drag-and-Drop Functionality ---
let isDragging = false;
let offsetX, offsetY;

// Use a helper function to check if the mousedown happened in the native resizer area.
// We assume a 16px square at the bottom-right corner.
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
      bubbleText.classList.add("visible");
      clearButton.style.display = "block";
      truthinessScale.style.display = "block";
    } else {
      // Transition to minimized state
      pinkBubble.classList.remove("expanded");
      bubbleText.classList.remove("visible");
      clearButton.style.display = "none";
      truthinessScale.style.display = "none";
      // Force idle sizing inline for a perfect circle
      pinkBubble.style.width = "60px";
      pinkBubble.style.height = "60px";
      pinkBubble.style.borderRadius = "50%";
    }
  }
});

// --- Clear Button Functionality --- 
clearButton.addEventListener("click", (event) => {
  event.stopPropagation();
  
  // Clear the text and revert the bubble to idle state
  bubbleText.innerText = "";
  bubbleText.classList.remove("visible");
  pinkBubble.classList.remove("expanded");
  bubbleState = "idle";
  isExpanded = false;
  clearButton.style.display = "none";
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
    const formattedText = formatText(resultText);

    // Process the truthiness score
    let score = 0.5; // Default to uncertain
    if (typeof event.data.truthiness !== "undefined") {
      if (typeof event.data.truthiness === "boolean") {
        score = event.data.truthiness ? 1 : 0;
      } else if (typeof event.data.truthiness === "string") {
        if (event.data.truthiness.endsWith("%")) {
          score = parseFloat(event.data.truthiness) / 100;
        } else {
          switch (event.data.truthiness.toLowerCase()) {
            case "true":
              score = 1;
              break;
            case "false":
              score = 0;
              break;
            case "uncertain":
            default:
              score = 0.5;
          }
        }
      } else if (typeof event.data.truthiness === "number") {
        score = Math.min(Math.max(event.data.truthiness, 0), 1);
      }
    }
    
    // Amplify the score to emphasize differences
    score = amplifyScore(score, 3);

    // Update the scale fill height based on the score
    scaleFill.style.height = `${score * 100}%`;
    
    // Set bubble to active state and auto-expand
    bubbleState = "active";
    isExpanded = true;
    
    // Clear any inline sizing for proper expansion
    pinkBubble.style.width = "";
    pinkBubble.style.height = "";
    pinkBubble.style.borderRadius = "";
    pinkBubble.classList.add("expanded");
    
    // Display all elements
    bubbleText.classList.add("visible");
    clearButton.style.display = "block";
    truthinessScale.style.display = "block";
    
    // Type the analysis result
    if (currentTypeWriter) {
      currentTypeWriter.cancelled = true;
    }
    typeWriter(formattedText, bubbleText);
  }
});

// Initialize the bubble with draggable functionality in all states
pinkBubble.style.cursor = "grab";
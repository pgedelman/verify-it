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
      transition: border-radius 0.3s ease, background-color 0.3s ease;
      overflow: hidden;
      background-color: #f0f0f0;
    }
    /* Expanded bubble shows text container on the right */
    .pink-bubble.expanded {
      width: 320px;
      height: 120px;
      min-width: 320px;
      min-height: 120px;
      border-radius: 10px;
      justify-content: flex-start;
      resize: both; /* Allow native resizing */
      overflow: hidden; /* No scrolling on the overall bubble */
    }
    /* Bubble icon styling */
    .bubble-icon {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      transition: width 0.3s ease, height 0.3s ease, margin 0.3s ease;
    }
    /* When expanded, the icon keeps 60x60 and gains lateral margin */
    .pink-bubble.expanded .bubble-icon {
      width: 60px;
      height: 60px;
      margin: 0 10px;
    }
    /* Drag boundary (visible during dragging) */
    .drag-boundary {
      position: fixed;
      top: 50px;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px dashed rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      z-index: 9998;
      display: none;
      pointer-events: none;
    }
    /* Text container styling */
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
      padding: 10px;
      padding-right: 15px;
      display: none;
    }
    .bubble-text.visible {
      opacity: 1;
      display: block;
    }
    /* When expanded, only the remaining space (after the icon) is used by the text container */
    .pink-bubble.expanded .bubble-text {
      width: calc(100% - 80px);
    }
    /* Truthiness Scale Styling - only shown when expanded */
    .truthiness-scale {
      position: absolute;
      bottom: 5px;
      left: 10px;
      right: 10px;
      height: 10px;
      background: linear-gradient(to right, hsl(0, 70%, 80%), hsl(60, 70%, 80%), hsl(120, 70%, 80%));
      border: 1px solid #ccc;
      border-radius: 5px;
      display: none;
    }
    .scale-indicator {
      position: absolute;
      top: -3px;
      width: 16px;
      height: 16px;
      background-color: #555;
      border-radius: 50%;
      transform: translateX(-50%);
    }
    /* Background status classes */
    .pink-bubble.neutral-status { background-color: #f0f0f0; }
    .pink-bubble.true-status { background-color: #d4edda; }
    .pink-bubble.uncertain-status { background-color: #fff3cd; }
    .pink-bubble.false-status { background-color: #f8d7da; }
    /* Bubble text pointer events */
    .bubble-text { pointer-events: none; }
    .bubble-text.visible { pointer-events: auto; }
    /* Clear button styling - positioned at top left above the icon */
    .clear-button {
      position: absolute;
      top: 5px;
      left: 5px;
      display: none;
      padding: 2px 5px;
      font-size: 12px;
      cursor: pointer;
      z-index: 1;
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

  // Create the text container element
  const bubbleText = document.createElement("div");
  bubbleText.className = "bubble-text";
  pinkBubble.appendChild(bubbleText);

  // Create the drag boundary element
  const dragBoundary = document.createElement("div");
  dragBoundary.className = "drag-boundary";
  shadowRoot.appendChild(dragBoundary);

  // Create the clear button element (only for active state)
  const clearButton = document.createElement("button");
  clearButton.className = "clear-button";
  clearButton.textContent = "Clear";
  pinkBubble.appendChild(clearButton);

  return { pinkBubble, bubbleIcon, bubbleText, dragBoundary, clearButton };
}

injectStyles(shadow);
const { pinkBubble, bubbleIcon, bubbleText, dragBoundary, clearButton } = createBubble(shadow);

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
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
    const boundary = dragBoundary.getBoundingClientRect();
    const bubbleWidth = pinkBubble.offsetWidth;
    const bubbleHeight = pinkBubble.offsetHeight;
    let newX = Math.min(Math.max(boundary.left, x), boundary.right - bubbleWidth);
    let newY = Math.min(Math.max(boundary.top, y), boundary.bottom - bubbleHeight);
    pinkBubble.style.left = newX + "px";
    pinkBubble.style.top = newY + "px";
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

// Track where the mousedown occurred on the icon
bubbleIcon.addEventListener("mousedown", (event) => {
  iconMouseDown = { x: event.clientX, y: event.clientY };
});

// Now, on click, only toggle if the movement was minimal (i.e. not a drag)
bubbleIcon.addEventListener("click", (event) => {
  // Use a small click threshold to avoid toggling when dragging.
  if (iconMouseDown) {
    const dx = event.clientX - iconMouseDown.x;
    const dy = event.clientY - iconMouseDown.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      iconMouseDown = null;
      return;
    }
  }
  iconMouseDown = null;

  if (bubbleState === "active") {
    isExpanded = !isExpanded;
    if (isExpanded) {
      // Transition to expanded state.
      // Remove inline sizing so that the .expanded CSS (rectangle) applies.
      pinkBubble.style.width = "";
      pinkBubble.style.height = "";
      pinkBubble.style.borderRadius = "";
      pinkBubble.classList.add("expanded");
      bubbleText.classList.add("visible");
      clearButton.style.display = "block";
      let scale = pinkBubble.querySelector(".truthiness-scale");
      if (scale) {
        scale.style.display = "block";
      }
    } else {
      // Transition to minimized state:
      pinkBubble.classList.remove("expanded");
      bubbleText.classList.remove("visible");
      clearButton.style.display = "none";
      let scale = pinkBubble.querySelector(".truthiness-scale");
      if (scale) {
        scale.style.display = "none";
      }
      // Force idle sizing inline for a perfect circle.
      pinkBubble.style.width = "60px";
      pinkBubble.style.height = "60px";
      pinkBubble.style.borderRadius = "50%";
    }
  }
});

// --- Clear Button Functionality --- 
clearButton.addEventListener("click", (event) => {
  // Clear the text and revert the bubble to idle state.
  bubbleText.innerText = "";
  bubbleText.classList.remove("visible");
  pinkBubble.classList.remove("expanded");
  bubbleState = "idle";
  isExpanded = false;
  clearButton.style.display = "none";
  let scale = pinkBubble.querySelector(".truthiness-scale");
  if (scale) {
    scale.style.display = "none";
  }
  // Reset inline dimensions for the idle (circular) look.
  pinkBubble.style.width = "60px";
  pinkBubble.style.height = "60px";
  pinkBubble.style.borderRadius = "50%";
});

// --- Listen for Analysis Result Messages --- 
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "ANALYSIS_RESULT") {
    const resultText = event.data.data;
    const formattedText = formatText(resultText);

    // Process truthiness score.
    pinkBubble.classList.remove("neutral-status", "true-status", "uncertain-status", "false-status");
    let score = 0.5;
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
    score = amplifyScore(score, 3);
    const hue = score * 120;
    pinkBubble.style.backgroundColor = `hsl(${hue}, 70%, 80%)`;
    
    // Create or update the truthiness scale indicator.
    let scale = pinkBubble.querySelector(".truthiness-scale");
    if (!scale) {
      scale = document.createElement("div");
      scale.className = "truthiness-scale";
      pinkBubble.appendChild(scale);
    }
    let indicator = scale.querySelector(".scale-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "scale-indicator";
      scale.appendChild(indicator);
    }
    indicator.style.left = (score * 100) + "%";
    
    // Ensure the scale is visible in the active, expanded state.
    scale.style.display = "block";

    // Clear any inline sizing to ensure the CSS rules for .expanded apply.
    pinkBubble.style.width = "";
    pinkBubble.style.height = "";
    pinkBubble.style.borderRadius = "";
    
    // Set bubble to active state and auto-expand.
    bubbleState = "active";
    isExpanded = true;
    pinkBubble.classList.add("expanded");
    // Immediately show text and buttons (no delay)
    bubbleText.classList.add("visible");
    clearButton.style.display = "block";
    scale.style.display = "block";
    typeWriter(formattedText, bubbleText);
  }
});
    

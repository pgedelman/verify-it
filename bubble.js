// Immediately inject CSS styles into the document
(function() {
    const style = document.createElement("style");
    style.textContent = `
      /* Basic bubble styling with a smooth background color transition */
      .pink-bubble {
        width: 60px;
        height: 60px;
        position: fixed;
        bottom: 100px;
        right: 100px;
        /* Removed the hardcoded background-color to allow dynamic coloring */
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        z-index: 9999;
        user-select: none;
        pointer-events: auto;
        transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease, background-color 0.3s ease;
        overflow: hidden;
      }
      
      /* Expanded state: transforms the circle into a rounded rectangle */
      .pink-bubble.expanded {
        width: 320px;
        height: 120px;  /* Minimum height when expanded */
        border-radius: 10px;
      }
      
      /* Drag boundary (only visible during dragging) */
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
      
      /* Text container inside the expanded bubble */
      .bubble-text {
        opacity: 0;
        transition: opacity 0.3s ease;
        font-size: 14px;
        color: #000;
        white-space: pre-wrap;  /* Preserve whitespace */
        overflow-wrap: break-word;
        height: 100%;
        width: 100%;
        overflow-y: auto;  /* Add vertical scrolling */
        max-height: 100%;  /* Constrain to container height */
        padding: 10px 10px 10px 10px;
        padding-right: 15px;  /* Prevent text under scrollbar */
      }
      
      /* Class to make text visible */
      .bubble-text.visible {
        opacity: 1;
      }
        
      /* --- Added: Truthiness Scale Styling --- */
      .truthiness-scale {
        position: absolute;
        bottom: 5px;
        left: 10px;
        right: 10px;
        height: 10px;
        /* Gradient from red (0°), through yellow (60°), to green (120°) */
        background: linear-gradient(to right, hsl(0, 70%, 80%), hsl(60, 70%, 80%), hsl(120, 70%, 80%));
        border: 1px solid #ccc;
        border-radius: 5px;
      }

      .scale-indicator {
        position: absolute;
        top: -3px;  /* Adjust this value if you want to shift the indicator vertically */
        width: 16px;
        height: 16px;
        background-color: #555;
        border-radius: 50%;
        transform: translateX(-50%);
      }
      
      /* --- NEW: Status based background colors --- */
      .pink-bubble.neutral-status {
        background-color: #f0f0f0;
      }
      .pink-bubble.true-status {
        background-color: #d4edda;
      }
      .pink-bubble.uncertain-status {
        background-color: #fff3cd;
      }
      .pink-bubble.false-status {
        background-color: #f8d7da;
      }
    `;
    document.head.appendChild(style);
})();
    
// Create the pink bubble element with a neutral default background
const pinkBubble = document.createElement("div");
pinkBubble.className = "pink-bubble neutral-status";
document.body.appendChild(pinkBubble);
    
// Create and append the drag boundary element
const dragBoundary = document.createElement("div");
dragBoundary.className = "drag-boundary";
document.body.appendChild(dragBoundary);
    
// Create the text container inside the bubble
const bubbleText = document.createElement("div");
bubbleText.className = "bubble-text";
pinkBubble.appendChild(bubbleText);
    
// Disable (and later re-enable) text selection during dragging
const disableTextSelection = () => {
  document.body.style.userSelect = "none";
};
const enableTextSelection = () => {
  document.body.style.userSelect = "";
};
    
// --- Drag-and-Drop Functionality ---
let isDragging = false;
let offsetX, offsetY;
    
// Add close button element
const closeButton = document.createElement("div");
closeButton.innerHTML = "×";
closeButton.style.cssText = `
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  font-size: 20px;
  padding: 0 5px;
  opacity: 0.5;
  transition: opacity 0.2s;
  z-index: 1;
`;
closeButton.addEventListener("mouseenter", () => closeButton.style.opacity = 1);
closeButton.addEventListener("mouseleave", () => closeButton.style.opacity = 0.5);
pinkBubble.appendChild(closeButton);
    
// Update the drag condition to work in both states
pinkBubble.addEventListener("mousedown", (event) => {
  // Prevent dragging when clicking the close button
  if (event.target === closeButton) return;
  isDragging = true;
  offsetX = event.clientX - pinkBubble.getBoundingClientRect().left;
  offsetY = event.clientY - pinkBubble.getBoundingClientRect().top;
  pinkBubble.style.cursor = "grabbing";
  dragBoundary.style.display = "block";
  disableTextSelection();
});
    
document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
  
    // Constrain movement within the drag boundary
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
    enableTextSelection();
  }
});
    
// Prevent accidental text selection on the bubble
pinkBubble.addEventListener("mousedown", (event) => {
  event.preventDefault();
});
    
// --- Close functionality --- 
closeButton.addEventListener("click", () => {
  // Cancel any ongoing typewriter effect before closing
  if (currentTypeWriter) {
    currentTypeWriter.cancelled = true;
    currentTypeWriter = null;
  }
  bubbleText.classList.remove("visible");
  pinkBubble.classList.remove("expanded");
  // Revert any status classes to our neutral background
  pinkBubble.classList.remove("true-status", "uncertain-status", "false-status");
  pinkBubble.classList.add("neutral-status");
  // Clear existing text after the closing transition
  setTimeout(() => {
    bubbleText.innerText = "";
  }, 300);
});
    
// --- Utility: Format the Text ---
// This function adds spaces between a lowercase (or digit) and an uppercase letter,
// and removes asterisks (which might be used for emphasis in markdown)
function formatText(text) {
  let formatted = text.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  formatted = formatted.replace(/\*(.*?)\*/g, "$1");
  return formatted;
}
/*   
// --- Utility: Typewriter Effect ---
function typeWriter(text, element, speed = 1) {
  // Reset any previous text
  element.innerText = "";
  let index = 0;
  // Create a controller object for cancellation
  const controller = { cancelled: false };
  currentTypeWriter = controller;

  function type() {
    // If cancelled, stop further scheduled typings
    if (controller.cancelled) return;
    if (index < text.length) {
      element.innerText += text.charAt(index);
      index++;
      // Auto-scroll to bottom as text grows
      element.scrollTop = element.scrollHeight;
      setTimeout(type, speed);
    }
  }
  type();
}
*/
    
// --- Utility: Amplify the Score ---
// This function amplifies small differences from 0.5 using the specified factor.
// For example, a slightly positive or negative score will be pushed further toward 1 or 0.
function amplifyScore(score, factor = 2) {
  let amplified = 0.5 + (score - 0.5) * factor;
  // Clamp the amplified score between 0 and 1
  return Math.min(Math.max(amplified, 0), 1);
}

// --- Listen for the Analysis Result Message ---
// Updated approach using a continuous color scale with an indicator and sensitivity amplification
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "ANALYSIS_RESULT") {
    const resultText = event.data.data;
    const formattedText = formatText(resultText);

    // Remove any previously applied status classes (if any)
    pinkBubble.classList.remove("neutral-status", "true-status", "uncertain-status", "false-status");

    // Process truthiness into a normalized score (0 = false/red, 1 = true/green)
    let score = 0.5; // Default uncertain state
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

    // Amplify the score for a more sensitive UI mapping (adjust factor as appropriate)
    score = amplifyScore(score, 3);

    // Set the bubble's background color: 0 (red, 0°) to 1 (green, 120°)
    const hue = score * 120;
    pinkBubble.style.backgroundColor = `hsl(${hue}, 70%, 80%)`;

    // Create/Update the truthiness scale for the visual cue
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
    // Position the indicator relative to the score from 0 to 100%
    indicator.style.left = (score * 100) + "%";

    // Expand the bubble so the scale and text become visible
    pinkBubble.classList.add("expanded");

    // Display the formatted text inside the bubble after the expansion transition
    setTimeout(() => {
      bubbleText.classList.add("visible");
      bubbleText.innerText = formattedText;
    }, 300);
  }
});
    
// Update CSS to handle close button and pointer events
const style = document.querySelector("style");
style.textContent += `
  .pink-bubble.expanded {
    height: 120px;  /* Minimum height when expanded */
    min-height: 120px;  /* Add minimum height constraint */
    resize: both;  /* Allow manual resizing */
  }
  .bubble-text {
    pointer-events: none;
  }
  .bubble-text.visible {
    pointer-events: auto;
  }
`;

// Add a global variable to control typewriter cancellation
let currentTypeWriter = null;
    

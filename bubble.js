// Immediately inject CSS styles into the document
(function() {
    const style = document.createElement("style");
    style.textContent = `
      /* Basic pink bubble styling */
      .pink-bubble {
        width: 60px;
        height: 60px;
        position: fixed;
        bottom: 100px;
        right: 100px;
        background-color: #f8d7da;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        z-index: 9999;
        user-select: none;
        pointer-events: auto;
        transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease;
        overflow: hidden;
      }
      
      /* Expanded state: transforms the circle into a rounded rectangle */
      .pink-bubble.expanded {
        width: 320px;
        height: 120px;
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
        padding: 10px;
        white-space: pre-wrap;  /* Preserve whitespace */
        overflow-wrap: break-word;
        height: 100%;
        width: 100%;
      }
      
      /* Class to make text visible */
      .bubble-text.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  })();
    
  // Create the pink bubble element
  const pinkBubble = document.createElement("div");
  pinkBubble.className = "pink-bubble";
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
    
  pinkBubble.addEventListener("mousedown", (event) => {
    // Only start dragging if the bubble is not expanded (to avoid interfering with text)
    if (!pinkBubble.classList.contains("expanded")) {
      isDragging = true;
      offsetX = event.clientX - pinkBubble.getBoundingClientRect().left;
      offsetY = event.clientY - pinkBubble.getBoundingClientRect().top;
      pinkBubble.style.cursor = "grabbing";
    
      // Show the drag boundary
      dragBoundary.style.display = "block";
    
      disableTextSelection();
    }
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
    
  // --- Utility: Format the Text ---
  // This function adds spaces between a lowercase (or digit) and an uppercase letter,
  // and removes asterisks (which might be used for emphasis in markdown)
  function formatText(text) {
    let formatted = text.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    formatted = formatted.replace(/\*(.*?)\*/g, "$1");
    return formatted;
  }
    
  // --- Utility: Typewriter Effect ---
  function typeWriter(text, element, speed = 50) {
    element.innerText = "";
    let index = 0;
    function type() {
      if (index < text.length) {
        element.innerText += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    }
    type();
  }
    
  // --- Listen for the Analysis Result Message ---
  // When a message of type "ANALYSIS_RESULT" is received, the bubble will expand
  // and then display the formatted text inside using a typewriter effect.
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "ANALYSIS_RESULT") {
      const resultText = event.data.data;
      const formattedText = formatText(resultText);
    
      // Expand the bubble by adding the "expanded" class
      pinkBubble.classList.add("expanded");
    
      // After the bubble expansion transition completes (300ms), show the text
      setTimeout(() => {
        bubbleText.classList.add("visible");
        typeWriter(formattedText, bubbleText, 50);
      }, 300);
    }
  });
    

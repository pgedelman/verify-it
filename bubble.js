// Pink Icon Bubble Code
const pinkBubble = Object.assign(document.createElement("div"), {
    className: "pink-bubble",
  });
  pinkBubble.style.width = "60px";
  pinkBubble.style.height = "60px";
  pinkBubble.style.position = "fixed";
  pinkBubble.style.bottom = "100px"; // Initial position
  pinkBubble.style.right = "100px"; // Initial position
  pinkBubble.style.backgroundColor = "#f8d7da"; // Pink background
  pinkBubble.style.borderRadius = "50%"; // Circle shape
  pinkBubble.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  pinkBubble.style.display = "flex";
  pinkBubble.style.justifyContent = "center";
  pinkBubble.style.alignItems = "center";
  pinkBubble.style.cursor = "grab";
  pinkBubble.style.zIndex = 9999; // Ensures it's always on top
  pinkBubble.style.userSelect = "none"; // Prevents text selection
  pinkBubble.style.pointerEvents = "auto"; // Ensure it interacts with the mouse
  
  // Add an icon to the pink bubble
  const bubbleIcon = Object.assign(document.createElement("img"), {
    src: "your-icon.png", // Replace with the actual path to your icon
    alt: "Icon",
  });
  bubbleIcon.style.width = "50%";
  bubbleIcon.style.height = "50%";
  pinkBubble.appendChild(bubbleIcon);
  
  // Add the pink bubble to the page
  document.body.appendChild(pinkBubble);
  
  // Drag-and-drop functionality for the pink bubble
  let isDragging = false;
  let offsetX, offsetY;
  
  // Create the drag boundary
  const dragBoundary = Object.assign(document.createElement("div"), {
    className: "drag-boundary",
  });
  dragBoundary.style.position = "fixed";
  dragBoundary.style.top = "50px"; // Adjust to keep below the search bar
  dragBoundary.style.left = "0";
  dragBoundary.style.right = "0";
  dragBoundary.style.bottom = "0";
  dragBoundary.style.border = "2px dashed rgba(0, 0, 0, 0.3)";
  dragBoundary.style.borderRadius = "10px";
  dragBoundary.style.zIndex = 9998;
  dragBoundary.style.display = "none"; // Initially hidden
  dragBoundary.style.pointerEvents = "none"; // Non-interactive
  
  document.body.appendChild(dragBoundary);
  
  // Prevent text selection during drag
  const disableTextSelection = () => {
    document.body.style.userSelect = "none"; // Disable text selection globally
  };
  
  const enableTextSelection = () => {
    document.body.style.userSelect = ""; // Re-enable text selection
  };
  
  // Start dragging
  pinkBubble.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - pinkBubble.getBoundingClientRect().left;
    offsetY = event.clientY - pinkBubble.getBoundingClientRect().top;
    pinkBubble.style.cursor = "grabbing";
  
    // Show the drag boundary
    dragBoundary.style.display = "block";
  
    // Disable text selection during drag
    disableTextSelection();
  });
  
  // Move the bubble and update the placement indicator
  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;
  
      // Constrain within the boundaries
      const boundary = dragBoundary.getBoundingClientRect();
      const iconWidth = pinkBubble.offsetWidth;
      const iconHeight = pinkBubble.offsetHeight;
  
      let newX = Math.min(Math.max(boundary.left, x), boundary.right - iconWidth);
      let newY = Math.min(Math.max(boundary.top, y), boundary.bottom - iconHeight);
  
      pinkBubble.style.left = `${newX}px`;
      pinkBubble.style.top = `${newY}px`;
    }
  });
  
  // Stop dragging
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      pinkBubble.style.cursor = "grab";
  
      // Hide the drag boundary
      dragBoundary.style.display = "none";
  
      // Re-enable text selection after drag
      enableTextSelection();
    }
  });
  
  // Prevent highlighting text on the icon itself
  pinkBubble.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

// Create the text container as a horizontal popup
const bubbleText = Object.assign(document.createElement("div"), {
    className: "bubble-text",
  });
  bubbleText.style.position = "absolute";
  bubbleText.style.width = "auto"; // Dynamic width
  bubbleText.style.maxWidth = "300px"; // Limit max width
  bubbleText.style.minHeight = "40px"; // Minimum height
  bubbleText.style.backgroundColor = "#fff";
  bubbleText.style.color = "#000";
  bubbleText.style.padding = "10px";
  bubbleText.style.borderRadius = "10px";
  bubbleText.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  bubbleText.style.display = "none"; // Initially hidden
  bubbleText.style.fontSize = "14px";
  bubbleText.style.overflowWrap = "break-word"; // Break long words
  bubbleText.style.whiteSpace = "normal"; // Allow normal wrapping
  bubbleText.style.transition = "all 0.3s ease";
  bubbleText.style.zIndex = "9999";
  bubbleText.style.left = "70px"; // Position the popup to the right of the pink bubble
  bubbleText.style.top = "50%"; // Center align vertically relative to bubble
  bubbleText.style.transform = "translateY(-50%)"; // Adjust for perfect centering
  
  // Append the text box to the pink bubble
  pinkBubble.appendChild(bubbleText);
  
  // Listen for the analysis result
  window.addEventListener("message", (event) => {
    if (event.data.type === "ANALYSIS_RESULT") {
      const resultText = event.data.data;
  
      // Format the resultText to add spaces (if necessary)
      const formattedText = resultText.replace(/(?<=\w)(?=[A-Z])/g, " "); // Example regex for formatting camel case
  
      // Show and update the text box
      bubbleText.innerText = ""; // Clear previous text
      bubbleText.style.display = "block"; // Show the text box
  
      let index = 0;
      function typeWriterEffect() {
        if (index < formattedText.length) {
          bubbleText.innerText += formattedText.charAt(index);
          index++;
          setTimeout(typeWriterEffect, 50); // Adjust speed
        }
      }
  
      // Start typing animation
      typeWriterEffect();
    }
  });
  
  
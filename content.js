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
import { GoogleGenerativeAI } from "@google/generative-ai";
 
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);


const analyzeButton = Object.assign(document.createElement("button"), {className: `analyze-button`});
analyzeButton.innerText = "Analyze";
analyzeButton.style.position = "absolute";
analyzeButton.style.zIndex = 1000;
analyzeButton.style.backgroundColor = "#4CAF50";
analyzeButton.style.color = "white";
analyzeButton.style.border = "none";
analyzeButton.style.padding = "5px 10px";
analyzeButton.style.borderRadius = "5px";
analyzeButton.style.cursor = "pointer";

document.addEventListener("mouseup", (event) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      console.log(selectedText);
      analyzeButton.style.left = `${event.pageX}px`;
      analyzeButton.style.top = `${event.pageY}px`;
      if (!document.body.contains(analyzeButton)) { 
        document.body.appendChild(analyzeButton);
        analyzeButton.addEventListener("click", () => {
          analyzeText(selectedText);
          document.body.removeChild(analyzeButton);
        });
      } 
    } else if (document.body.contains(analyzeButton)) { 
      document.body.removeChild(analyzeButton); 
    }
  });
  
  async function analyzeText(text) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Is this information true: ${text} ?`;

      const result = await model.generateContent(prompt);
      console.log(result.response.text());
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert("Failed to analyze text. Please try again.");
    }
  }
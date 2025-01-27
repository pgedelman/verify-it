// Listen for mouseup events (when the user stops highlighting)
document.addEventListener("mouseup", (event) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      // Create and position the "Analyze" button
      const analyzeButton = document.createElement("button");
      analyzeButton.innerText = "Analyze";
      analyzeButton.style.position = "absolute";
      analyzeButton.style.left = `${event.pageX}px`;
      analyzeButton.style.top = `${event.pageY}px`;
      analyzeButton.style.zIndex = 1000;
      analyzeButton.style.backgroundColor = "#4CAF50";
      analyzeButton.style.color = "white";
      analyzeButton.style.border = "none";
      analyzeButton.style.padding = "5px 10px";
      analyzeButton.style.borderRadius = "5px";
      analyzeButton.style.cursor = "pointer";
  
      // Add click event to the button
      analyzeButton.addEventListener("click", () => {
        analyzeText(selectedText);
        document.body.removeChild(analyzeButton); // Remove the button after clicking
      });
  
      document.body.appendChild(analyzeButton);
    }
  });
  
  // Function to send text to the AI API
  async function analyzeText(text) {
    try {
      // Replace with your AI API endpoint
      const response = await fetch("https://api.your-ai-service.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
  
      const result = await response.json();
      alert(`Analysis Result: ${result.message}`); // Display the result
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert("Failed to analyze text. Please try again.");
    }
  }
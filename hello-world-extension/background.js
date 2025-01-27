// Listen for messages from content.js or popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzeText") {
      // Call the AI backend (e.g., Google Gemini)
      analyzeText(request.text)
        .then((result) => sendResponse({ success: true, result }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
  
      return true; // Required to use sendResponse asynchronously
    } else if (request.action === "saveAPIKey") {
      // Save the API key to Chrome's storage
      chrome.storage.sync.set({ apiKey: request.apiKey }, () => {
        sendResponse({ success: true });
      });
      return true;
    } else if (request.action === "getAPIKey") {
      // Retrieve the API key from Chrome's storage
      chrome.storage.sync.get("apiKey", (data) => {
        sendResponse({ success: true, apiKey: data.apiKey });
      });
      return true;
    }
  });
  
  // Function to call the AI backend (e.g., Google Gemini)
  async function analyzeText(text) {
    // Retrieve the API key from storage
    const { apiKey } = await new Promise((resolve) => {
      chrome.storage.sync.get("apiKey", resolve);
    });
  
    if (!apiKey) {
      throw new Error("API key not found. Please set it in the settings.");
    }
  
    // Replace with your AI API endpoint (e.g., Google Gemini)
    const response = await fetch("https://api.your-ai-service.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to analyze text.");
    }
  
    const result = await response.json();
    return result.message; // Return the analysis result
  }
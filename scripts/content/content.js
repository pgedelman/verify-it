let currentAnalyzeDisplayType = "icon";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateAnalyzeDisplay") {
    currentAnalyzeDisplayType = message.display;
  }
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
  if (currentAnalyzeDisplayType === "icon") {
    if (event.target === analyzeButton) {
      const selectedText = window.getSelection().toString().trim();
      console.log(selectedText);
      analyzeText(selectedText);
      document.body.removeChild(analyzeButton);
      return;
    }
    
    // Use setTimeout to check the selection after the browser has processed the click
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      
      // Remove the button if there's no selected text
      if (!selectedText) {
        if (document.body.contains(analyzeButton)) {
          document.body.removeChild(analyzeButton);
        }
        return;
      }
      
      // Only add/move the button if there's still selected text
      analyzeButton.style.left = `${event.pageX}px`;
      analyzeButton.style.top = `${event.pageY}px`;
      if (!document.body.contains(analyzeButton)) {
        document.body.appendChild(analyzeButton);
      }
    }, 0);
  }
});

async function analyzeText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Updated prompt with detailed instructions and specifying a trailing number.
    const prompt = `You are a highly analytical fact-checking AI specialized in verifying the accuracy of claims, particularly those related to recent events, politics, media, and public discourse. Analyze the following claim: "${text}".

- If this claim pertains to news, politics or media, provide an objective and detailed explanation including any reputable references or sources available.
- If the claim does not clearly fall into these categories, perform a general factual analysis, highlighting any ambiguities or assumptions, and indicate if further verification might be necessary.
- In all cases, conclude with a clear determination regarding the truthfulness of the claim along with a summary of the evidence or reasoning.

**Important:** On the very last line of your response, output **only** a single number between 0 and 1. Here, 0 means completely false/unobjective, and 1 means completely true/objective. Do not include any additional text or commentary on that line.`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    console.log(responseText);

    // Improved extraction of truth score:
    // Split the response into lines, remove any empty lines,
    // then pick the last non-empty line as the truthiness value.
    const lines = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    let truthiness = 0; // default value in case parsing fails
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const parsedNumber = parseFloat(lastLine);
      if (!isNaN(parsedNumber) && parsedNumber >= 0 && parsedNumber <= 1) {
        truthiness = parsedNumber;
      }
    }

    // Send the analysis result to the bubble for display.
    window.postMessage({ type: "ANALYSIS_RESULT", data: responseText, truthiness }, "*");
    
    // Persist the history (including truthiness) using chrome.storage.local.
    try {
      chrome.storage.local.get("history", (data) => {
        let history = data.history || [];
        history.unshift({ input: text, output: responseText, truthiness });
        if (history.length > 10) {
          history = history.slice(0, 10);
        }
        chrome.storage.local.set({ history });
      });
    }
    catch (error) {
      console.error("Error storing history: ", error);
      alert("Query not stored in history.");
    }
  } catch (error) {
    console.error("Error analyzing text:", error);
    alert("Failed to analyze text. Please try again.");
  }
}

// Expose analyzeText so it can be called from the context menu.
window.analyzeText = analyzeText;
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
  if (event.target === analyzeButton) {
    console.log(selectedText);
    analyzeText(selectedText);
    document.body.removeChild(analyzeButton);
    return;
  }
  if (selectedText) {
    analyzeButton.style.left = `${event.pageX}px`;
    analyzeButton.style.top = `${event.pageY}px`;
    if (!document.body.contains(analyzeButton)) {
      document.body.appendChild(analyzeButton);
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
    const responseText = await result.response.text();

    console.log(responseText);

    // Send the result to bubble.js
    window.postMessage({ type: "ANALYSIS_RESULT", data: responseText }, "*");
  } catch (error) {
    console.error("Error analyzing text:", error);
    alert("Failed to analyze text. Please try again.");
  }
}
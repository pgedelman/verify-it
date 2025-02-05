let menuCreated = false;

function createContextMenu() {
  if (!menuCreated) {
    chrome.contextMenus.create(
      {
        id: "analyze-verifyit",
        title: "Analyze - VerifyIt",
        contexts: ["selection"]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Error creating context menu item:", chrome.runtime.lastError);
        } else {
          menuCreated = true;
          console.log("Context menu item created.");
        }
      }
    );
  }
}

// Function to remove the context menu item.
function removeContextMenu() {
  if (menuCreated) {
    chrome.contextMenus.remove("analyze-verifyit", () => {
      if (chrome.runtime.lastError) {
        console.error("Error removing context menu item:", chrome.runtime.lastError);
      } else {
        menuCreated = false;
        console.log("Context menu item removed.");
      }
    });
  }
}

// Listen for messages to toggle the context menu item.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle-analyze-display") {
    if (message.show) {
      createContextMenu();
    } else {
      removeContextMenu();
    }

    // Relay the new analyze display setting to the content script.
    const displayType = message.show ? "right-click" : "icon";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "updateAnalyzeDisplay", display: displayType });
      });
    });
  }
});

// Optional: handle clicks on the context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-verifyit") {
    // When the context menu option is clicked, execute the analyzeText() function in the content script with the selected text.
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedText) => {
         // Call analyzeText() from the content script's context.
         if (typeof analyzeText === 'function') {
            analyzeText(selectedText);
         } else {
            console.error("analyzeText function is not available in the page context.");
         }
      },
      args: [info.selectionText]
    });
  }
});
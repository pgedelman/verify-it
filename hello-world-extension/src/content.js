// content.js

// Function to get the selected text on the page
function getSelectedText() {
    const selection = window.getSelection();
    return selection.toString();  // Returns the highlighted (selected) text
  }
  
  // Listen for mouseup event, which happens when the user finishes selecting text
  document.addEventListener('mouseup', () => {
    const selectedText = getSelectedText();
    if (selectedText) {
      console.log('Selected Text: ', selectedText);  // Log the selected text
    }
  });
  
  // Optionally, listen for keyup event to detect text selection using keyboard (e.g., Shift + Arrow keys)
  document.addEventListener('keyup', () => {
    const selectedText = getSelectedText();
    if (selectedText) {
      console.log('Selected Text: ', selectedText);  // Log the selected text
    }
  });
  
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "open-popup") {
    chrome.action.openPopup();
  }
});
// This service worker is only used for the playwright test,
// and doesn't have any functionality.
// The test requires a service worker to get an extension ID.

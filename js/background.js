chrome.commands.onCommand.addListener((command) => {
    if (command === "start-selection") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "startSelection" });
      });
    }
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "captureVisibleTab") {
        setTimeout(() => {
            chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, function(screenshotUrl) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    sendResponse({ error: chrome.runtime.lastError });
                } else {
                    sendResponse({ screenshot: screenshotUrl });
                }
            });
        }, 100);
        return true;
    }
    if (message.type === "openPop") {
        chrome.action.openPopup();
    }
});

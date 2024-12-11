// Lắng nghe sự kiện phím tắt
chrome.commands.onCommand.addListener((command) => {
    if (command === "start-selection") {
      // Lấy tab hiện tại khi nhấn phím tắt
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Gửi thông điệp đến content script để bắt đầu chọn vùng
        chrome.tabs.sendMessage(tabs[0].id, { type: "startSelection" });
      });
    }
  });
  
  // Lắng nghe thông điệp yêu cầu chụp ảnh từ content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "captureVisibleTab") {
      // Lấy ảnh chụp màn hình của tab hiện tại
      chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, function(screenshotUrl) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ error: chrome.runtime.lastError });
        } else {
          sendResponse({ screenshot: screenshotUrl });
        }
      });
      return true;  // Đảm bảo sendResponse hoạt động bất đồng bộ
    }
  });
  
  // Hàm để mở cửa sổ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "openPopup") {
      chrome.windows.create({
          url: "popup.html", // Đường dẫn file HTML của popup
          type: "popup",
          width: 400,
          height: 600
      });
      sendResponse({ status: "Popup opened" });
  }
});

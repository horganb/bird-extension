chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL("site/build/index.html")
    });
  } else if (details.reason === 'update') {
    // extension is updated
  }
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.seen) {
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, msg);
      });
    });
    chrome.action.setBadgeBackgroundColor({ color: '#00bcd4' });
    chrome.action.setBadgeText({ text: '!' });
  }
});

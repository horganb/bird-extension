chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'https://birdwatcher-site.herokuapp.com/',
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
  }
});

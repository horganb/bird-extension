export const getDomain = url => {
  return new URL(url).hostname;
};

export const unavailableURLs = [
  'https://chrome.google.com/webstore',
  'chrome://',
];

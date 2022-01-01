export const getDomain = url => {
  return new URL(url).hostname;
};

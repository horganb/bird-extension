import { LOOP_SPEED } from './contentScript';

export const localURL = url => chrome.runtime.getURL(url);

export const getPlatforms = (el = document.documentElement) => {
  const platforms = [];
  const elementVisible = isElementVisible(el);
  el.childNodes.forEach(childNode => {
    if (
      elementVisible &&
      childNode.nodeType === 3 &&
      isValidTextNode(childNode)
    ) {
      const textNodeRange = document.createRange();
      textNodeRange.selectNodeContents(childNode);
      const textNodeRects = textNodeRange.getClientRects();
      for (let i = 0; i < textNodeRects.length; i++) {
        const textNodeRect = textNodeRects[i];
        if (isRectInViewport(textNodeRect) && textNodeRect.width) {
          const width = textNodeRect.width;
          const x = textNodeRect.left + document.documentElement.scrollLeft;
          const y = textNodeRect.top + document.documentElement.scrollTop;
          platforms.push({ x, y, width, childNode, el });
        }
      }
    } else if (childNode.nodeType === 1) {
      platforms.push(...getPlatforms(childNode));
    }
  });
  return platforms;
};

export const isRectInViewport = rect => {
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
};

export const isValidTextNode = node => {
  return node.nodeValue.replace(/\u00a0/g, ' ').trim() ? true : false;
};

/** Determine if an element is visible by the user. */
export const isElementVisible = elem => {
  const style = getComputedStyle(elem);
  if (style.display === 'none') return false;
  if (style.visibility !== 'visible') return false;
  if (style.opacity < 0.1) return false;
  // if (parseInt(style.color.split(',')[3]) === 0) return false;
  // TODO: move all this viewport comparison logic to the text node rects
  if (
    elem.clientWidth +
      elem.clientHeight +
      elem.getBoundingClientRect().height +
      elem.getBoundingClientRect().width ===
    0
  ) {
    return false;
  }
  const elemCenter = {
    x: elem.getBoundingClientRect().left + elem.clientWidth / 2,
    y: elem.getBoundingClientRect().top + elem.clientHeight / 2,
  };
  if (elemCenter.x < 0) return false;
  if (
    elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)
  )
    return false;
  if (elemCenter.y < 0) return false;
  if (
    elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)
  )
    return false;
  // TODO: use x and y from text node rect
  return isElementAtPoint(elem, elemCenter.x, elemCenter.y);
};

/** Determines whether the given element is visible (i.e. topmost) at the given point. */
const isElementAtPoint = (el, x, y) => {
  // TODO: use node.contains (return el.contains(pointContainer))
  let pointContainer = document.elementFromPoint(x, y);
  do {
    if (pointContainer === el) return true;
    // eslint-disable-next-line no-cond-assign
  } while ((pointContainer = pointContainer?.parentNode));
  return false;
};

/** Calls the given callback once the page is stable, i.e. the setInterval method calls its callback at an expected rate. */
const waitUntilPageStable = callback => {
  const TOLERANCE = LOOP_SPEED;
  const STABLE_COUNT_GOAL = 75; // the number of correctly timed setInterval invocations required

  let lastTime = Date.now();
  let stableCount = 0;
  const testInterval = setInterval(() => {
    const diff = Date.now() - lastTime;
    lastTime = Date.now();
    if (diff < LOOP_SPEED + TOLERANCE) {
      stableCount++;
    } else {
      stableCount = 0;
    }
    if (stableCount === STABLE_COUNT_GOAL) {
      clearInterval(testInterval);
      callback();
    }
  }, LOOP_SPEED);
};

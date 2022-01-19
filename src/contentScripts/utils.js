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

let lastScrollTime;

window.addEventListener('scroll', () => {
  lastScrollTime = new Date().getTime();
});

export const isScrolling = () => {
  return lastScrollTime && new Date().getTime() < lastScrollTime + 250;
};

// The below code may want to be used at some point for getting visible platforms whenever the document changes.

// export const visiblePlatforms = Platform.getVisiblePlatforms()[0];

// let hasChanges = false;

// const watchForChanges = () => {
//   const targetNode = Array.from(document.body.children).filter(
//     el => el.id !== 'bird-ext'
//   );
//   const config = { attributes: true, childList: true, subtree: true };
//   const callback = function (mutationsList, observer) {
//     // Use traditional 'for loops' for IE 11
//     for (const mutation of mutationsList) {
//       hasChanges = true;
//       // if (mutation.type === 'childList') {
//       //   console.log('A child node has been added or removed.', mutation);
//       // } else if (mutation.type === 'attributes') {
//       //   console.log(
//       //     'The ' + mutation.attributeName + ' attribute was modified.'
//       //   );
//       // }
//     }
//   };

//   const observer = new MutationObserver(callback);
//   observer.observe(document.body, { attributes: true });
//   targetNode.forEach(el => {
//     observer.observe(el, config);
//   });
//   // observer.observe(targetNode, config);
// };

// setInterval(() => {
//   if (hasChanges) {
//     console.log('has changes');
//     hasChanges = false;
//     visiblePlatforms.splice(
//       0,
//       visiblePlatforms.length,
//       ...Platform.getVisiblePlatforms()[0]
//     );
//   }
// }, 10);

// watchForChanges();

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
export const htmlToElement = html => {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
};

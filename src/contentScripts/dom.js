import { localURL } from './utils';


// TODO: add shadow dom

/**
 * IDEA:
 * When idle, make parent block the nearest scrollable container, then absolutely position relative to that
 */


const birdContainer = document.createElement('div');
birdContainer.id = 'bird-ext';
// const shadowDom = birdContainer.attachShadow({ mode: 'open' });
document.body.appendChild(birdContainer);

// Apply external styles to the shadow dom
const linkElem = document.createElement('link');
linkElem.setAttribute('rel', 'stylesheet');
linkElem.setAttribute('href', localURL('src/contentScripts/contentScriptStyles.css'));

// // Attach the created element to the shadow dom
// shadowDom.appendChild(linkElem);

// export default shadowDom;

// birdContainer.appendChild(linkElem);
// document.body.appendChild(linkElem);
document.head.appendChild(linkElem);
export default birdContainer;

// const canvas = document.createElement('canvas');
// canvas.id = 'bird-canvas';
// canvas.style.position = 'fixed';
// canvas.style.pointerEvents = 'none';
// canvas.style.top = 0;
// canvas.style.left = 0;
// canvas.style.zIndex = 2147483647;
// shadowDom.appendChild(canvas);
// const canvasContext = canvas.getContext("2d");
// canvasContext.canvas.width = window.innerWidth;
// canvasContext.canvas.height = window.innerHeight;

// export { canvasContext, canvas };
// canvasContext.moveTo(0, 0);
// canvasContext.lineTo(200, 100);
// canvasContext.stroke();

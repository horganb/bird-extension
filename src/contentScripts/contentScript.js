import { randomBirdType } from './birdType';
import Bird, { ACTION_FACTOR } from './bird';
import './contentScriptStyles.scss';
import { defaultSettings } from '../defaultSettings';
import { getDomain } from '../utils';
import { localURL } from './utils';

export const gameOptions = { ...defaultSettings };

let activeBirds = [];
let toRemove = [];
let gameInterval;
let spawnTimeout;
let lastTime = 0;
let birdsEnabled = false;
let documentReady = false;

export const queueRemoval = bird => {
  toRemove.push(bird);
};

const spawnRandomBird = () => {
  randomBirdType().then(type => {
    const newBird = new Bird(type);
    activeBirds.push(newBird);
  });
};

const mainLoop = timeStamp => {
  const loopSpeed = Math.min(timeStamp - lastTime, 40); // limit this value to prevent choppy visuals
  lastTime = timeStamp;

  if (chrome.runtime.id === undefined) {
    // if the extension was deactivated, remove birds.
    stopBirds();
    return;
  }

  const fullscreen = window.innerHeight === screen.height;
  if (fullscreen) {
    // pause in fullscreen
    removeBirds();
    return;
  }

  if (
    activeBirds.length < gameOptions.maxBirds &&
    Math.random() < 0.55 * ACTION_FACTOR
  ) {
    spawnRandomBird();
  }

  activeBirds.forEach(bird => {
    bird.update(loopSpeed);
  });

  activeBirds = activeBirds.filter(bird => !toRemove.includes(bird));
  // remove birds that exceed the maxBirds setting
  for (let i = activeBirds.length - 1; i >= gameOptions.maxBirds; i--) {
    activeBirds[i].remove();
    activeBirds.pop();
  }
  toRemove = [];

  gameInterval = requestAnimationFrame(mainLoop);
};

const startBirds = () => {
  if (!birdsEnabled) {
    gameInterval = requestAnimationFrame(mainLoop);
    spawnTimeout = setTimeout(() => {
      // spawn bird after some time if none have spawned yet
      if (activeBirds.length === 0) {
        spawnRandomBird();
      }
    }, 1500);
    birdsEnabled = true;
  }
};

const removeBirds = () => {
  activeBirds.forEach(bird => {
    bird.remove();
  });
  activeBirds = [];
};

const stopBirds = () => {
  if (birdsEnabled) {
    removeBirds();
    cancelAnimationFrame(gameInterval);
    clearTimeout(spawnTimeout);
    birdsEnabled = false;
  }
};

const getCurrentDomain = () => {
  return getDomain(window.location.href);
};

const enabledOnThisSite = options => {
  return !options.blockedSites.includes(getCurrentDomain());
};

chrome.runtime.onMessage.addListener(settings => {
  Object.assign(gameOptions, settings);

  // if birds are enabled/disabled, this should take effect immediately
  if (documentReady) {
    if (!gameOptions.enabled || !enabledOnThisSite(gameOptions)) {
      stopBirds();
    } else {
      startBirds();
    }
  }
});

const docReadyInterval = setInterval(() => {
  // wait for the document to be loaded, then start spawning
  if (document.readyState === 'complete') {
    clearInterval(docReadyInterval);
    chrome.storage.local.get(null, settings => {
      documentReady = true;
      Object.assign(gameOptions, settings);
      if (gameOptions.enabled && enabledOnThisSite(gameOptions)) {
        startBirds();
      }
    });
  }
}, 10);

let selectedBird;

const selectBird = bird => {
  selectedBird = bird;
  activeBirds.forEach(b => b.setSelected(false));
  bird?.setSelected(true);
};

// exchange data with popup inspector
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'birdInspector') {
    port.onMessage.addListener(function (msg) {
      if (msg.getBird) {
        if (!selectedBird || !activeBirds.includes(selectedBird)) {
          selectBird(activeBirds[0]);
        }
        port.postMessage({
          image: selectedBird?.getFrameURL(),
          transform: selectedBird?.getTransform(),
          name: selectedBird?.type.name,
          species: selectedBird?.type.species,
          index: activeBirds.indexOf(selectedBird),
          numBirds: activeBirds.length,
        });
      }
      if (msg.left) {
        const currentIndex = activeBirds.indexOf(selectedBird);
        if (currentIndex === 0) {
          selectBird(activeBirds[activeBirds.length - 1]);
        } else {
          selectBird(activeBirds[currentIndex - 1]);
        }
      }
      if (msg.right) {
        const currentIndex = activeBirds.indexOf(selectedBird);
        selectBird(activeBirds[(currentIndex + 1) % activeBirds.length]);
      }
    });
    port.onDisconnect.addListener(() => {
      selectBird(null);
    });
  }
});

// Load font

const font = new FontFace(
  'Quicksand',
  `url(${localURL(
    'fonts/Quicksand/static/Quicksand-Regular.ttf'
  )}) format("truetype")`
);

font.load().then(loaded => {
  document.fonts.add(loaded);
});

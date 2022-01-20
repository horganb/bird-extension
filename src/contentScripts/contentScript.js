import { randomBirdType } from './birdType';
import Bird, { ACTION_FACTOR } from './bird';
import './contentScriptStyles.scss';
import { defaultSettings } from '../defaultSettings';
import { getDomain } from '../utils';
import { localURL } from './utils';

export const gameOptions = { ...defaultSettings };

let activeBirds = [];
let toRemove = [];

export const queueRemoval = bird => {
  toRemove.push(bird);
};

const spawnRandomBird = () => {
  randomBirdType().then(type => {
    const newBird = new Bird(type);
    activeBirds.push(newBird);
  });
};

let lastTime = 0;

const mainLoop = timeStamp => {
  const loopSpeed = timeStamp - lastTime;
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

  requestAnimationFrame(mainLoop);
};

let gameInterval;

const startBirds = () => {
  requestAnimationFrame(mainLoop);
  setTimeout(() => {
    // spawn bird after some time if none have spawned yet
    if (activeBirds.length === 0) {
      spawnRandomBird();
    }
  }, 1500);
};

const removeBirds = () => {
  activeBirds.forEach(bird => {
    bird.remove();
  });
  activeBirds = [];
};

export const stopBirds = () => {
  removeBirds();
  clearInterval(gameInterval);
};

const getCurrentDomain = () => {
  return getDomain(window.location.href);
};

const enabledOnThisSite = options => {
  return !options.blockedSites.includes(getCurrentDomain());
};

chrome.runtime.onMessage.addListener(settings => {
  if (settings.enabled !== undefined && enabledOnThisSite(gameOptions)) {
    if (settings.enabled && !gameOptions.enabled) {
      startBirds();
    } else if (!settings.enabled && gameOptions.enabled) {
      stopBirds();
    }
  }

  if (settings.blockedSites !== undefined && gameOptions.enabled) {
    if (enabledOnThisSite(settings) && !enabledOnThisSite(gameOptions)) {
      startBirds();
    } else if (!enabledOnThisSite(settings) && enabledOnThisSite(gameOptions)) {
      stopBirds();
    }
  }

  Object.assign(gameOptions, settings);
});

const docReadyInterval = setInterval(() => {
  // wait for the document to be loaded, then start spawning
  if (document.readyState === 'complete') {
    clearInterval(docReadyInterval);
    chrome.storage.local.get(null, settings => {
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

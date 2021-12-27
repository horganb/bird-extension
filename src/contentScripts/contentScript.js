import { randomBirdType } from './birdType';
import Bird, { ACTION_FACTOR } from './bird';
import './contentScriptStyles.css';

export const LOOP_SPEED = 10;
export const MAX_BIRDS = 3;

export const gameOptions = {};

// class TimerEvent {
//   constructor()

//   isUp
// }

// addTimer

let activeBirds = [];
let toRemove = [];

export const queueRemoval = bird => {
  toRemove.push(bird);
};

const spawn = type => {
  const newBird = new Bird(type);
  activeBirds.push(newBird);
};

const mainLoop = () => {
  const fullscreen = window.innerHeight === screen.height;
  if (fullscreen) {
    // pause in fullscreen
    removeBirds();
    return;
  }

  if (activeBirds.length < MAX_BIRDS && Math.random() < 0.5 * ACTION_FACTOR) {
    spawn(randomBirdType());
  }
  activeBirds.forEach(bird => {
    bird.update();
  });
  activeBirds = activeBirds.filter(bird => !toRemove.includes(bird));
  toRemove = [];
};

let gameInterval;

const startBirds = () => {
  gameInterval = setInterval(mainLoop, LOOP_SPEED);
};

const removeBirds = () => {
  activeBirds.forEach(bird => {
    bird.remove();
  });
  activeBirds = [];
};

const stopBirds = () => {
  removeBirds();
  clearInterval(gameInterval);
};

chrome.runtime.onMessage.addListener(settings => {
  Object.assign(gameOptions, settings);
  if (settings.enabled) {
    startBirds();
  } else if (settings.enabled === false) {
    stopBirds();
  }
});

chrome.storage.local.get(null, settings => {
  Object.assign(gameOptions, settings);
  if (settings.enabled) {
    startBirds();
  }
});

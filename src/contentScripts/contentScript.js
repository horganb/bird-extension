import { BLUE_JAY } from './birdType';
import Bird from './bird';

export const LOOP_SPEED = 10;
export const MAX_BIRDS = 3;

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
  if (activeBirds.length < MAX_BIRDS && Math.random() < 0.005) {
    spawn(BLUE_JAY);
  }
  activeBirds.forEach(bird => {
    bird.update();
  });
  activeBirds = activeBirds.filter(bird => !toRemove.includes(bird));
  toRemove = [];
};

setInterval(mainLoop, LOOP_SPEED);

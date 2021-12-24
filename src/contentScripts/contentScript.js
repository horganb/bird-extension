import { BLUE_JAY } from './birdType';
import Bird from './bird';

export const LOOP_SPEED = 10;

// class TimerEvent {
//   constructor()
// }

const activeBirds = [];

const spawn = type => {
  const newBird = new Bird(type);
  activeBirds.push(newBird);
};

const mainLoop = () => {
  if (activeBirds.length === 0) {
    spawn(BLUE_JAY);
    spawn(BLUE_JAY);
  }
  activeBirds.forEach(bird => {
    bird.update();
  });
};

setInterval(mainLoop, LOOP_SPEED);
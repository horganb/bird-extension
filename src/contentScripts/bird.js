import { localURL } from './utils';
import dom from './dom';
import { LOOP_SPEED, queueRemoval } from './contentScript';
import BirdType from './birdType'; // eslint-disable-line no-unused-vars
import { Platform, PlatformLocation, Point } from './location';

const BIRD_SIZE = 16;
export const ACTION_FACTOR = 0.002;

const ActionTypes = {
  FLYING: 'flying',
  FLYING_OFFSCREEN: 'flying_offscreen',
  IDLE: 'idle',
  EATING: 'eating',
};

const Directions = {
  LEFT: 'left',
  RIGHT: 'right',
};

const ActionTimers = {
  [ActionTypes.IDLE]: [
    {
      minimum: 1000,
      frequency: 2 * ACTION_FACTOR,
      action: bird => bird.switchDirection(),
    },
    {
      minimum: 3000,
      frequency: ACTION_FACTOR,
      action: bird => bird.flyToRandomPlatform(),
    },
    {
      minimum: 3000,
      frequency: 0.5 * ACTION_FACTOR,
      action: bird => bird.flyOffscreen(),
    },
    {
      minimum: 500,
      frequency: 0.2 * ACTION_FACTOR,
      action: bird => bird.setAction(ActionTypes.EATING),
    },
  ],
  [ActionTypes.EATING]: [
    {
      minimum: (9 / 12) * 1000,
      frequency: 1,
      action: bird => bird.setAction(ActionTypes.IDLE),
    },
  ],
};

const getTimersForAction = action => ActionTimers[action] || [];

/** A single bird. */
export default class Bird {
  /**
   * Creates and spawns a bird.
   *
   * @param {BirdType} type Type of bird.
   */
  constructor(type) {
    const birdElement = document.createElement('IMG');
    birdElement.className = 'bird-ext-bird';
    dom.appendChild(birdElement);

    this.element = birdElement;
    this.location = this.getEdgePoint();
    this.lastLocation = this.location.toPoint();
    this.xSpeed = type.speed * LOOP_SPEED;
    this.ySpeed = type.speed * LOOP_SPEED * 0.8;
    this.imagePath = type.imagePath;
    this.action = null;
    this.subAction = null;
    this.destination = null;
    this.direction = null;
    this.actionTimers = [];

    this.flyToRandomPlatform();
  }

  // Public methods

  getTimerEvents() {}

  update() {
    this.incrementTimers();
    if (this.action === ActionTypes.FLYING) {
      if (
        !this.destination.isVisible() &&
        this.subAction !== ActionTypes.FLYING_OFFSCREEN
      ) {
        this.flyToRandomPlatform();
      }
      this.moveTowardDestination();
      if (this.location.equals(this.destination)) {
        if (this.subAction === ActionTypes.FLYING_OFFSCREEN) {
          this.remove();
        } else {
          this.setAction(ActionTypes.IDLE);
          this.location = this.destination;
        }
      }
    } else if (this.action === ActionTypes.IDLE) {
      if (
        !this.location.isVisible() ||
        !this.location.equals(this.lastLocation, 0.01)
      ) {
        this.flyToRandomPlatform();
      } else {
        this.lastLocation = this.location.toPoint();
      }
    }
    this.updateStyles();
  }

  flyTo(x, y) {
    this.flyToLocation(new Point(x, y));
  }

  remove() {
    this.element.remove();
    queueRemoval(this);
  }

  // Private methods

  /** Returns a random Point on the edge of the screen. */
  getEdgePoint() {
    const x = Math.floor(Math.random() * 2)
      ? 0
      : document.documentElement.clientWidth - this.getWidth();
    const y =
      Math.floor(Math.random() * document.documentElement.clientHeight) +
      document.documentElement.scrollTop;
    return new Point(x, y);
  }

  getWidth() {
    return BIRD_SIZE;
    // return parseInt(window.getComputedStyle(this.element).width);
  }

  getHeight() {
    return BIRD_SIZE;
    // return parseInt(window.getComputedStyle(this.element).height);
  }

  /**
   *
   * @param {Dot} location
   */
  flyToLocation(location) {
    this.location = this.location.toPoint();
    this.destination = location;
    this.setAction(ActionTypes.FLYING);
  }

  flyToRandomPlatform() {
    const validPlatforms = Platform.getVisiblePlatforms();
    const targetPlatform =
      validPlatforms[Math.floor(Math.random() * validPlatforms.length)];
    if (!targetPlatform) return;
    const destination = PlatformLocation.generateRandom(targetPlatform);
    this.flyToLocation(destination);
  }

  flyOffscreen() {
    this.flyToLocation(this.getEdgePoint());
    this.subAction = ActionTypes.FLYING_OFFSCREEN;
  }

  switchDirection() {
    if (this.direction === Directions.LEFT) {
      this.direction = Directions.RIGHT;
    } else {
      this.direction = Directions.LEFT;
    }
  }

  incrementTimers() {
    for (let i = 0; i < this.actionTimers.length; i++) {
      this.actionTimers[i] += LOOP_SPEED;
      const timerData = getTimersForAction(this.action)[i];
      if (
        this.actionTimers[i] > timerData.minimum &&
        Math.random() < timerData.frequency
      ) {
        this.actionTimers[i] = 0;
        timerData.action(this);
      }
    }
  }

  setAction(action) {
    this.action = action;
    this.subAction = null;
    let filename;
    if (action === ActionTypes.FLYING) {
      filename = 'flying.gif';
    } else if (action === ActionTypes.IDLE) {
      filename = 'standing.png';
      this.lastLocation = this.location.toPoint();
    } else if (action === ActionTypes.EATING) {
      filename = 'eating.gif';
    }
    this.element.src = localURL(
      `src/images/birds/${this.imagePath}/${filename}`
    );
    this.actionTimers = new Array(getTimersForAction(action).length).fill(0);
  }

  faceDestination() {
    if (this.destination.x > this.location.x) {
      this.direction = Directions.RIGHT;
    } else {
      this.direction = Directions.LEFT;
    }
  }

  getDistanceFromDest(axis) {
    return this.destination[axis] - this.location[axis];
  }

  moveInDirectionTowardDest(axis, amount) {
    const remaining = this.getDistanceFromDest(axis);
    const distanceRemaining = Math.abs(remaining);
    const direction = remaining > 0 ? 1 : -1;
    this.location[axis] += Math.min(amount, distanceRemaining) * direction;
  }

  moveTowardDestination() {
    this.faceDestination();

    const xDistance = Math.abs(this.getDistanceFromDest('x'));
    const yDistance = Math.abs(this.getDistanceFromDest('y'));

    const horizTimeToDest = xDistance / this.xSpeed;
    const vertTimeToDest = yDistance / this.ySpeed;

    const ySpeedFactor = Math.min(1, vertTimeToDest / horizTimeToDest);
    const xSpeedFactor = Math.min(1, horizTimeToDest / vertTimeToDest);

    this.moveInDirectionTowardDest('x', this.xSpeed * xSpeedFactor);
    this.moveInDirectionTowardDest('y', this.ySpeed * ySpeedFactor);
  }

  updateStyles() {
    const elementStyle = this.element.style;
    Object.assign(elementStyle, {
      transform:
        this.direction === Directions.RIGHT ? 'scaleX(-1)' : 'scaleX(1)',
    });
    if (this.action === ActionTypes.FLYING) {
      const realLeft = this.location.x - this.element.clientWidth / 2;
      const realTop = this.location.y - this.element.clientHeight;
      Object.assign(elementStyle, {
        left: `${realLeft}px`,
        top: `${realTop}px`,
      });
    }
  }
}

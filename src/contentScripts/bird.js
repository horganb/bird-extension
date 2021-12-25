import { localURL } from './utils';
import dom from './dom';
import { LOOP_SPEED, queueRemoval } from './contentScript';
import BirdType from './birdType'; // eslint-disable-line no-unused-vars
import { Platform, PlatformLocation, Point } from './location';

const ActionTypes = {
  FLYING: 'flying',
  FLYING_OFFSCREEN: 'flying_offscreen',
  IDLE: 'idle',
};

const Directions = {
  LEFT: 'left',
  RIGHT: 'right',
};

const ActionTimers = {
  [ActionTypes.IDLE]: [
    {
      minimum: 500,
      frequency: 0.02,
      action: bird => bird.switchDirection(),
    },
    {
      minimum: 3000,
      frequency: 0.01,
      action: bird => bird.flyToRandomPlatform(),
    },
    {
      minimum: 3000,
      frequency: 0.005,
      action: bird => bird.flyOffscreen(),
    },
  ],
};

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
    const computedStyle = window.getComputedStyle(birdElement);

    const initialX = Math.floor(Math.random() * 2) ? 0 : window.innerWidth;
    const initialY =
      Math.floor(Math.random() * window.innerHeight) +
      document.documentElement.scrollTop;
    this.location = new Point(initialX, initialY);
    this.lastLocation = this.location.toPoint();
    this.width = computedStyle.width;
    this.height = computedStyle.height;
    this.xSpeed = type.speed * LOOP_SPEED;
    this.ySpeed = type.speed * LOOP_SPEED * 0.8;
    this.element = birdElement;
    this.imagePath = type.imagePath;
    this.action = null;
    this.subAction = null;
    this.destination = null;
    this.direction = null;
    this.actionTimers = [];

    this.flyToRandomPlatform();

    document.addEventListener('click', e => {
      this.flyTo(e.pageX, e.pageY);
    });
  }

  // Public methods

  getTimerEvents() {}

  update() {
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
      this.incrementTimers();
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

  // Private methods

  remove() {
    this.element.remove();
    queueRemoval(this);
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
    const x = Math.floor(Math.random() * 2) ? 0 : window.innerWidth;
    const y =
      Math.floor(Math.random() * window.innerHeight) +
      document.documentElement.scrollTop;
    this.flyToLocation(new Point(x, y));
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
      const timerData = ActionTimers[this.action][i];
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
    }
    this.element.src = localURL(
      `src/images/birds/${this.imagePath}/${filename}`
    );
    const timersForAction = ActionTimers[action] || [];
    this.actionTimers = new Array(timersForAction.length).fill(0);
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
    if (this.action !== ActionTypes.IDLE) {
      const realLeft = this.location.x - this.element.clientWidth / 2;
      const realTop = this.location.y - this.element.clientHeight;
      Object.assign(elementStyle, {
        left: `${realLeft}px`,
        top: `${realTop}px`,
      });
    }
  }
}

import { localURL } from './utils';
import dom from './dom';
import { gameOptions, LOOP_SPEED, queueRemoval } from './contentScript';
import { Platform, PlatformLocation, Point } from './location';
import { defaultSettings } from '../defaultSettings';

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

let mousePosition;

/** A single bird. */
export default class Bird {
  /**
   * Creates and spawns a bird.
   *
   * @param {Object} type Type of bird.
   */
  constructor(type) {
    const birdElement = document.createElement('IMG');
    birdElement.className = 'bird-ext-bird';
    dom.appendChild(birdElement);

    this.type = type;
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
    this.newBird = false;
    this.newBirdIndicator = null;

    // create new bird indicator if necessary
    chrome.storage.local.get({ birdsSeen: {} }, ({ birdsSeen }) => {
      if (!birdsSeen[this.type.imagePath]) {
        this.markAsNew();
      }
    });

    window.addEventListener('mousemove', e => {
      mousePosition = new Point(e.pageX, e.pageY);
    });

    if (gameOptions.soundsEnabled) {
      const soundFile = this.type.sound || 'chirp.wav';
      const birdSound = new Audio(localURL(`sounds/${soundFile}`));
      birdSound.play();
    }

    this.flyToRandomPlatform();
  }

  // Public methods

  getTimerEvents() { }

  update() {
    this.incrementTimers();
    if (mousePosition && this.location.equals(mousePosition, 30)) {
      this.markAsSeen();
    }
    if (this.action === ActionTypes.FLYING) {
      if (
        !this.destination.isVisibleWithBird(this) &&
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
        !this.location.isVisibleWithBird(this) ||
        !this.location.equals(this.lastLocation, 0.01)
      ) {
        this.flyToRandomPlatform();
      } else {
        this.lastLocation = this.location.toPoint();
        if (
          gameOptions.flyFromCursor &&
          mousePosition &&
          this.location.equals(mousePosition, 30)
        ) {
          this.flyToRandomPlatform();
        }
      }
    }
    this.updateStyles();
  }

  flyTo(x, y) {
    this.flyToLocation(new Point(x, y));
  }

  remove() {
    this.element.remove();
    this.newBirdIndicator?.remove();
    queueRemoval(this);
  }

  getFrameURL() {
    let filename;
    if (this.action === ActionTypes.FLYING) {
      filename = 'flying.gif';
    } else if (this.action === ActionTypes.IDLE) {
      filename = 'standing.png';
      this.lastLocation = this.location.toPoint();
    } else if (this.action === ActionTypes.EATING) {
      filename = 'eating.gif';
    }
    return localURL(`images/birds/${this.imagePath}/${filename}`);
  }

  // Private methods

  markAsNew() {
    this.newBird = true;
    const newBirdIndicator = document.createElement('IMG');
    newBirdIndicator.src = localURL('images/sparkles.gif');
    newBirdIndicator.className = 'bird-ext-new-bird-indicator';
    dom.appendChild(newBirdIndicator);
    this.newBirdIndicator = newBirdIndicator;
    chrome.runtime.onMessage.addListener(msg => {
      if (msg.seen === this.type.imagePath) {
        this.newBird = false;
        this.newBirdIndicator?.remove();
      }
    });
  }

  markAsSeen() {
    chrome.storage.local.get({ birdsSeen: {} }, ({ birdsSeen }) => {
      chrome.storage.local.set(
        { birdsSeen: { ...birdsSeen, [this.type.imagePath]: new Date() } },
        () => {
          this.newBird = false;
          this.newBirdIndicator?.remove();
          chrome.runtime.sendMessage({ seen: this.type.imagePath });
        }
      );
    });
  }

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
    const validPlatforms = Platform.getVisiblePlatforms().filter(pl =>
      pl.isVisibleWithBird(this)
    );
    const targetPlatform =
      validPlatforms[Math.floor(Math.random() * validPlatforms.length)];
    if (!targetPlatform) {
      this.flyOffscreen();
      return;
    }
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
    this.element.src = this.getFrameURL();
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

  getTransform() {
    return this.direction === Directions.RIGHT ? 'scaleX(-1)' : 'scaleX(1)';
  }

  getBirdLeft() {
    return this.location.x - this.element.clientWidth / 2;
  }

  getBirdTop() {
    return this.location.y - this.element.clientHeight;
  }

  updateStyles() {
    const elementStyle = this.element.style;
    Object.assign(elementStyle, {
      transform: this.getTransform(),
    });
    if (this.action === ActionTypes.FLYING) {
      Object.assign(elementStyle, {
        left: `${this.getBirdLeft()}px`,
        top: `${this.getBirdTop()}px`,
      });
    }
    if (this.newBird) {
      Object.assign(this.newBirdIndicator.style, {
        left: `${this.getBirdLeft() - this.getWidth() / 2}px`,
        top: `${this.getBirdTop() - this.getHeight() / 3}px`,
        width: `${this.getWidth() * 2}px`,
      });
    }
  }
}

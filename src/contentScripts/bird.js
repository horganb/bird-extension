import { htmlToElement, isScrolling, localURL } from './utils';
import dom from './dom';
import { gameOptions, queueRemoval } from './contentScript';
import { Platform, PlatformLocation, Point } from './location';
import indicatorArrow from './html/indicator_arrow.html';
import newBirdMessageElmnt from './html/new_bird_message.html';

const BIRD_SIZE = 16;
export const ACTION_FACTOR = 0.01;

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
   * @param {Object} type Type of bird.
   */
  constructor(type) {
    this.containerElement = document.createElement('DIV');
    this.containerElement.className = 'bird-ext-bird-container';
    Object.assign(this.containerElement.style, {
      width: `${this.getWidth()}px`,
      height: `${this.getHeight()}px`,
    });
    dom.appendChild(this.containerElement);

    this.element = document.createElement('IMG');
    this.element.className = 'bird-ext-bird-image';
    this.containerElement.appendChild(this.element);

    this.type = type;
    this.location = this.getEdgePoint();
    this.lastLocation = this.location.toPoint();
    this.xSpeed = type.speed;
    this.ySpeed = type.speed * 0.8;
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
      const mousePosition = new Point(e.pageX, e.pageY);
      if (this.location.equals(mousePosition, 30)) {
        this.markAsSeen(); // mark bird as discovered
        if (
          gameOptions.flyFromCursor &&
          [ActionTypes.EATING, ActionTypes.IDLE].includes(this.action)
        ) {
          this.flyToRandomPlatform(); // fly from cursor
        }
      }
    });

    if (gameOptions.soundsEnabled) {
      const soundFile = this.type.sound || 'chirp.wav';
      const birdSound = new Audio(localURL(`sounds/${soundFile}`));
      birdSound.play();
    }

    this.flyToRandomPlatform();
  }

  // Public methods

  update(loopSpeed) {
    this.incrementTimers(loopSpeed);
    if (this.action === ActionTypes.FLYING) {
      if (
        !this.destination.isVisibleWithBird(this) &&
        this.subAction !== ActionTypes.FLYING_OFFSCREEN &&
        !isScrolling()
      ) {
        this.flyToRandomPlatform();
      }
      this.moveTowardDestination(loopSpeed);
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
        (!this.location.isVisibleWithBird(this) && !isScrolling()) ||
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
    this.containerElement.remove();
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

  setSelected(selected = true) {
    if (selected) {
      this.selectedIndicator = htmlToElement(indicatorArrow);
      this.containerElement.appendChild(this.selectedIndicator);
    } else {
      this.selectedIndicator?.remove();
    }
  }

  // Private methods

  showNewBirdMessage() {
    const newBirdMessage = htmlToElement(newBirdMessageElmnt);

    const animationLength = 2000;

    // animation
    Object.assign(newBirdMessage.style, {
      transition: `transform ${animationLength}ms ease-in, opacity ${animationLength}ms ease-in`,
      transform: 'translate(-50%, -100%)',
      opacity: 1,
    });
    setTimeout(() => {
      Object.assign(newBirdMessage.style, {
        transform: 'translate(-50%, -300%)',
        opacity: 0,
      });
    }, 10);
    setTimeout(() => {
      newBirdMessage.remove();
    }, animationLength);

    this.containerElement.appendChild(newBirdMessage);
  }

  markAsNew() {
    this.newBird = true;
    const newBirdIndicator = document.createElement('IMG');
    newBirdIndicator.src = localURL('images/sparkles.gif');
    newBirdIndicator.className = 'bird-ext-bird-indicator';
    this.containerElement.appendChild(newBirdIndicator);
    this.newBirdIndicator = newBirdIndicator;
    chrome.runtime.onMessage.addListener(msg => {
      if (msg.seen === this.type.imagePath) {
        this.newBird = false;
        this.newBirdIndicator?.remove();
      }
    });
  }

  markAsSeen() {
    if (this.newBird) {
      this.newBird = false;
      chrome.storage.local.get({ birdsSeen: {} }, ({ birdsSeen }) => {
        chrome.storage.local.set(
          { birdsSeen: { ...birdsSeen, [this.type.imagePath]: new Date() } },
          () => {
            this.newBirdIndicator?.remove();
            this.showNewBirdMessage();
            chrome.runtime.sendMessage({ seen: this.type.imagePath });
          }
        );
      });
    }
  }

  /** Returns a random Point on the edge of the screen. */
  getEdgePoint(oppositeSide = false) {
    let leftSide;
    if (oppositeSide) {
      leftSide = this.location.x > document.documentElement.clientWidth / 2;
    } else {
      leftSide = Math.floor(Math.random() * 2);
    }
    const x = leftSide
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
      pl.fitsBird(this)
    );
    const targetPlatform =
      validPlatforms[Math.floor(Math.random() * validPlatforms.length)];
    if (!targetPlatform) {
      this.flyOffscreen(true);
      return;
    }
    const destination = PlatformLocation.generateRandom(targetPlatform);
    this.flyToLocation(destination);
  }

  flyOffscreen(oppositeSide = false) {
    this.flyToLocation(this.getEdgePoint(oppositeSide));
    this.subAction = ActionTypes.FLYING_OFFSCREEN;
  }

  switchDirection() {
    if (this.direction === Directions.LEFT) {
      this.direction = Directions.RIGHT;
    } else {
      this.direction = Directions.LEFT;
    }
  }

  incrementTimers(loopSpeed) {
    for (let i = 0; i < this.actionTimers.length; i++) {
      this.actionTimers[i] += loopSpeed;
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
    this.updateStyles();
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

  moveTowardDestination(loopSpeed) {
    this.faceDestination();

    const realXSpeed = this.xSpeed * loopSpeed;
    const realYSpeed = this.xSpeed * loopSpeed;

    const xDistance = Math.abs(this.getDistanceFromDest('x'));
    const yDistance = Math.abs(this.getDistanceFromDest('y'));

    const horizTimeToDest = xDistance / realXSpeed;
    const vertTimeToDest = yDistance / realYSpeed;

    const ySpeedFactor = Math.min(1, vertTimeToDest / horizTimeToDest);
    const xSpeedFactor = Math.min(1, horizTimeToDest / vertTimeToDest);

    this.moveInDirectionTowardDest('x', realXSpeed * xSpeedFactor);
    this.moveInDirectionTowardDest('y', realYSpeed * ySpeedFactor);
  }

  getTransform() {
    return this.direction === Directions.RIGHT ? 'scaleX(-1)' : 'scaleX(1)';
  }

  getBirdLeft() {
    return this.location.x - this.containerElement.clientWidth / 2;
  }

  getBirdTop() {
    return this.location.y - this.containerElement.clientHeight;
  }

  updateStyles() {
    this.element.style.transform = this.getTransform();
    if (this.action === ActionTypes.FLYING) {
      this.containerElement.style.transform = `translate(${this.getBirdLeft()}px, ${this.getBirdTop()}px)`;
    }
  }
}

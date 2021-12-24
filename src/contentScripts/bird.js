import { localURL } from './utils';
import dom from './dom';
import { LOOP_SPEED } from './contentScript';
import BirdType from './birdType'; // eslint-disable-line no-unused-vars
import { Platform, PlatformLocation, Point } from './location';

const ActionTypes = {
  FLYING: 'flying',
  IDLE: 'idle'
};

const Directions = {
  LEFT: 'left',
  RIGHT: 'right'
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

    this.x = Math.floor(Math.random() * 2) ? 0 : window.innerWidth;
    this.y = Math.floor(Math.random() * window.innerHeight) + document.documentElement.scrollTop;
    this.location = new Point(this.x, this.y);
    this.width = computedStyle.width;
    this.height = computedStyle.height;
    this.xSpeed = type.speed * LOOP_SPEED;
    this.ySpeed = type.speed * LOOP_SPEED * 0.8;
    this.element = birdElement;
    this.imagePath = type.imagePath;
    this.action = null;
    this.destination = null;
    this.direction = null;
    this.idleTimer = 0;
    this.flyTimer = 0;

    this.flyToRandomPlatform();

    document.addEventListener("click", e => {
      this.flyTo(e.pageX, e.pageY);
    });
  }

  // Public methods

  getTimerEvents() {

  }

  update() {
    if (this.action === ActionTypes.FLYING) {
      if (!this.destination.isVisible()) {
        this.flyToRandomPlatform();
      }
      this.moveTowardDestination();
      if (this.isAtDestination()) {
        this.setAction(ActionTypes.IDLE);
        this.location = this.destination;
      }
    } else if (this.action === ActionTypes.IDLE) {
      this.incrementTimers();
      if (!this.location.isVisible()) {
        this.flyToRandomPlatform();
      } else {
        // this.x = this.location.x;
        // this.y = this.location.y;
        if (this.idleTimer > 500 && Math.random() < 0.02) {
          this.idleTimer = 0;
          this.switchDirection();
        }
        if (this.flyTimer > 3000 && Math.random() < 0.01) {
          this.flyTimer = 0;
          this.flyToRandomPlatform();
        }
      }
    }
    this.updateStyles();
  }

  flyTo(x, y) {
    this.flyToLocation(new Point(x, y));
  }

  // Private methods

  /**
   * 
   * @param {Dot} location 
   */
  flyToLocation(location) {
    // this.location = 
    // TODO set location to a Point
    this.destination = location;
    this.setAction(ActionTypes.FLYING);
  }

  flyToRandomPlatform() {
    const validPlatforms = Platform.getVisiblePlatforms();
    const targetPlatform = validPlatforms[Math.floor(Math.random() * validPlatforms.length)];
    if (!targetPlatform) return;
    const destination = PlatformLocation.generateRandom(targetPlatform);
    this.flyToLocation(destination);
  }

  switchDirection() {
    if (this.direction === Directions.LEFT) {
      this.direction = Directions.RIGHT;
    } else {
      this.direction = Directions.LEFT;
    }
  }

  incrementTimers() {
    this.idleTimer += LOOP_SPEED;
    this.flyTimer += LOOP_SPEED;
  }

  setAction(action) {
    this.action = action;
    let filename;
    if (action === ActionTypes.FLYING) {
      filename = 'flying.gif';
    } else if (action === ActionTypes.IDLE) {
      filename = 'standing.png';
    }
    this.element.src = localURL(`src/images/birds/${this.imagePath}/${filename}`);
  }

  faceDestination() {
    if (this.destination.x > this.x) {
      this.direction = Directions.RIGHT;
    } else {
      this.direction = Directions.LEFT;
    }
  }

  isAtDestination() {
    return this.x === this.destination.x && this.y === this.destination.y;
  }

  moveTowardDestination() {
    this.faceDestination();
    const remainingX = this.destination.x - this.x;
    const remainingY = this.destination.y - this.y;
    const xDistance = Math.abs(remainingX);
    const yDistance = Math.abs(remainingY);
    const moveX = amount => {
      if (xDistance > amount) {
        const direction = remainingX > 0 ? 1 : -1;
        this.translateX(amount * direction);
      } else {
        this.setX(this.destination.x);
      }
    };
    const moveY = amount => {
      if (yDistance > amount) {
        const direction = remainingY > 0 ? 1 : -1;
        this.translateY(amount * direction);
      } else {
        this.setY(this.destination.y);
      }
    };
    const horizTimeToDest = xDistance / this.xSpeed;
    const vertTimeToDest = yDistance / this.ySpeed;
    let xSpeedFactor = 1, ySpeedFactor = 1;
    if (vertTimeToDest < horizTimeToDest) {
      ySpeedFactor = vertTimeToDest / horizTimeToDest;
    } else if (horizTimeToDest < vertTimeToDest) {
      xSpeedFactor = horizTimeToDest / vertTimeToDest;
    }
    moveX(this.xSpeed * xSpeedFactor);
    moveY(this.ySpeed * ySpeedFactor);
  }

  setX(value) {
    this.x = value;
  }

  setY(value) {
    this.y = value;
  }

  translateX(value) {
    this.setX(this.x + value);
  }

  translateY(value) {
    this.setY(this.y + value);
  }

  updateStyles() {
    const elementStyle = this.element.style;
    Object.assign(elementStyle, {
      transform: this.direction === Directions.RIGHT ? 'scaleX(-1)' : 'scaleX(1)'
    });
    if (this.action !== ActionTypes.IDLE) {
      const realLeft = this.x - (this.element.clientWidth / 2);
      const realTop = this.y - this.element.clientHeight;
      Object.assign(elementStyle, {
        left: `${realLeft}px`,
        top: `${realTop}px`
      });
    }
    // if (this.action === ActionTypes.IDLE) {
    //   this.x = this.location.x;
    //   this.y = this.location.y;
    //   Object.assign(this.element.style, {
    //     transform: this.direction === Directions.RIGHT ? 'scaleX(-1)' : 'scaleX(1)'
    //   });
    // } else {
    //   const realLeft = this.x - (this.element.clientWidth / 2);
    //   const realTop = this.y - this.element.clientHeight;
    //   Object.assign(this.element.style, {
    //     left: `${realLeft}px`,
    //     top: `${realTop}px`,
    //     transform: this.direction === Directions.RIGHT ? 'scaleX(-1)' : 'scaleX(1)'
    //   });
    // }
  }
}
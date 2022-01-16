import { isElementVisible, isValidTextNode, isRectInViewport } from './utils';

/** An error that represent an attempted invocation of an abstract method. */
export class AbstractMethodError extends Error {
  constructor() {
    super('Cannot invoke an abstract method!');
    this.name = 'AbstractMethodError';
  }
}

/** An abstract entity whose position in the document at any time can be represented by a Point. */
export class Dot {
  /** The x position of this Dot in the document. */
  get x() {
    throw new AbstractMethodError();
  }

  /** The y position of this Dot in the document. */
  get y() {
    throw new AbstractMethodError();
  }

  /** Whether this dot is visible. */
  isVisible() {
    throw new AbstractMethodError();
  }

  /** Get the Y position relative to the window viewport. */
  getYRelativeToWindow() {
    throw new AbstractMethodError();
  }

  fitsBird(bird) {
    return this.getYRelativeToWindow() - bird.getHeight() >= 0;
  }

  /** Whether a bird can be at this Dot while being entirely visible. */
  isVisibleWithBird(bird) {
    return this.isVisible() && this.fitsBird(bird);
  }

  /** Convert to a point. */
  toPoint() {
    return new Point(this.x, this.y);
  }

  /** Determines whether two Dots represent the same position. */
  equals(other, tolerance = 0) {
    return (
      Math.abs(this.x - other.x) <= tolerance &&
      Math.abs(this.y - other.y) <= tolerance
    );
  }
}

/** A static point in the document. */
export class Point extends Dot {
  x;
  y;

  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }

  get x() {
    return this.x;
  }

  get y() {
    return this.y;
  }

  getYRelativeToWindow() {
    return this.y;
  }

  isVisible() {
    const viewportX = this.x - document.documentElement.scrollLeft;
    const viewportY = this.y - document.documentElement.scrollTop;
    return (
      viewportX >= 0 &&
      viewportX <= window.innerWidth &&
      viewportY >= 0 &&
      viewportY <= window.innerHeight
    );
  }
}

/** A line segment above text in the document. */
export class Platform {
  range;
  node;
  clientRectIndex;

  constructor(node, clientRectIndex) {
    if (node.nodeType !== 3) {
      throw 'Platform node must be a text node.';
    }
    this.node = node;
    this.range = document.createRange();
    this.range.selectNodeContents(node);
    this.clientRectIndex = clientRectIndex;
  }

  /**
   * @returns {Point} Returns the top-left Point of this Platform.
   */
  get position() {
    try {
      const rect = this.clientRect;
      const x = rect.left + document.documentElement.scrollLeft;
      const y = rect.top + document.documentElement.scrollTop;
      return new Point(x, y);
    } catch {
      return new Point(0, 0);
    }
  }

  get width() {
    return this.clientRect.width;
  }

  get clientRect() {
    const clientRects = this.range.getClientRects();
    return clientRects[this.clientRectIndex];
  }

  isVisible() {
    try {
      const parent = this.node.parentElement;
      const parentVisible = parent && isElementVisible(parent);
      const rect = this.clientRect;
      return (
        parentVisible &&
        isRectInViewport(rect) &&
        rect.width > 0 &&
        rect.height > 0
      );
    } catch {
      return false;
    }
  }

  fitsBird(bird) {
    return new PlatformLocation(this, 0).fitsBird(bird);
  }

  static getVisiblePlatforms(el = document.documentElement) {
    const platforms = [];

    el.childNodes.forEach(childNode => {
      if (childNode.nodeType === 3 && isValidTextNode(childNode)) {
        const textNodeRange = document.createRange();
        textNodeRange.selectNodeContents(childNode);
        const textNodeRects = textNodeRange.getClientRects();
        for (let i = 0; i < textNodeRects.length; i++) {
          const platform = new Platform(childNode, i);
          if (platform.isVisible()) {
            platforms.push(platform);
          }
        }
      } else if (childNode.nodeType === 1) {
        platforms.push(...Platform.getVisiblePlatforms(childNode));
      }
    });
    return platforms;
  }
}

/** A point on a Platform. */
export class PlatformLocation extends Dot {
  /**
   * Creates a location relative to a platform.
   *
   * @param {Platform} platform the platform
   * @param {Number} offset x offset from left end of platform
   */
  constructor(platform, offset) {
    super();
    this.platform = platform;
    this.offset = offset;
  }

  get x() {
    // TODO: make sure the platform exists
    return this.platform.position.x + this.offset;
  }

  get y() {
    return this.platform.position.y;
  }

  getYRelativeToWindow() {
    try {
      return this.platform.clientRect.top;
    } catch {
      return 0;
    }
  }

  /** Whether this is a location on a visible platform. */
  isVisible() {
    return this.platform.isVisible();
  }

  /**
   * Returns a PlatformLocation at a random position on the given platform.
   *
   * @param {Platform} platform
   */
  static generateRandom(platform) {
    const offset = Math.random() * platform.width;
    return new PlatformLocation(platform, offset);
  }
}

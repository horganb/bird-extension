export default class BirdType {
  /** Path to bird animations. */
  imagePath;

  /** Speed of bird, in pixels/second. */
  speed;

  /** How rare the bird is. */
  rarity;
}

export const BLUE_JAY = new BirdType();
BLUE_JAY.imagePath = 'blueJay';
BLUE_JAY.speed = 0.3;
BLUE_JAY.rarity = 1;

export const CARDINAL = new BirdType();
CARDINAL.imagePath = 'cardinal';
CARDINAL.speed = 0.4;
CARDINAL.rarity = 1;

export const FALCON = new BirdType();
FALCON.imagePath = 'falcon';
FALCON.speed = 0.7;
FALCON.rarity = 2;


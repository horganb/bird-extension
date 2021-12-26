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
CARDINAL.rarity = 2;

export const HOUSE_SPARROW = new BirdType();
HOUSE_SPARROW.imagePath = 'houseSparrow';
HOUSE_SPARROW.speed = 0.2;
HOUSE_SPARROW.rarity = 1;

const birdTypes = [BLUE_JAY, CARDINAL, HOUSE_SPARROW];

let rarityTotal = 0;
for (const type of birdTypes) {
  rarityTotal += 1 / type.rarity;
}

export const randomBirdType = () => {
  const pick = Math.random() * rarityTotal;
  let raritySum = 0;
  for (const type of birdTypes) {
    raritySum += 1 / type.rarity;
    if (pick < raritySum) {
      console.log('sum', rarityTotal, 'pick', pick, 'returning', type);
      return type;
    }
  }
};

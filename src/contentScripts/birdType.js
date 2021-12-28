const birdTypes = [
  {
    name: 'Blue Jay',
    species: 'Cyanocitta cristata',
    imagePath: 'blueJay',
    speed: 0.3,
    rarity: 1,
    wingspan: [34, 43],
    mass: [70, 100],
  },
  {
    name: 'Northern Cardinal',
    species: 'Cardinalis cardinalis',
    imagePath: 'cardinal',
    speed: 0.4,
    rarity: 2,
    wingspan: [25, 31],
    mass: [33.6, 65],
  },
  {
    name: 'House Sparrow',
    species: 'Passer domesticus',
    imagePath: 'houseSparrow',
    speed: 0.2,
    rarity: 1,
    wingspan: [19, 25],
    mass: [24, 39.5],
  },
  {
    name: 'Turkey',
    species: 'Meleagris gallopavo',
    imagePath: 'turkey',
    speed: 0.2,
    rarity: 4,
    wingspan: [125, 144],
    mass: [5000, 11000],
  },
];

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
      return type;
    }
  }
};

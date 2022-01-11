export const birdTypes = [
  {
    name: 'American Crow',
    species: 'Corvus brachyrhynchos',
    imagePath: 'americanCrow',
    speed: 0.25,
    rarity: 1,
    habitat: 'Open Woodlands',
    wingspan: [85, 100],
    mass: [316, 620],
  },
  {
    name: 'American Goldfinch',
    species: 'Spinus tristis',
    imagePath: 'americanGoldfinch',
    speed: 0.25,
    rarity: 2,
    wingspan: [19, 22],
    mass: [11, 20],
  },
  {
    name: "Anna's Hummingbird",
    species: 'Calypte anna',
    imagePath: 'annasHummingbird',
    speed: 0.35,
    rarity: 4,
    wingspan: [4.7],
    mass: [2.8, 5.7],
  },
  {
    name: 'Baltimore Oriole',
    species: 'Icterus galbula',
    imagePath: 'baltimoreOriole',
    speed: 0.3,
    rarity: 2,
    wingspan: [23, 32],
    mass: [22.3, 42],
  },
  {
    name: 'Bee Hummingbird',
    species: 'Mellisuga helenae',
    imagePath: 'beeHummingbird',
    speed: 0.3,
    rarity: 3,
    wingspan: [3.25],
    mass: [1.95],
  },
  {
    name: 'Black-billed Magpie',
    species: 'Pica hudsonia',
    imagePath: 'blackbilledMagpie',
    speed: 0.3,
    rarity: 2,
    wingspan: [20.5, 21.9],
    mass: [167, 216],
  },
  {
    name: 'Blue Jay',
    species: 'Cyanocitta cristata',
    imagePath: 'blueJay',
    speed: 0.3,
    rarity: 2,
    wingspan: [34, 43],
    mass: [70, 100],
  },
  {
    name: 'Indigo Bunting',
    species: 'Passerina cyanea',
    imagePath: 'indigoBunting',
    speed: 0.25,
    rarity: 1,
    habitat: 'Open Woodlands',
    wingspan: [18, 23],
    mass: [11.2, 21.4],
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
    name: "Major Mitchell's Cockatoo",
    species: 'Lophochroa leadbeateri',
    imagePath: 'majorMitchellsCockatoo',
    speed: 0.3,
    rarity: 4,
    wingspan: [81],
    mass: [300, 450],
  },
  {
    name: 'Mourning Dove',
    species: 'Zenaida macroura',
    imagePath: 'mourningDove',
    speed: 0.4,
    rarity: 1,
    wingspan: [37, 45],
    mass: [112, 170],
  },
  {
    name: 'Northern Cardinal',
    species: 'Cardinalis cardinalis',
    imagePath: 'northernCardinal',
    speed: 0.3,
    rarity: 2,
    wingspan: [25, 31],
    mass: [33.6, 65],
  },
  {
    name: 'Rainbow Lorikeet',
    species: 'Trichoglossus moluccanus',
    imagePath: 'rainbowLorikeet',
    speed: 0.3,
    rarity: 4,
    wingspan: [25, 30],
    mass: [75, 157],
  },
  {
    name: 'Release Dove',
    species: 'Columba livia domestica',
    imagePath: 'releaseDove',
    speed: 0.25,
    rarity: 2,
    wingspan: [62, 72],
    mass: [238, 380],
  },
  {
    name: 'Turkey',
    species: 'Meleagris gallopavo',
    imagePath: 'turkey',
    speed: 0.2,
    rarity: 6,
    wingspan: [125, 144],
    mass: [5000, 11000],
  },
];

const getRarity = (birdType, birdsSeen) => {
  const SEEN_BIRD_RARITY_DECREASE = 5;
  let rarity = birdType.rarity;
  if (birdsSeen[birdType.imagePath]) {
    // if this bird has been seen before, significantly decrease its rarity
    rarity /= SEEN_BIRD_RARITY_DECREASE;
  }
  return rarity;
};

const getRarityTotal = birdsSeen => {
  let total = 0;
  for (const type of birdTypes) {
    total += 1 / getRarity(type, birdsSeen);
  }
  return total;
};

export const randomBirdType = () => {
  return chrome.storage.local.get({ birdsSeen: {} }).then(({ birdsSeen }) => {
    const pick = Math.random() * getRarityTotal(birdsSeen);
    let raritySum = 0;
    for (const type of birdTypes) {
      raritySum += 1 / getRarity(type, birdsSeen);
      if (pick < raritySum) {
        return type;
      }
    }
  });
};

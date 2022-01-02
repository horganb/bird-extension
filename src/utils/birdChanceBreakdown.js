import { rarityTotal } from '../contentScripts/birdType.js';

const getChance = rarityQuery => {
  const rarityValue = 1 / rarityQuery;
  const percent = ((rarityValue / rarityTotal) * 100).toFixed(2) + '%';

  console.log(
    'bird with rarity',
    rarityQuery,
    'has',
    percent,
    'chance of appearing'
  );
};

getChance(1);

import React, { useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  EncyclopediaContainer,
  AllBirdsContainer,
  BirdInfoResizeContainer,
  theme,
  BirdInfoContainer,
  FactsContainer,
  BirdTitleContainer,
  AllBirdsPageContainer,
} from './styles';
import { birdTypes } from '../contentScripts/birdType';
import { localURL } from '../contentScripts/utils';

const EncyclopediaPage = () => {
  const [selectedBirdType, setSelectedBirdType] = useState();
  const [showBird, setShowBird] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [birdsSeen, setBirdsSeen] = useState({});

  useEffect(() => {
    chrome.storage.local.get({ birdsSeen: {} }, ({ birdsSeen }) => {
      setBirdsSeen(birdsSeen);
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.seen) {
          setBirdsSeen(previousBirdsSeen => {
            return { [msg.seen]: new Date(), ...previousBirdsSeen };
          });
        }
      });
    });
    chrome.action.setBadgeText({
      text: '',
    });
  }, []);

  const compareBirds = (birdA, birdB) => birdA.rarity - birdB.rarity;
  const allBirds = [];
  const birdsByRarity = birdTypes.slice();
  birdsByRarity.sort(compareBirds);

  for (const birdType of birdsByRarity) {
    const gridBirdStyle = { width: '35px', imageRendering: 'pixelated' };
    const selectedBirdStyle = {
      filter: `drop-shadow(0 0 4px ${theme.palette.primary.main})`,
    };
    const grayedOutFilter = 'contrast(0) brightness(150%)';
    const grayedOutStyle = {
      WebkitFilter: grayedOutFilter,
      filter: grayedOutFilter,
    };
    if (birdType.imagePath === selectedBirdType?.imagePath && showBird) {
      Object.assign(gridBirdStyle, selectedBirdStyle);
    }
    if (!birdsSeen[birdType.imagePath]) {
      Object.assign(gridBirdStyle, grayedOutStyle);
    }
    const birdImage = (
      <div
        style={{ padding: '4px', display: 'flex', justifyContent: 'center' }}
        onMouseEnter={() => {
          if (birdsSeen[birdType.imagePath]) {
            setSelectedBirdType(birdType);
            setShowBird(true);
          }
        }}
        onMouseLeave={() => {
          setShowBird(false);
        }}
      >
        <img
          src={localURL(`images/birds/${birdType.imagePath}/standing.png`)}
          style={gridBirdStyle}
        />
      </div>
    );
    allBirds.push(birdImage);
  }

  const rightPage = () => {
    setPageIndex(previousPageIndex => previousPageIndex + 1);
  };
  const leftPage = () => {
    setPageIndex(previousPageIndex => previousPageIndex - 1);
  };

  const BIRDS_PER_PAGE = 15;

  const startingBird = pageIndex * BIRDS_PER_PAGE;
  const birdsOnPage = allBirds.slice(
    startingBird,
    startingBird + BIRDS_PER_PAGE
  );

  const diff = allBirds.length - (startingBird + BIRDS_PER_PAGE);

  for (let i = diff; i < 0; i++) {
    birdsOnPage.push(<div></div>);
  }

  const lastPage = Math.floor((allBirds.length - 1) / BIRDS_PER_PAGE);

  const showLeftArrow = pageIndex > 0;
  const showRightArrow = pageIndex < lastPage;

  const leftArrowStyle = showLeftArrow ? {} : { visibility: 'hidden' };
  const rightArrowStyle = showRightArrow ? {} : { visibility: 'hidden' };

  return (
    <EncyclopediaContainer>
      <AllBirdsPageContainer>
        <IconButton onClick={leftPage} style={leftArrowStyle}>
          <ChevronLeftIcon />
        </IconButton>
        <AllBirdsContainer>{birdsOnPage}</AllBirdsContainer>
        <IconButton onClick={rightPage} style={rightArrowStyle}>
          <ChevronRightIcon />
        </IconButton>
      </AllBirdsPageContainer>
      <BirdInfoResizeContainer toShow={showBird}>
        <BirdInfoContainer>
          {' '}
          {selectedBirdType && (
            <>
              <BirdTitleContainer>
                <h2 style={{ margin: 0, textAlign: 'center' }}>
                  {selectedBirdType.name}
                </h2>
                <h4
                  style={{
                    margin: 0,
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {selectedBirdType.species}
                </h4>
              </BirdTitleContainer>
              <FactsContainer>
                <div style={{ fontSize: '14px' }}>
                  <strong>Habitat:</strong> {'Forest'} <br />
                  <strong>Wingspan:</strong> {'20-30 cm'} <br />
                  <strong>Weight:</strong> {'100 g'} <br />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={localURL(
                      `images/birds/${selectedBirdType.imagePath}/standing.png`
                    )}
                    style={{
                      width: '54px',
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>
              </FactsContainer>
            </>
          )}
        </BirdInfoContainer>
      </BirdInfoResizeContainer>
    </EncyclopediaContainer>
  );
};

export default EncyclopediaPage;

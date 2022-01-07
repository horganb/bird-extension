import React, { useEffect, useRef, useState } from 'react';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';

const BirdIndicator = ({ activeBirds }) => {
  const bird = useRef();
  const [birdPos, setBirdPos] = useState();

  useEffect(() => {
    chrome.runtime.onConnect.addListener(function (port) {
      if (port.name === 'birdInspector') {
        port.onMessage.addListener(function (msg) {
          if (msg.getBird) {
            if (!bird.current || !activeBirds.includes(bird.current)) {
              bird.current = activeBirds[0];
            }
            port.postMessage({
              image: bird.current?.getFrameURL(),
              transform: bird.current?.getTransform(),
              name: bird.current?.type.name,
              species: bird.current?.type.species,
              index: activeBirds.indexOf(bird.current),
              numBirds: activeBirds.length,
            });
          }
          if (msg.left) {
            const currentIndex = activeBirds.indexOf(bird.current);
            if (currentIndex === 0) {
              bird.current = activeBirds[activeBirds.length - 1];
            } else {
              bird.current = activeBirds[currentIndex - 1];
            }
          }
          if (msg.right) {
            const currentIndex = activeBirds.indexOf(bird.current);
            bird.current = activeBirds[(currentIndex + 1) % activeBirds.length];
          }
          setBirdPos(
            bird.current && [
              bird.current.location.x,
              bird.current.location.y - bird.current.getHeight(),
            ]
          );
        });
        port.onDisconnect.addListener(() => {
          setBirdPos();
        });
      }
    });
  }, []);

  return birdPos ? (
    <ArrowDropDownOutlinedIcon
      style={{
        position: 'absolute',
        left: `${birdPos[0]}px`,
        top: `${birdPos[1]}px`,
        transform: 'translateX(-50%) translateY(-75%)',
        zIndex: 2147483647,
        pointerEvents: 'none',
        animationName: 'arrowFlash',
        animationDuration: '3s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    />
  ) : null;
};

export default BirdIndicator;

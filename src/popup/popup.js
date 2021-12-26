import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const LikeButton = props => {
  const [liked, setLiked] = useState(false);

  return liked ? (
    'You liked this.'
  ) : (
    <button onClick={() => setLiked(true)}>Like</button>
  );
};

ReactDOM.render(<LikeButton />, document.getElementById('app-root'));

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: false,
  entry: {
    contentScript: './src/contentScripts/contentScript.js',
    background: './src/background/background.js',
  },
  output: {
    filename: pathData => {
      return pathData.chunk.name === 'background'
        ? '[name].js'
        : 'build/[name].js';
    },
    path: __dirname,
  },
};

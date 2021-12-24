module.exports = {
  entry: {
    contentScript: './src/contentScripts/contentScript.js',
    background: './src/background/background.js'
  },
  output: {
    filename: pathData => {
      return pathData.chunk.name === 'background' ? '[name].js' : 'build/[name].js';
    },
    path: __dirname
  },
  // FOR DEVELOPMENT:
  // optimization: {
  //   minimize: false
  // }
};
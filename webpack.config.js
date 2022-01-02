const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: false,
  entry: {
    contentScript: './src/contentScripts/contentScript.js',
    popup: './src/popup/popup.js',
    background: './src/background/background.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
  },
};

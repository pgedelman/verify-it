const path = require('path');
const Dotenv = require('dotenv-webpack');


module.exports = {
  mode: 'production',
  entry: './scripts/content/content.js', // Path to your source content script
  output: {
    path: path.resolve(__dirname, 'scripts/dist'),
    filename: 'content.js', // Bundled content script output
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv(),
  ]
};





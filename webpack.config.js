const path = require('path');
const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV === 'production';
const outputFile = `main.${isProduction ? 'production.min' : 'development'}.js`;

const config = {
  entry: './src/index.js',
  mode: NODE_ENV,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  output: {
    filename: outputFile,
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    library: '',
  },
};

if (!isProduction) {
  config.optimization = {
    minimize: false,
  };
}

module.exports = config;

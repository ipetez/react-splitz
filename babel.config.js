const config = {
  presets: [
    ['@babel/env', { modules: process.env.TEST ? 'auto' : false }],
    '@babel/preset-react',
  ],
};

module.exports = config;

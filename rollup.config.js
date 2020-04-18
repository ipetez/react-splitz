// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import pkg from './package.json';

const entryFile = 'src/index.js';

const externals = ['react', 'react-dom', 'prop-types'];

const umdGlobals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'prop-types': 'PropTypes',
};

const cjs = [
  // Development build
  {
    input: entryFile,
    output: {
      file: `cjs/${pkg.name}.development.js`,
      format: 'cjs',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env.BUILD_ENV': JSON.stringify('cjs'),
      }),
      resolve(),
      commonjs({
        exclude: 'src/**',
      }),
      babel({
        exclude: 'node_modules/**', // only transpile our source code
      }),
    ],
    external: externals,
  },
  // Production build
  {
    input: entryFile,
    output: {
      file: `cjs/${pkg.name}.production.min.js`,
      format: 'cjs',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.BUILD_ENV': JSON.stringify('cjs'),
      }),
      resolve(),
      commonjs({
        exclude: 'src/**',
      }),
      babel({
        exclude: 'node_modules/**', // only transpile our source code
      }),
      terser(),
      process.env.INSPECT_BUNDLE && visualizer(),
    ],
    external: externals,
  },
];

const umd = [
  {
    input: entryFile,
    output: {
      file: `umd/${pkg.name}.development.js`,
      format: 'umd',
      name: 'ReactSplitz',
      globals: umdGlobals,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env.BUILD_ENV': JSON.stringify('umd'),
      }),
      resolve(),
      commonjs({
        exclude: 'src/**',
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
    external: externals,
  },
  {
    input: entryFile,
    output: {
      file: `umd/${pkg.name}.production.min.js`,
      format: 'umd',
      name: 'ReactSplitz',
      globals: umdGlobals,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.BUILD_ENV': JSON.stringify('umd'),
      }),
      resolve(),
      commonjs({
        exclude: 'src/**',
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      terser(),
    ],
    external: externals,
  },
];

let config;
switch (process.env.BUILD_ENV) {
  case 'cjs':
    config = cjs;
    break;
  case 'umd':
    config = umd;
    break;
  default:
    config = cjs.concat(umd);
}

module.exports = config;

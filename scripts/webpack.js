const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const pkg = require(path.join(process.cwd(), 'package.json'));

const isProduction = process.env.NODE_ENV === 'production';

const rules = () => ({
  js: () => ({
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        configFile: path.resolve(`${__dirname}/../babel.config.js`),
      },
    },
  }),
  svg: () => ({
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    exclude: [/node_modules/],
    use: 'svg-inline-loader',
  }),
});

const plugins = () => {
  return {
    friendlyErrors: () => new FriendlyErrorsWebpackPlugin()
  };
};

const stats = () => {
  if (isProduction) {
    return {
      builtAt: false,
      colors: true,
      entrypoints: false,
      hash: false,
      modules: false,
      timings: false,
      version: false,
    };
  }
  return {
    all: false,
  };
};

const getConfig = () => ({
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: process.cwd(),
    filename: pkg.main,
    library: pkg.name,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: Object.values(rules()).map(rule => rule()),
  },
  plugins: Object.values(plugins()).map(plugin => plugin()),
  devtool: 'source-map',
  target: 'web',

  /**
   * Exclude peer dependencies from package bundles.
   */
  externals: (context, request, cb) => {
    const peerDeps = Object.keys(pkg.peerDependencies || {});
    const isPeerDep = dep => new RegExp(`^${dep}($|/)`).test(request);
    return peerDeps.some(isPeerDep) ? cb(null, request) : cb();
  },
  stats: stats(),
});

module.exports = {
  getConfig,
  rules: rules(),
  plugins: plugins(),
};
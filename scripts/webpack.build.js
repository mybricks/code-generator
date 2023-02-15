const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const commonCfg = require('./webpack.common');

module.exports = merge(commonCfg, {
  mode: 'production',
  entry: path.resolve(__dirname, '/src/index.ts'),
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), 'lib'),
    libraryTarget: 'umd',
  },
  externals: [
    {
      react: 'react',
      'react-dom': 'react-dom'
    },
  ],
  plugins: [
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    // }),
  ],
});

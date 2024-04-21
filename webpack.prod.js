import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CssExtractor from "mini-css-extract-plugin";
import CssMinimizer from "css-minimizer-webpack-plugin";
import TerserPlugin  from "terser-webpack-plugin";
import path from 'path';

export default {
  mode: 'production',
  entry: path.resolve('src/index.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve('dist/arduino/www/RGB-LED-STRIP-CONTROLLER'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          CssExtractor.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options:{
            presets: ["@babel/preset-env", "@babel/preset-react"],
          }
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizer(),
      new TerserPlugin({
        extractComments: false,
      })
    ],
  },
  plugins: [
    new CssExtractor({
      filename: "main.css",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('src/index.html'),
      favicon: 'src/assets/favicon.webp',
      inject: 'body'
    }),
    new webpack.ProvidePlugin({
      'React': 'react'
    })
  ]
};
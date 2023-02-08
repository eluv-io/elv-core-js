const webpack = require("webpack");
const Path = require("path");
const autoprefixer = require("autoprefixer");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  target: "web",
  output: {
    path: Path.resolve(__dirname, "dist"),
    filename: "index.js",
    chunkFilename: "[name].bundle.js"
  },
  devServer: {
    disableHostCheck: true,
    inline: true,
    port: 8080,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "POST"
    }
  },
  node: {
    fs: "empty"
  },
  mode: "development",
  devtool: "eval-source-map",
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: Path.join(__dirname, "configuration.js"),
      to: Path.join(__dirname, "dist", "configuration.js")
    }]),
    new HtmlWebpackPlugin({
      title: "Eluvio",
      template: Path.join(__dirname, "src", "index.html"),
      inject: "body",
      cache: false,
      filename: "index.html",
      favicon: "node_modules/elv-components-js/src/icons/favicon.png"
    }),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [autoprefixer({})]
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.(js|mjs)$/,
        exclude: /node_modules\/(?!elv-components-js)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react", "babel-preset-mobx"],
          plugins: [
            require("@babel/plugin-proposal-object-rest-spread"),
            require("@babel/plugin-transform-regenerator"),
            require("@babel/plugin-transform-runtime"),
            require("@babel/plugin-syntax-dynamic-import")
          ]
        }
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader"
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: ["file-loader"],
      },
      {
        test: /\.(txt|bin|abi|html)$/i,
        loader: "raw-loader"
      },
      {
        test: /\.ya?ml$/,
        type: "json", // Required by Webpack v4
        use: "yaml-loader"
      }
    ]
  }
};

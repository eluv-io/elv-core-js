const Path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const fs = require("fs");

module.exports = env => {
  const isDevelopment = !!env.WEBPACK_SERVE;

  let plugins = [
    new HtmlWebpackPlugin({
      title: "Eluvio Core",
      template: Path.join(__dirname, "src", "index.html"),
      filename: "index.html",
      favicon: Path.join(__dirname, "src", "static", "icons", "favicon-light.png"),
      inject: "body"
    })
  ];

  if(process.env.ANALYZE_BUNDLE) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  if(isDevelopment) {
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  return {
    entry: Path.resolve(__dirname, "src/index.js"),
    target: "web",
    output: {
      path: Path.resolve(__dirname, "dist"),
      clean: true,
      //filename: "main.js",
      filename: "[name].bundle.js",
      publicPath: process.env.ELV_CORE_JS_ASSET_PATH || "/",
      chunkFilename: "bundle.[id].[chunkhash].js"
    },
    devServer: {
      hot: true,
      historyApiFallback: true,
      allowedHosts: "all",
      port: process.env.ELV_CORE_JS_PORT || 8082,
      /*
      https: {
        key: fs.readFileSync("./https/private.key"),
        cert: fs.readFileSync("./https/dev.local.crt"),
        ca: fs.readFileSync("./https/private.pem")
      },

       */
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Allow-Methods": "POST"
      },
      // This is to allow configuration.js to be accessed
      static: {
        directory: Path.resolve(__dirname, "./config"),
        publicPath: "/"
      }
    },
    mode: "development",
    devtool: "eval-source-map",
    plugins,
    externals: {
      crypto: "crypto"
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    resolve: {
      fallback: {
        stream: require.resolve("stream-browserify"),
        url: require.resolve("url")
      },
      extensions: [".js", ".jsx", ".mjs", ".scss", ".png", ".svg"],
    },
    module: {
      rules: [
        {
          test: /\.(css|scss)$/,
          exclude: /\.(theme|font)\.(css|scss)$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  namedExport: false,
                  exportLocalsConvention: "as-is",
                  mode: "local",
                  localIdentName: isDevelopment ?  "[local]--[hash:base64:5]" : "[hash:base64:5]"
                }
              }
            },
            "postcss-loader",
            "sass-loader"
          ]
        },
        {
          test: /\.(js|mjs|jsx)$/,
          loader: "babel-loader",
          options: {
            plugins: [isDevelopment && require.resolve("react-refresh/babel")].filter(Boolean),
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
            ]
          }
        },
        {
          test: /\.svg$/,
          loader: "svg-inline-loader"
        },
        {
          test: /\.(gif|png|jpe?g|otf|woff2?|ttf)$/i,
          include: [Path.resolve(__dirname, "src/static/public")],
          type: "asset/inline",
          generator: {
            filename: "public/[name][ext]"
          }
        },
        {
          test: /\.(gif|png|jpe?g|otf|woff2?|ttf)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(txt|bin|abi|html)$/i,
          exclude: [Path.resolve(__dirname, "src/index.html")],
          type: "asset/source"
        },
        {
          test: /\.ya?ml$/,
          use: "yaml-loader"
        }
      ]
    }
  };
};

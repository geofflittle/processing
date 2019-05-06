const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
  },
  entry: {
    index: path.resolve(__dirname, "src", "index.ts"),
  },
  module: {
    rules: [
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      {
        test: /\.(s?)css$/,
        use: [ MiniCssExtractPlugin.loader, "css-loader", "sass-loader" ],
      },
    ],
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js", ".json" ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "[name].css", chunkFilename: "[id].css" }),
    new HtmlWebpackPlugin({
      title: "Processing",
      hash: true,
      filename: "index.html",
      template: "src/assets/index.html",
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  externals: {
    "p5": "p5"
  }
};

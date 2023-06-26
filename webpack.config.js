const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: './server.js',
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.less/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
      chunkFilename: '[id].css'
    })
  ],
  devtool: 'cheap-eval-source-map',
  mode: 'development'
}

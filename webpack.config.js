module.exports = {
  entry: './src/demo/app.tsx',
  output: {
    path: './demo',
    filename: 'app.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}
const { FuseBox } = require('fuse-box');
const fsbx = require('fuse-box');

const box = FuseBox
  .init({
    homeDir: "src",
    sourceMap: {
      bundleReference: "sourcemaps.js.map",
      outFile: "demo/sourcemaps.js.map",
    },
    outFile: "demo/app.js",
    plugins: [
      fsbx.EnvPlugin({ NODE_ENV: process.argv[2] }),
      !process.argv.includes('dev') && fsbx.UglifyJSPlugin()
    ]
  })


if (process.argv.includes('dev')){
  box.devServer('>demo/app.tsx', {
    port: 8080,
    root : './demo'
  })
}
else {
  box.bundle('>demo/app.tsx')
}
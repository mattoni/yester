import { FuseBox, EnvPlugin, UglifyJSPlugin } from "fuse-box";
import * as path from "path";
import * as express from "express";

const isDev = process.argv.indexOf('dev') !== -1;
const box = FuseBox
  .init({
    homeDir: "src",
    output: "demo/app.js",
    plugins: [
      EnvPlugin({ NODE_ENV: process.argv[2] }),
      !isDev && UglifyJSPlugin()
    ]
  })

if (isDev) {
  const build = path.join(__dirname, "demo");
  box
    .dev({ port: 8080, root: false }, server => {
      const app: express.Application = server.httpServer.app;
      app.use(express.static(build));
      app.get('*', (req, res) => {
        res.sendFile(path.join(build, 'index.html'));
      });
    });
}

box
  .bundle('demo/app.js')
  .instructions('>demo/app.tsx');

box.run();
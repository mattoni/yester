import { FuseBox, EnvPlugin, UglifyJSPlugin } from "fuse-box";
import * as path from "path";
import * as express from "express";

const isDev = process.argv.indexOf('dev') !== -1;
const box = FuseBox
  .init({
    homeDir: "src",
    cache: true,
    output: "app.js",
    plugins: [
      EnvPlugin({ NODE_ENV: process.argv[2] }),
      !isDev && UglifyJSPlugin()
    ]
  })

if (isDev) {
  const build = path.join(__dirname, "demo");
  box
    .dev({ port: 8080, root: false, hmr: true }, server => {
      const app: express.Application = server.httpServer.app;
      app.use(express.static(build));
      app.get('*', (req, res) => {
        res.sendFile(path.join(build, 'index.html'));
      });
    });
}

const bundle = box
  .bundle('demo/app.js')
  .watch()
  .hmr()
  .instructions('> demo/app.tsx');

if (isDev) {
}

box.run();
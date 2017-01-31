const ghpages = require('gh-pages');
const path = require('path');
const date = new Date();

/** Build demos */
console.log("--running publish--");
ghpages.publish(__dirname + '/../../demo', {
  message: `[ci skip] deployment (${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}-${date.getUTCHours()}-${date.getUTCMinutes()})`,

  /** Branch */
  branch: 'master',
  repo: 'https://' + process.env.GH_TOKEN + '@github.com/basarat/yester-demo.git',

  /** User */
  user: {
    name: 'basarat',
    email: 'basarat@example.com'
  }
}, (err: Error) => {
  if (err) {
    console.log('--publish failed!--', err)
    return;
  }
  console.log("--publish done--");
});
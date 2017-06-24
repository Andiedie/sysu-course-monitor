const config = require('./config');
const {login, init, Checker, Selector} = require('./utils');
const {inform} = require('./lib');
const fs = require('fs');

main();
async function main () {
  let sid, xkjdszids;

  try {
    sid = await login(config.netid, config.password);
  } catch (e) {
    console.log(e);
    console.log('登录失败...');
  }

  try {
    xkjdszids = await init(sid, config.interval);
  } catch (e) {
    console.log(e);
    console.log('进入选课系统失败...');
  }

  let checker = new Checker(sid, xkjdszids, config.interval, config.settings);
  checker.start();

  let selector = new Selector();
  checker.on('selectable', selector.select);
  checker.on('finish', () => console.log('完成！'));

  selector.on('success', inform.bind(null, '成功'));
  selector.on('fail', inform.bind(null, '失败'));
  selector.on('finish', () => {
    let json = JSON.stringify(config.settings, null, 2);
    fs.writeFile('./config/settings.json', json);
  });
}

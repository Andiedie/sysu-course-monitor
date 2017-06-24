const config = require('./config');
const {login, init, Checker, Selector} = require('./utils');
const {inform, axios} = require('./lib');
const fs = require('fs');

main();
async function main () {
  let sid, xkjdszids;

  try {
    sid = await login(config.netid, config.password);
  } catch (e) {
    console.log(e);
    return console.log('登录失败');
  }

  try {
    xkjdszids = await init(sid, config.interval);
  } catch (e) {
    console.log(e);
    return console.log('进入选课系统失败');
  }

  const checker = new Checker(sid, xkjdszids, config.interval, config.settings);
  const selector = new Selector();

  let relodgin = async e => {
    console.log(e);
    console.log('查询时出现错误，重新登录');
    axios.refresh();
    try {
      sid = await login(config.netid, config.password);
    } catch (e) {
      console.log(e);
      console.log('登录失败');
      process.exit(0);
    }
    checker.start();
  };

  checker
    .on('selectable', selector.select)
    .on('finish', () => console.log('完成！'))
    .on('error', relodgin)
    .start();

  selector
    .on('success', inform.bind(null, '成功'))
    .on('fail', inform.bind(null, '失败'))
    .on('error', relodgin)
    .on('finish', () => {
      let json = JSON.stringify(config.settings, null, 2);
      fs.writeFile('./config/settings.json', json);
    });
}

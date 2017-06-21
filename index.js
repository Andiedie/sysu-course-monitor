const config = require('./config');
const {login, init, check, select} = require('./utils');

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
    xkjdszids = await init(sid);
  } catch (e) {
    console.log(e);
    console.log('进入选课系统失败...');
  }

  try {
    await check(xkjdszids, sid, select);
  } catch (e) {
    console.log(e);
    console.log('选课出现错误...');
  }

  console.log('完成');
}

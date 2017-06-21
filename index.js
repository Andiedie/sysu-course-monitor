const config = require('./config');
const {login, init, check, select} = require('./utils');

main();
async function main () {
  let sid = await login(config.netid, config.password);
  let xkjdszid = await init(sid);
  await check(xkjdszid, sid, select);
  console.log('完成');
}

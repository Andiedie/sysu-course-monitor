const config = require('./config');
const {login, init, check, select} = require('./utils');
const {log} = require('./lib');

main();
async function main () {
  let sid = await login(config.netid, config.password);
  let xkjdszid = await init(sid);
  await check(xkjdszid, select);
  log.info('完成');
}

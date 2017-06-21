const config = require('./config');
const {login, init} = require('./utils');

main();
async function main () {
  let sid = await login(config.netid, config.password);
  await init(sid);
}

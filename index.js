const config = require('./config');
const login = require('./utils/login');

main();
async function main () {
  await login(config.netid, config.password);
}

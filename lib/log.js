const config = require('../config');
// 上一次输出的方法是否为line，若是则info输出时需要换行
let isLine = false;

function time () {
  let t = new Date();
  return `${t.getFullYear()}.${t.getMonth()}.${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
}

const log = msg => {
  if (config.slient) return;
  if (isLine) {
    isLine = false;
    process.stdout.write('\r\n');
  }
  let t = time();
  let blank = ' '.repeat(t.length);
  msg = msg.toString();
  msg = msg.split('\n');
  msg.forEach((m, i) => {
    if (i) process.stdout.write(`${blank} \t${m.trim()}\r\n`);
    else process.stdout.write(`${t}:\t${m.trim()}\r\n`);
  });
};

log.line = msg => {
  if (config.slient) return;
  isLine = true;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${time()}:\t${msg}`);
};

log.error = msg => {
  if (config.slient) return;
  if (isLine) {
    isLine = false;
    process.stdout.write('\r\n');
  }
  process.stdout.write(`${time()}:\t${msg}\r\n`);
  process.exit(0);
};

module.exports = log;

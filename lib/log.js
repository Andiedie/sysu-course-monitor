const config = require('../config');
// 上一次输出的方法是否为line，若是则info输出时需要换行
let isLine = false;
let write;
if (config.slient) {
  const fs = require('fs-extra');
  const path = require('path').resolve(__dirname, '../log/output.log');
  fs.ensureFileSync(path);
  write = fs.appendFileSync.bind(null, path);
} else write = process.stdout.write.bind(process.stdout);

function time () {
  let t = new Date();
  return `${t.getFullYear()}.${t.getMonth()}.${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
}

const log = msg => {
  let final = '';
  if (isLine) {
    isLine = false;
    final += '\r\n';
  }
  let t = time();
  let blank = ' '.repeat(t.length);
  msg = msg.toString();
  msg = msg.split('\n');
  msg.forEach((m, i) => {
    if (i) final += `${blank} \t${m.trim()}\r\n`;
    else final += `${t}:\t${m.trim()}\r\n`;
  });
  write(final);
};

log.line = msg => {
  isLine = true;
  if (!config.slient) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    write(`${time()}:\t${msg}`);
  }
};

log.error = msg => {
  let final = '';
  if (isLine) {
    isLine = false;
    final += '\r\n';
  }
  final += `${time()}:\t${msg}\r\n`;
  write(final);
  process.exit(0);
};

module.exports = log;

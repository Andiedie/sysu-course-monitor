// 上一次输出的方法是否为line，若是则info输出时需要换行
let isLine = false;

function time () {
  let t = new Date();
  return `${t.getFullYear()}.${t.getMonth()}.${t.getDate()} ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
}

const log = msg => {
  if (isLine) {
    isLine = false;
    process.stdout.write('\r\n');
  }
  process.stdout.write(`${time()}:\t${msg}\r\n`);
};

log.line = msg => {
  isLine = true;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${time()}:\t${msg}`);
};

log.error = msg => {
  if (isLine) {
    isLine = false;
    process.stdout.write('\r\n');
  }
  process.stdout.write(`${time()}:\t${msg}\r\n`);
  process.exit(0);
};

module.exports = log;

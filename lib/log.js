// 上一次输出的方法是否为line，若是则info输出时需要换行
let line = false;
exports.error = msg => {
  if (line) {
    line = false;
    process.stdout.write('\r\n');
  }
  process.stdout.write(msg + '\r\n');
};
exports.info = msg => {
  if (line) {
    line = false;
    process.stdout.write('\r\n');
  }
  process.stdout.write(msg + '\r\n');
};
exports.line = msg => {
  line = true;
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(msg);
};

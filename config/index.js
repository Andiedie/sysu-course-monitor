const secret = require('./secret');

// NetID账号
exports.netid = secret.netid;
// NetID密码
exports.password = secret.password;
// 测试号appid
exports.appid = secret.appid;
// 测试号appsecret
exports.appsecret = secret.appsecret;
// 模板消息id
exports.template_id = secret.template_id;
// 刷新间隔 毫秒
exports.interval = 3000;
// 选课设置
try {
  exports.settings = require('./settings.json');
} catch (e) {
  console.log('选课设置文件 config/settings.json 格式错误');
  process.exit(0);
}

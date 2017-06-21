const secret = require('./secret');

// Netid账号
exports.netid = secret.netid;
// Netid密码
exports.password = secret.password;
// 测试号appid
exports.appid = secret.appid;
// 测试号appsecret
exports.appsecret = secret.appsecret;
// 模板消息id
exports.template_id = secret.template_id;
// 刷新间隔
exports.interval = 3;
// 选课设置
exports.settings = require('./settings.json');

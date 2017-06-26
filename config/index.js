const secret = require('./secret');

// NetID账号
exports.netid = secret.netid;
// NetID密码
exports.password = secret.password;
// 刷新间隔 毫秒
exports.interval = 3000;

// 是否开启微信推送
exports.wechatInform = true;
// 测试号appid
exports.appid = secret.appid;
// 测试号appsecret
exports.appsecret = secret.appsecret;
// 模板消息id
exports.template_id = secret.template_id;

/**
 * 发送微信通知
 */
const config = require('../config');

if (config.wechatInform) {
  const wi = require('wechat-inform')(config);
  module.exports = async (status, message) => {
    await wi.send({
      data: {
        status: {
          value: status,
          color: '#337ab7'
        },
        message: {
          value: message
        }
      }
    });
  };
} else {
  module.exports = console.log;
}

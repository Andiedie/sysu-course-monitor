const config = require('../config');
const wi = require('wechat-inform')(config);

module.exports = (status, message) => {
  wi.send({
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

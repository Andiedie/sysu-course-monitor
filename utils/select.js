const {axios: {instance: axios}, inform} = require('../lib');
const qs = require('querystring');

module.exports = async (option) => {
  if (option.replaceId) {
    console.log(`正在退选 ${option.current.replace}`);
    await axios.post('unelect',
      qs.stringify({
        jxbh: option.replaceId,
        xkjdszid: option.xkjdszid,
        sid: option.sid
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    console.log('成功退选');
  }
  await axios.post('elect',
    qs.stringify({
      jxbh: option.courseId,
      xkjdszid: option.xkjdszid,
      sid: option.sid
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  console.log(`成功选课 ${option.name}`);
  option.current.enable = false;
  await inform('成功选课', option.name);
};

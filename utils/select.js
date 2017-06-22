const {axios: {instance: axios}, inform} = require('../lib');
const qs = require('querystring');

/**
 * 选课
 * @param  {[type]}  option 由check传来的参数
 *                          参数：
 *                          course     有空位course信息
 *                          current    当前选课类型相关配置
 *                          xkjdszid   课程类型id组成的对象
 *                          sid        登录id
 *                          replaceId  替换课程id，可能为undefined
 * @return {Promise}        抢课完毕 promise resolve
 */
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
      jxbh: option.course.courseId,
      xkjdszid: option.xkjdszid,
      sid: option.sid
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  console.log(`成功选课 ${option.course.name}`);
  await inform('成功选课', option.course.name);
};

const EventEmitter = require('events');
const {axios: {instance}, log} = require('../lib');
const qs = require('querystring');

/**
 * 选课
 * @event success 选课成功
 * 参数
 *   message 描述信息
 * @event fail    选课失败
 * 参数
 *   current 当前类型相关配置
 *   message 描述信息
 * @event error  选课出现错误
 */
module.exports = class Selector extends EventEmitter {
  /**
   * 选课
   * @param  {[type]}  option 由check传来的参数
   * 参数：
   *   course     有空位course信息
   *   current    当前选课类型相关配置
   *   xkjdszid   课程类型id组成的对象
   *   sid        登录id
   *   replaceId  替换课程id，可能为undefined
   */
  async select (option) {
    let message = '';
    if (option.replaceId) {
      try {
        await instance().post('unelect',
          qs.stringify({
            jxbh: option.replaceId,
            xkjdszid: option.xkjdszid,
            sid: option.sid
          }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
      } catch (e) {
        return this.emit('error', e);
      }
      message += `退选课程：${option.current.replace}\n`;
      log(`退选课程：${option.current.replace}`);
    }
    try {
      await instance().post('elect',
        qs.stringify({
          jxbh: option.course.courseId,
          xkjdszid: option.xkjdszid,
          sid: option.sid
        }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    } catch (e) {
      return this.emit('error', e);
    }
    log(`选取课程：${option.course.name}`);
    message += `选取课程：${option.course.name}`;
    this.emit('success', {
      current: option.current,
      message
    });
  }
};

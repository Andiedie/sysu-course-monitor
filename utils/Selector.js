const EventEmitter = require('events');
const config = require('../config');
const {axios: {instance}} = require('../lib');
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
   */
  async select ({course, current}) {
    if (current.replace) {
      try {
        await instance().post('unelect',
          qs.stringify({
            jxbh: current.replace,
            xkjdszid: current.id,
            sid: config.sid
          }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
      } catch (e) {
        return this.emit('error', e);
      }
    }
    try {
      await instance().post('elect',
        qs.stringify({
          jxbh: course.id,
          xkjdszid: current.id,
          sid: config.sid
        }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    } catch (e) {
      return this.emit('error', e);
    }
    let message = current.replace
      ? `${current.replaceName} 替换为 ${course.name}`
      : `选取课程：${course.name}`;
    this.emit('success', {current, message});
  }
};

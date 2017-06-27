const EventEmitter = require('events');
const config = require('../config');
const {axios: {instance}} = require('../lib');
const util = require('./util');
const qs = require('querystring');

/**
 * 选课
 * @event success 选课成功
 * 参数
 *   message 描述信息
 * @event fail    选课失败
 * 参数
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
    try {
      // 需要时退课
      if (current.replace) {
        await unselect(current);
      }
      // 选课
      await selectCourse(course, current);
      // 检查是否选上
      if (isSelected(course)) {
        let message = current.replace
          ? `“${current.replaceName}”替换为“${course.name}”`
          : `选课“${course.name}”成功`;
        this.emit('success', {current, message});
      } else {
        // 没有选上，需要时回选替换课程
        let selectBackError;
        if (current.replace) {
          try {
            await selectCourse({id: current.replace}, current);
          } catch (e) {
            selectBackError = e;
          }
        }

        let message = current.replace
          ? `“${current.replaceName}”替换为“${course.name}”失败，回抢${selectBackError ? '成功' : '失败'}`
          : `选课“${course.name}”失败`;
        this.emit('fail', message);

        if (selectBackError) throw selectBackError;
      }
    } catch (e) {
      this.emit('error', e);
    }
  }
};

async function unselect (current) {
  await instance().post('unelect',
    qs.stringify({
      jxbh: current.replace,
      xkjdszid: current.id,
      sid: config.sid
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

async function selectCourse (course, current) {
  await instance().post('elect',
    qs.stringify({
      jxbh: course.id,
      xkjdszid: current.id,
      sid: config.sid
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

async function isSelected (course) {
  let selecteds = await util.getSelected();
  return selecteds.some(selected => selected.id === course.id);
}

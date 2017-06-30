const EventEmitter = require('events');
const config = require('../config');
const {axios: {instance}} = require('../lib');
const qs = require('querystring');
const reason = require('./reason');

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
      let code = await selectCourse(course, current);
      if (code === 0) {
        // 选课成功
        current.enable = false;
        let message = `成功课程：${course.name}\n`;
        message += `替换课程：${current.replace ? current.replaceName : '无'}`;
        this.emit('success', message);
      } else {
        // 选课失败
        let message = `失败课程：${course.name}\n`;
        message += `失败原因：${reason[code]}\n`;
        // 移出列表
        if (code !== 19 && code !== 21) {
          let index = current.targets.findIndex(target => target.id === course.id);
          current.targets.splice(index, 1);
          if (!current.targets.length) {
            current.enable = false;
          }
          message += '特殊操作：已将该课程移出目标列表\n';
        }
        message += `替换课程：${current.replace ? current.replaceName : '无'}\n`;
        // 没有选上，需要时回选替换课程
        let selectBackError;
        if (current.replace) {
          try {
            code = await selectCourse({id: current.replace}, current);
          } catch (e) {
            selectBackError = e;
          }
          if (selectBackError || code) {
            // 回抢失败
            message += `回抢替换：失败\n`;
            message += `失败原因：${selectBackError ? selectBackError.message : reason[code]}\n`;
            // 如果是因为位置满了，加入抢课列表
            if (code === 19 || code === 21) {
              current.targets.push({
                id: current.replace,
                name: current.replaceName
              });
              message += '特殊操作：已将替换课程加入抢课列表\n';
            }
            // 取消失效的替换课程
            delete current.replace;
            delete current.replaceName;
          } else {
            // 回抢成功
            message += `回抢替换：成功`;
          }
        }
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
  let {data} = await instance().post('elect',
    qs.stringify({
      jxbh: course.id,
      xkjdszid: current.id,
      sid: config.sid
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  return Number(/&#034;code&#034;:(\d*?),&#034/.exec(data)[1]);
}

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
        let message = current.replace
          ? `“${current.replaceName}”替换为“${course.name}”`
          : `选课“${course.name}”成功`;
        this.emit('success', message);
      } else {
        // 选课失败
        let message;
        switch (code) {
          case 10:
            message = `已修课程“${course.name}”，移出目标列表`;
            break;
          case 12:
            message = `已选数量超过限制，“${course.name}”选课失败，停止“${current.type}”选课`;
            current.enable = false;
            break;
          case 17:
            message = `课程“${course.name}”时间冲突，移出目标列表`;
            break;
        }
        if (code > 0) {
          let index = current.targets.findIndex(target => target.id === current.id);
          current.targets.splice(index, 1);
          if (!current.targets.length) {
            current.enable = false;
          }
          return this.emit('fail', message);
        }
        // 没有选上，需要时回选替换课程
        let selectBackError;
        if (current.replace) {
          try {
            code = await selectCourse({id: current.replace}, current);
          } catch (e) {
            selectBackError = e;
          }
        }

        message = current.replace
          ? `“${current.replaceName}”替换为“${course.name}”失败，回抢${selectBackError || !code ? '成功' : '失败'}`
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

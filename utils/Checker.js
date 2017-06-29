const EventEmitter = require('events');
const {delay} = require('../lib');
const util = require('./util');
const config = require('../config');
let times = 0;

/**
 * 检查器
 * @event finish     所有类型的课程都不需要监控
 * @event selectable 出现可选课程
 * 参数：
 *  course     有空位course信息
 *  current    当前选课类型相关配置
 * @event error      错误
 * 参数：
 *  error      错误详情
 * @event count      完成一次查询
 * 参数
 *  times      总次数
 * @event pause      暂停
 * @event resume     继续
 */
module.exports = class Checker extends EventEmitter {
  /**
   * 构造器
   * @method constructor
   */
  constructor () {
    super();
    this._pause = Promise.resolve();
    this._resume = null;
  }

  async start () {
    try {
      // 定义一个lable 方便退出循环
      restart:
      while (true) {
        if (this._resume) {
          this.emit('pause');
          await this._pause;
        }
        // 获取所有enbale的选课配置
        let enables = util.getEnables();
        // 没有需要选课的类型则退出
        if (!enables.length) {
          this.emit('finish');
          break restart;
        }
        let courses;
        courses = await util.getCourses();
        // 对于每种类型
        for (let current of enables) {
          // 对于每个目标
          for (let target of current.targets) {
            // 遍历所有课程 比对
            for (let course of courses) {
              // 如果可选，运行action
              if (isSelectable(current.type, target, course)) {
                this.pause();
                this.emit('selectable', {course, current});
                // 只不过是从头再来~
                continue restart;
              }
            }
          }
        }
        this.emit('count', ++times);
        await delay(config.interval);
      }
    } catch (e) {
      this.emit('error', e);
    }
  }

  pause () {
    let resolveFn;
    this._pause = new Promise(resolve => {
      resolveFn = resolve;
    });
    this._resume = resolveFn;
  }

  resume () {
    if (this._resume) {
      this._resume();
      this._resume = null;
      this.emit('resume');
    }
  }
};

/**
 * 判断课程是否满足要求，名称 时间和老师都符合，且还有剩余位置时符合
 * @param  {[type]} target 目标课程
 * @param  {[type]} course 查询课程
 * @return {[type]}        是否符合要求
 */
function isSelectable (type, target, course) {
  if (course.remain > 0 && type === course.type) {
    if (target.name instanceof RegExp) {
      return target.name.test(course.name);
    }
    return target.id === course.id;
  }
  return false;
}

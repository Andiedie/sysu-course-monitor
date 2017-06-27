const EventEmitter = require('events');
const {delay} = require('../lib');
const util = require('./util');
let times = 0;

/**
 * 检查器
 * @event finish     所有类型的课程都不需要监控
 * @event selectable 出现可选课程
 * 参数：
 *  course     有空位course信息
 *  current    当前选课类型相关配置
 *  config     配置项
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
   * @param  {[type]}   config    配置项
   */
  constructor (config) {
    super();
    this.config = config;
    this._pause = Promise.resolve();
    this._resume = null;
  }

  async start () {
    // 定义一个用于检测暂停的函数，在关键操作之前都运行一遍
    const pause = async () => {
      if (this._resume) {
        this.emit('pause');
        await this._pause;
      }
    };
    // 定义一个lable 方便退出循环
    restart:
    while (true) {
      await pause();
      // 获取所有enbale的选课配置
      let enables = util.getEnables();
      // 没有需要选课的类型则退出
      if (!enables.length) {
        this.emit('finish');
        break restart;
      }
      let courses;
      try {
        courses = await util.getCourses();
      } catch (e) {
        return this.emit('error', e);
      }
      // 对于每种类型
      for (let current of enables) {
        // 对于每个目标
        for (let target of current.targets) {
          // 遍历所有课程 比对
          for (let course of courses) {
            // 如果可选，运行action
            if (isSelectable(target, course)) {
              this.pause();
              this.emit('selectable', {
                course,
                current,
                config: this.config
              });
              // 只不过是从头再来~
              continue restart;
            }
          }
        }
      }
      this.emit('count', ++times);
      await delay(this.interval);
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
function isSelectable (target, course) {
  return target.id === course.id && course.remain > 0;
}

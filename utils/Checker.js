const EventEmitter = require('events');
const {axios: {instance}, delay} = require('../lib');
const cheerio = require('cheerio');
let times = 0;

/**
 * 检查器
 * @event finish     所有类型的课程都不需要监控
 * @event selectable 出现可选课程
 * 参数：
 *  course     有空位course信息
 *  current    当前选课类型相关配置
 *  xkjdszid   课程类型id组成的对象
 *  sid        登录id
 *  replaceId  替换课程id，可能为undefined
 * @event error      错误
 * 参数：
 *  error      错误详情
 * @event count      完成一次查询
 * 参数
 *  times      总次数
 */
module.exports = class Checker extends EventEmitter {
  /**
   * 构造器
   * @method constructor
   * @param  {[type]}    sid       登录id，由login获得
   * @param  {[type]}    xkjdszids 课程类型id组成的对象，由init获得
   */
  constructor (sid, xkjdszids, interval, settings) {
    super();
    this.xkjdszids = xkjdszids;
    this.sid = sid;
    this.interval = interval;
    this.settings = settings;
  }

  async start () {
    // 定义一个lable 方便退出循环
    restart:
    while (true) {
      // 获取所有需要选课的类型
      let keys = Object.keys(this.settings).filter(key => this.settings[key].enable);
      // 没有需要选课的类型则退出
      if (!keys.length) {
        this.emit('finish');
        break restart;
      }
      // 对于每种类型
      for (let key of keys) {
        let current = this.settings[key];
        // 请求这个类型的课程列表
        let data;
        try {
          let res = await instance().get('courses', {
            params: {
              xkjdszid: this.xkjdszids[key],
              fromSearch: false,
              sid: this.sid
            }
          });
          data = res.data;
        } catch (e) {
          return this.emit('error', e);
        }
        let $ = cheerio.load(data);
        // 如果需要替换，则获取被替换科目的id
        let replaceId;
        if (current.replace) {
          replaceId = getReplaceId($, current.replace);
        }
        // 获取所有课程列表和详细信息
        let courses = getCourses($);
        // 对于每个目标
        for (let target of current.targets) {
          // 遍历所有课程比对
          for (let course of courses) {
            // 如果可选，运行action
            if (selectable(target, course)) {
              this.emit('selectable', {
                course,
                current,
                xkjdszid: this.xkjdszids[key],
                sid: this.sid,
                replaceId
              });
              // 如果选课程成功则不再监控此类课程
              continue restart;
            }
          }
        }
        this.emit('count', ++times);
        await delay(this.interval);
      }
    }
  }
};

/**
 * 获取页面中所有的课程
 * @param  {[type]} $ cheerio实例
 * @return {[type]}   课程列表
 */
function getCourses ($) {
  let courses = $('#courses tbody tr').toArray();
  courses = courses.map(course => {
    let children = $(course).children();
    let nameTag = children.eq(1).children();
    return {
      courseId: /\d+/.exec(nameTag.attr('onclick'))[0],
      name: nameTag.text(),
      time: children.eq(3).text(),
      teacher: children.eq(4).text(),
      remain: Number(children.eq(8).text())
    };
  });
  return courses;
}

/**
 * 获取被替换课程的id
 * @param  {[type]} $       cheerio实例
 * @param  {[type]} replace 被替换的课程名
 * @return {[type]}         课程id
 */
function getReplaceId ($, replace) {
  let elements = $('#elected tbody tr').toArray();
  for (let element of elements) {
    let nameTag = $(element).children().eq(2).children();
    if (nameTag.text() === replace) {
      return /\d+/.exec(nameTag.attr('onclick'))[0];
    }
  }
}

/**
 * 判断课程是否满足要求，名称 时间和老师都符合，且还有剩余位置时符合
 * @param  {[type]} target 目标课程
 * @param  {[type]} course 查询课程
 * @return {[type]}        是否符合要求
 */
function selectable (target, course) {
  return target.name === course.name &&
         target.time === course.time &&
         target.teacher === course.teacher &&
         course.remain > 0;
}

const {axios: {instance: axios}, delay} = require('../lib');
const cheerio = require('cheerio');
const {settings, interval} = require('../config');
let times = 0;

/**
 * 循环查询课程，直到所有类型都不需要选课了
 * @param  {[type]}  xkjdszids 课程类型id组成的对象，由init获得
 * @param  {[type]}  sid       登录id，由login获得
 * @param  {[type]}  action    有空位时采取的动作
 *                             参数：
 *                             course     有空位course信息
 *                             current    当前选课类型相关配置
 *                             xkjdszid   课程类型id组成的对象
 *                             sid        登录id
 *                             replaceId  替换课程id，可能为undefined
 * @return {Promise}           所有类型都不需要选课时，promise resolve
 */
module.exports = async (xkjdszids, sid, action) => {
  console.log('开始选课');
  // 定义一个lable 方便退出循环
  restart:
  while (true) {
    // 获取所有需要选课的类型
    let keys = Object.keys(settings).filter(value => value.enable);
    // 没有需要选课的类型则退出
    if (!keys.length) {
      console.log('\n选课完成');
      break restart;
    }
    // 对于每种类型
    for (let key of keys) {
      let current = settings[key];
      // 请求这个类型的课程列表
      let {data} = await axios.get('courses', {
        params: {
          xkjdszid: xkjdszids[key],
          fromSearch: false,
          sid
        }
      });
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
            console.log(`\n发现空位：${course.name}`);
            await action({
              course,
              current,
              xkjdszid: xkjdszids[key],
              replaceId,
              sid
            });
            // 不再查询这个类型的课程，并重启查询
            current.enable = false;
            continue restart;
          }
        }
      }
      process.stdout.write(`已完成${++times}次查询\r`);
      await delay(interval);
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
  for (let ele of elements) {
    let nameTag = $(ele).children().eq(2).children();
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

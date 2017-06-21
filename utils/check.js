const {axios: {instance: axios}, delay} = require('../lib');
const cheerio = require('cheerio');
const {settings, interval} = require('../config');
let times = 0;

module.exports = async (xkjdszids, sid, action) => {
  console.log('开始选课');
  // 获取所有需要选课的类型
  let keys = Object.keys(settings).filter(value => value.enable);
  while (true) {
    // 没有需要选课的类型则退出
    if (!keys.length) {
      console.log('\n选课完成');
      break;
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
      // 对于每个待选课程，遍历所有课程
      let courses = $('#courses tbody tr').toArray();
      for (let target of current.targets) {
        for (let course of courses) {
          // 获取课程基本信息
          let children = $(course).children();
          let nameTag = children.eq(1).children();
          let name = nameTag.text();
          let time = children.eq(3).text();
          let teacher = children.eq(4).text();
          let remain = children.eq(8).text();
          // 名称 时间和老师都符合，且还有剩余位置时，运行action
          let isTarget =
            target.name === name &&
            target.time === time &&
            target.teacher === teacher;
          if (isTarget && remain !== '0') {
            console.log(`\n发现空位：${name}`);
            let courseId = /\d+/.exec(nameTag.attr('onclick'))[0];
            await action({
              courseId,
              name,
              xkjdszid: xkjdszids[key],
              current,
              replaceId,
              sid
            });
            break;
          }
        }
      }
      process.stdout.write(`已完成${++times}次查询\r`);
      await delay(interval);
    }
  }
};

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

const {axios: {instance}, delay, log} = require('../lib');
const config = require('../config');
const util = require('./util');
const cheerio = require('cheerio');
const qs = require('querystring');
const url = require('url');

/**
 * 收集并验证数据
 */
module.exports = async () => {
  await indexInformation();
  await check();
};

/**
 * 获取首页的信息 比如xkjdszid xnd和xq
 * @method indexInformation
 */
async function indexInformation () {
  while (true) {
    // 请求数据
    let {data} = await instance().get('types', {
      params: {
        sid: config.sid
      }
    });
    // 从页面中提取
    let $ = cheerio.load(data);
    let arr = $('tbody tr').slice(0, 4).find('a').toArray();
    if (!arr.length) {
      await delay(config.interval);
      continue;
    }
    config.year = $('#xnd').val();
    config.semester = $('#xq').val();
    arr.forEach(ele => {
      let name = /[专选公必]{2}/.exec($(ele).text())[0];
      let query = qs.parse(url.parse($(ele).attr('href')).query);
      config[name].id = query.xkjdszid;
    });
    break;
  }
}

/**
 * 确保填写的目标和替换课程都可用
 * @method check
 */
async function check () {
  // 获取所有enbale的选课配置
  let enables = util.getEnables();
  // 获取所有目标
  let targets = [];
  for (let {targets: _targets} of enables) {
    targets.push(..._targets);
  }
  let courses = await util.getCourses();
  for (let target of targets) {
    if (target.id) {
      // 具体信息
      for (let course of courses) {
        if (target.id === course.id) {
          target.name = course.name;
          break;
        }
      }
    } else {
      // 模糊信息
      target.name = new RegExp(target.name);
    }
    if (!target.name) {
      log.error(`目标课程 ${target.id} (${target.comment}) 不存在`);
    }
  }

  let selecteds = await util.getSelected();
  for (let current of enables) {
    if (current.replace) {
      for (let selected of selecteds) {
        if (current.replace === selected.id) {
          current.replaceName = selected.name;
          break;
        }
      }
      if (!current.replaceName) {
        log.error(`替换课程 ${current.replace} 不存在`);
      }
    }
  }
}

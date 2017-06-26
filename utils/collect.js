const {axios: {instance}, delay, log} = require('../lib');
const util = require('./util');
const cheerio = require('cheerio');
const qs = require('querystring');
const url = require('url');

/**
 * 收集并验证数据
 * @param  {[type]}  config  配置项
 */
module.exports = async (config) => {
  await getXkjdszid(config);
  await check(config);
};

async function getXkjdszid (config) {
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
    arr.forEach(ele => {
      let name = /[专选公必]{2}/.exec($(ele).text())[0];
      let query = qs.parse(url.parse($(ele).attr('href')).query);
      config[name].id = query.xkjdszid;
    });
    break;
  }
}

async function check (config) {
  // 获取所有enbale的选课配置
  let settings = Object.values(config).filter(value => value.enable);
  for (let current of settings) {
    let {data} = await instance().get('courses', {
      params: {
        xkjdszid: current.id,
        fromSearch: false,
        sid: config.sid
      }
    });
    let $ = cheerio.load(data);
    // 检查目标是否存在
    let courses = util.getCourses($);
    for (let target of current.targets) {
      for (let course of courses) {
        if (target.id === course.id) {
          target.name = course.name;
        }
      }
      if (!target.name) {
        log.error(`目标课程 ${target.id} (${target.comment}) 不存在`);
      }
    }
    // 检查replace是否存在
    if (current.replace) {
      let selected = util.getSelected($);
      for (let course of selected) {
        if (current.replace === course.id) {
          current.replaceName = course.name;
        }
      }
      if (!current.replaceName) {
        log.error(`替换课程 ${current.replace} 不存在`);
      }
    }
  }
}

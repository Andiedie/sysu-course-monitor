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
  await indexInformation(config);
  await check(config);
};

/**
 * 获取首页的信息 比如xkjdszid xnd和xq
 * @method indexInformation
 * @param  {[type]}         config [description]
 * @return {[type]}                [description]
 */
async function indexInformation (config) {
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
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
async function check (config) {
  // 获取所有enbale的选课配置
  let enables = util.getEnables();
  // 获取所有目标
  let targets = [];
  for (let {targets: _targets} of enables) {
    targets.push(..._targets);
  }
  let courses = await util.getCourses();
  let selecteds = await util.getSelected();
  for (let target of targets) {
    for (let course of courses) {
      if (target.id === course.id) {
        target.name = course.name;
      }
    }
    if (!target.name) {
      log.error(`目标课程 ${target.id} (${target.comment}) 不存在`);
    }
  }
  for (let current of enables) {
    if (current.replace) {
      for (let selected of selecteds) {
        if (current.replace === selected.id) {
          current.replaceName = selected.name;
        }
      }
      if (!current.replaceName) {
        log.error(`替换课程 ${current.replace} 不存在`);
      }
    }
  }
}

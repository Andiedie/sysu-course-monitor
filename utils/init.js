const {axios: {instance: axios}, delay} = require('../lib');
const cheerio = require('cheerio');
const qs = require('querystring');
const url = require('url');
const config = require('../config');

module.exports = async sid => {
  console.log('进入选课系统');
  let xkjdszids;
  do {
    if (xkjdszids) {
      await delay(config.interval);
    } else {
      xkjdszids = {};
    }
    let {data} = await axios.get('types', {
      params: {sid}
    });
    let $ = cheerio.load(data);
    $('tbody tr').slice(0, 4).find('a').each((index, ele) => {
      let name = /[\u516c\u5fc5\u4e13\u9009]{2}/.exec($(ele).text())[0];
      xkjdszids[name] = qs.parse(url.parse($(ele).attr('href')).query).xkjdszids;
    });
  } while (isEmpty(xkjdszids));
  console.log('进入选课系统成功');
  return xkjdszids;
};

function isEmpty (obj) {
  return Object.keys(obj).length === 0;
}

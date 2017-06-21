const {axios: {instance: axios}, delay} = require('../lib');
const cheerio = require('cheerio');
const qs = require('querystring');
const url = require('url');
const config = require('../config');

module.exports = async sid => {
  console.log('等待选课开始');
  let xkjdszid;
  do {
    if (xkjdszid) {
      console.log(`等待${config.interval}秒...`);
      await delay(config.interval);
    } else {
      xkjdszid = {};
    }
    console.log(`检查中...`);
    let {data} = await axios.get('types', {
      params: {sid}
    });
    let $ = cheerio.load(data);
    $('tbody tr').slice(0, 4).find('a').each((index, ele) => {
      let name = /[\u516c\u5fc5\u4e13\u9009]{2}/.exec($(ele).text())[0];
      xkjdszid[name] = qs.parse(url.parse($(ele).attr('href')).query).xkjdszid;
    });
  } while (isEmpty(xkjdszid));
  console.log(`成功`);
  return xkjdszid;
};

function isEmpty (obj) {
  return Object.keys(obj).length === 0;
}

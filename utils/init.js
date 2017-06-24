const {axios: {instance: axios}, delay} = require('../lib');
const cheerio = require('cheerio');
const qs = require('querystring');
const url = require('url');

/**
 * 初始化xkjdszids数据
 * @method exports
 * @param  {[type]}  sid      登陆后获得的sid
 * @param  {[type]}  interval 查询间隔
 * @return {Promise}          xkjdszids
 */
module.exports = async (sid, interval) => {
  console.log('进入选课系统');
  let xkjdszids;
  do {
    // 第二次循环开始 延迟一段时间
    if (xkjdszids) {
      await delay(interval);
    } else {
      xkjdszids = {};
    }
    let {data} = await axios.get('types', {
      params: {sid}
    });
    // 从页面中提取
    let $ = cheerio.load(data);
    $('tbody tr').slice(0, 4).find('a').each((index, ele) => {
      let name = /[\u516c\u5fc5\u4e13\u9009]{2}/.exec($(ele).text())[0];
      xkjdszids[name] = qs.parse(url.parse($(ele).attr('href')).query).xkjdszids;
    });
  } while (isEmpty(xkjdszids));
  console.log('进入选课系统成功');
  return xkjdszids;
};

/**
 * 判断一个对象是否为空
 * @param  {[type]}  obj 对象
 * @return {Boolean}     是否为空
 */
function isEmpty (obj) {
  return Object.keys(obj).length === 0;
}

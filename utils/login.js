const {axios: {instance}} = require('../lib');
const config = require('../config');
const cheerio = require('cheerio');
const qs = require('querystring');
const assert = require('assert');
const url = require('url');

/**
 * 登录
 */
module.exports = async () => {
  // 访问NetID登录页面获取cookie
  let res = await instance().get('https://cas.sysu.edu.cn/cas/login', {
    params: {
      service: 'http://uems.sysu.edu.cn/elect/casLogin'
    }
  });
  // 获取jssessionid
  let jsessionid = getJsessionId(res.headers['set-cookie']);
  // 获取post参数
  let {lt, execution} = getPostArgs(res.data);
  // 登录NetID
  let login = instance().post(`https://cas.sysu.edu.cn/cas/login;jsessionid=${jsessionid}`,
    qs.stringify({
      username: config.netid,
      password: config.password,
      lt,
      execution,
      _eventId: 'submit',
      submit: '登录'
    }), {
      params: {
        service: 'http://uems.sysu.edu.cn/elect/casLogin'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  // 登录后，获取ticket
  let location = await redirect(login);
  // 带着ticket转跳到选课系统
  location = await redirect(location);
  // 选课系统验证，获取sid
  location = await redirect(location);
  let {sid} = qs.parse(url.parse(location).query);
  config.sid = sid;
};

/**
 * 从cookies中提取jsessionid
 * @param  {[type]} cookies 返回头中的cookies
 * @return {[type]}         jsessionid
 */
function getJsessionId (cookies) {
  return /JSESSIONID=([A-Z0-9]{32});/.exec(cookies)[1];
}

/**
 * 从NetID登录页面中提取post需要的参数
 * @param  {[type]} html 登录页面
 * @return {[type]}      参数lt和execution组成的对象
 */
function getPostArgs (html) {
  let $ = cheerio.load(html);
  let lt = $('input[name=lt]').attr('value');
  let execution = $('input[name=execution]').attr('value');
  return {
    lt,
    execution
  };
}

/**
 * 访问url并进行302重定向
 * @param  {[type]} url 需要访问的url
 * @return {[type]}     返回重定向后的url
 */
async function redirect (url) {
  try {
    if (url instanceof Promise) {
      await url;
    } else {
      await instance().get(url);
    }
    // 应该返回302 若返回2xx则代表转跳失败
    throw new Error('fail to redirect');
  } catch ({response}) {
    assert(response && response.status === 302);
    return response.headers.location;
  }
}

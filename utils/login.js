const axios = require('./axios').instance;
const cheerio = require('cheerio');
const qs = require('querystring');
const assert = require('assert');
const url = require('url');

module.exports = async (netid, password) => {
  // 访问Netid登录页面获取cookie
  let res = await axios.get('https://cas.sysu.edu.cn/cas/login', {
    params: {
      service: 'http://uems.sysu.edu.cn/elect/casLogin'
    }
  });
  // 获取jssessionid
  let jsessionid = getJsessionId(res.headers['set-cookie']);
  // 获取post参数
  let {lt, execution} = getPostArgs(res.data);
  // 登录Netid
  let login = axios.post(`https://cas.sysu.edu.cn/cas/login;jsessionid=${jsessionid}`,
    qs.stringify({
      username: netid,
      password,
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
  // 带着ticket转跳到抢课系统
  location = await redirect(location);
  // 抢课系统验证，获取sid
  location = await redirect(location);
  let sid = qs.parse(url.parse(location).query);
  return sid;
};

function getJsessionId (cookies) {
  return /JSESSIONID=([A-Z0-9]{32});/.exec(cookies)[1];
}

function getPostArgs (html) {
  let $ = cheerio.load(html);
  let lt = $('input[name=lt]').attr('value');
  let execution = $('input[name=execution]').attr('value');
  return {
    lt,
    execution
  };
}

async function redirect (url) {
  try {
    if (url instanceof Promise) {
      await url;
    } else {
      await axios.get(url);
    }
    // 应该返回302 若返回2xx则代表转跳失败
    throw new Error('fail to redirect');
  } catch ({response}) {
    assert(response && response.status === 302);
    return response.headers.location;
  }
}

module.exports();

const axios = require('axios');
require('node-axios-cookiejar')(axios);
const tough = require('tough-cookie');
const cookieJar = new tough.CookieJar();
let instance;

exports.refresh = () => {
  instance = axios.create({
    baseURL: 'http://uems.sysu.edu.cn/elect/s/',
    jar: cookieJar,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36'
    },
    maxRedirects: 0
  });
  return instance;
};
exports.refresh();

exports.instance = instance;

const {login, initialize, collect, Checker, Selector, util} = require('./utils');
const {wxinform, axios, log} = require('./lib');

let lastReloginTime = new Date().getTime();
// 正数代表短时间内重登陆次数 负数表示不允许重登陆
let reloginTimes = 0;

main();
async function main () {
  // 读取配置
  log('初始化数据...');
  const config = initialize();
  if (util.getEnables().length === 0) {
    return log('无待执行任务');
  } else {
    log('初始化完成');
  }

  // 登录
  log('登录中...');
  try {
    await login();
  } catch (e) {
    log(e);
    return log('登录失败');
  }
  log('登陆成功');

  // 收集并验证数据
  log('正在进入选课系统...');
  try {
    await collect();
  } catch (e) {
    log(e);
    return log('进入选课系统失败');
  }
  log('进入选课系统成功');

  // 初始化 课程查询 和 选课
  const checker = new Checker();
  const selector = new Selector();
  const relogin = _relogin.bind(null, config, checker);

  log('开始查询');
  checker
    .on('count', log.line)
    .on('selectable', option => {
      log(`发现空位${option.course.name}`);
      selector.select(option);
    })
    .on('pause', log.bind(null, '暂停查询'))
    .on('resume', log.bind(null, '继续查询'))
    .on('finish', log.bind(null, '任务完成'))
    .on('error', relogin)
    .start();

  selector
    .on('success', message => {
      wxinform('选课成功', message);
      log(message);
      checker.resume();
    })
    .on('fail', message => {
      wxinform('选课失败', message);
      log(message);
      checker.resume();
    })
    .on('error', relogin);
}

async function _relogin (config, checker) {
  if (reloginTimes < 0) return;
  let current = new Date().getTime();
  if (current - lastReloginTime < 3 * config.interval) {
    reloginTimes++;
    if (reloginTimes >= 3) {
      reloginTimes = -1;
      lastReloginTime = current;
      setTimeout(() => {
        reloginTimes = 0;
        _relogin(config, checker);
      }, 300000);
      return wxinform('错误', '短时间内出现大量重新登陆，5分钟后重试');
    }
  } else {
    reloginTimes = 0;
  }
  lastReloginTime = current;
  log('查询时出现错误，正在重新登录');
  axios.refresh();
  try {
    await login();
  } catch (e) {
    log(e);
    log.error('登录失败');
  }
  wxinform('异常', '已重新登录，继续选课');
  log('登陆成功，继续选课');
  checker.resume();
  checker.start();
};

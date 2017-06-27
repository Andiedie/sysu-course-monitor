const {login, initialize, collect, Checker, Selector, util} = require('./utils');
const {inform, axios, log} = require('./lib');

main();
async function main () {
  // 读取配置
  log('初始化数据...');
  initialize();
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

  let relodgin = async e => {
    log('查询时出现错误，正在重新登录');
    axios.refresh();
    try {
      await login();
    } catch (e) {
      log(e);
      log.error('登录失败');
    }
    log('登陆成功，继续选课');
    checker.start();
  };

  log('开始查询');
  checker
    .on('count', log.line)
    .on('selectable', option => {
      log(`发现空位${option.course.name}`);
      checker.pause();
      selector.select(option);
    })
    .on('pause', log.bind(null, '暂停查询'))
    .on('resume', log.bind(null, '继续查询'))
    .on('finish', log.bind(null, '任务完成'))
    .on('error', relodgin)
    .start();

  selector
    .on('success', ({message, current}) => {
      current.enable = false;
      checker.resume();
      inform('选课成功', message);
      log(message);
    })
    .on('fail', inform.bind(null, '选课失败'))
    .on('error', relodgin);
}

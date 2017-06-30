const {login, initialize, collect, Checker, Selector, util} = require('./utils');
const {wxinform, axios, log} = require('./lib');

main();
async function main () {
  // 读取配置
  log('初始化数据...');
  const config = initialize();
  const enables = util.getEnables();
  if (enables.length) {
    log('初始化完成');
  } else {
    log.error('无待执行任务');
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

  let outputConfig = '当前配置：\n';
  outputConfig += `查询间隔：${config.interval}毫秒\n`;
  enables.forEach(current => {
    outputConfig += `\n-- ${current.type}：
                     ---- 替换课程：${current.replace ? current.replaceName : '无'}
                     ---- 目标课程：
                     ------ `;
    outputConfig += current.targets.map(({name}) => name instanceof RegExp ? name.source : name).join('\n------ ');
    outputConfig += '\n';
  });
  log(outputConfig);

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

async function _relogin (config, checker, e) {
  if (e.message !== 'socket hang up') {
    log(e.stack);
    log('重登陆错误，程序已退出');
    await wxinform('错误', e.message);
    process.exit(0);
  }
  log('查询时出现错误，正在重新登录');
  axios.refresh();
  try {
    await login();
  } catch (e) {
    log(e.stack);
    log('重登录失败，程序已退出');
    await wxinform('错误', '重登录失败，程序已退出');
    process.exit(0);
  }
  log('登陆成功，继续选课');
  wxinform('异常', '已重新登录，继续选课');
  checker.resume();
  checker.start();
};

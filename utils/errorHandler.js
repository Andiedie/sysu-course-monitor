const login = require('./login');
const collect = require('./collect');
const {wxinform, axios, log} = require('../lib');

module.exports = async (checker, e) => {
  switch (e.message) {
    case 'socket hang up':
      await relogin(checker);
      break;
    case 'no course':
      await reload(checker);
      break;
    default:
      await exit(e);
  }
};

async function relogin (checker) {
  axios.refresh();
  try {
    await login();
  } catch (err) {
    log(err);
    log('查询时出现异常，重登录失败，程序已退出');
    await wxinform('错误', '查询时出现异常，重登录失败，程序已退出');
    process.exit(0);
  }
  log('查询时出现异常，重新登陆成功，继续选课');
  wxinform('异常', '查询时出现异常，已重新登录，继续选课');
  checker.resume();
  checker.start();
}

async function exit (e) {
  log(e.stack);
  log('运行时出现错误，程序已退出');
  await wxinform('错误', e.message);
  process.exit(0);
}

async function reload (checker) {
  try {
    await collect();
  } catch (err) {
    log(err);
    log('获取课程列表异常，重新进入选课系统失败，程序已退出');
    await wxinform('错误', '获取课程列表异常，重新进入选课系统失败，程序已退出');
    process.exit(0);
  }
  log('获取课程列表异常，重新进入选课系统成功，继续选课');
  wxinform('异常', '获取课程列表异常，重新进入选课系统成功，继续选课');
  checker.resume();
  checker.start();
}

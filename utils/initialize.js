const config = require('../config');
const {log} = require('../lib');

module.exports = () => {
  let settings;
  // 选课设置
  try {
    settings = require('../config/settings.json');
  } catch (e) {
    log.error('选课设置文件 config/settings.json 格式错误');
  }
  for (let key in settings) {
    let setting = settings[key];
    if (setting.enable && !setting.targets.length) {
      log.error(`请为"${key}"填入必要的课程信息`);
    }
  }
  for (let key in settings) {
    settings[key].type = key;
  }
  return Object.assign(config, settings);
};

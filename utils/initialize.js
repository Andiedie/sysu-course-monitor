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
    if (setting.enable) {
      if (!setting.targets.length) {
        log.error(`请为"${key}"填入必要的目标课程信息`);
      }
      for (let i = 0; i < setting.targets; i++) {
        if (!setting.targets[i].id && !setting.targets[i].name) {
          log.error(`"${key}"的目标课程中缺少id或name字段`);
        }
      }
    }
    setting.type = key;
  }
  return Object.assign(config, settings);
};

const config = require('../config');
const {log} = require('../lib');
const {getEnables} = require('./util');

module.exports = () => {
  let outputConfig = '当前配置：\n';
  outputConfig += `查询间隔：${config.interval}毫秒\n`;
  getEnables().forEach(current => {
    outputConfig += `\n ${current.type}：
                     ----- 替换课程：${current.replace ? current.replaceName : '无'}
                     ----- 目标课程：
                     -------------- `;
    outputConfig += current.targets.map(({name}) => name instanceof RegExp ? name.source : name).join('\n-------------- ');
    outputConfig += '\n';
  });
  log(outputConfig);
};

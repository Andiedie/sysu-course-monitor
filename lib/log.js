const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs-extra');
const isDev = process.env.NODE_ENV !== 'production';

fs.ensureDirSync(path.resolve(__dirname, '../logs/'));

let transports = [
  new winston.transports.File({
    name: 'error-log',
    filename: path.resolve(__dirname, '../logs/error.log'),
    level: 'error',
    json: false,
    formatter (options) {
      let now = new Date();
      let timestamp = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      let format = `${timestamp}: ${options.message ? options.message : ''} ${options.meta && Object.keys(options.meta).length ? 'META: ' + JSON.stringify(options.meta) : ''}`;
      return format;
    }
  })
];

transports.push(new winston.transports.DailyRotateFile({
  filename: path.resolve(__dirname, '../logs/log'),
  datePattern: 'yyyy-MM-dd.',
  prepend: true,
  level: 'info',
  json: false,
  formatter (options) {
    let now = new Date();
    let timestamp = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    let format = `${timestamp} ${options.level.toUpperCase()}: ${options.message ? options.message : ''} ${options.meta && Object.keys(options.meta).length ? 'META: ' + JSON.stringify(options.meta) : ''}`;
    return format;
  }
}));

if (isDev) {
  transports.push(new winston.transports.Console());
}

let logger = new winston.Logger({
  level: isDev ? 'debug' : 'info',
  transports
});

module.exports = logger;

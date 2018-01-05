const {axios: {instance}} = require('../lib');
const cheerio = require('cheerio');
const config = require('../config');

/**
 * 获取所有需要查询的课程类型
 * @method getEnables
 * @return {[type]}          需要查询的课程类型数组
 */
exports.getEnables = () => {
  return Object.values(config).filter(value => value.enable);
};

/**
 * 获取所有的课程
 * @return {[type]}            课程列表
 */
exports.getCourses = async () => {
  let {data} = await instance().get('courses', {
    params: {
      sid: config.sid,
      xnd: config.year,
      xq: config.semester,
      fromSearch: true,
      xf1: 0
    }
  });
  let $ = cheerio.load(data);
  let courses = $('#courses tbody tr').toArray();
  courses = courses.map(course => {
    let children = $(course).children();
    let nameTag = children.eq(1).children();
    let remainTag = children.eq(8);
    let typeTag = children.eq(2);
    return {
      id: /'(.*?)'/.exec(nameTag.attr('onclick'))[1],
      name: nameTag.text().trim(),
      type: typeTag.text().trim(),
      remain: Number(remainTag.text().trim())
    };
  });
  return courses;
};

/**
 * 获取已选课程
 * @return {[type]}            已选课程列表
 */
exports.getSelected = async () => {
  let {data} = await instance().get('courseAll', {
    params: {
      sid: config.sid,
      xnd: config.year,
      xq: config.semester
    }
  });
  let $ = cheerio.load(data);
  let courses = $('#elected tbody tr').toArray();
  courses = courses.map(course => {
    let children = $(course).children();
    let nameTag = children.eq(3).children();
    return {
      id: /'(.*?)'/.exec(nameTag.attr('onclick'))[1],
      name: nameTag.text()
    };
  });
  return courses;
};

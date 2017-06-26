/**
 * 获取页面中所有的课程
 * @param  {[type]} $ cheerio实例
 * @return {[type]}   课程列表
 */
exports.getCourses = ($) => {
  let courses = $('#courses tbody tr').toArray();
  courses = courses.map(course => {
    let children = $(course).children();
    let nameTag = children.eq(1).children();
    return {
      id: /\d+/.exec(nameTag.attr('onclick'))[0],
      name: nameTag.text(),
      remain: Number(children.eq(8).text())
    };
  });
  return courses;
};

/**
 * 获取已选课程
 * @param  {[type]}  $  cheerio实例
 * @return {[type]}     已选课程列表
 */
exports.getSelected = ($) => {
  let courses = $('#elected tbody tr').toArray();
  courses = courses.map(course => {
    let children = $(course).children();
    let nameTag = children.eq(2).children();
    return {
      id: /\d+/.exec(nameTag.attr('onclick'))[0],
      name: nameTag.text()
    };
  });
  return courses;
};

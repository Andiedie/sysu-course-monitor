/**
 * 延迟一段时间
 * @method exports
 * @param  {[type]} ms 毫秒
 * @return {[type]}    延迟后promise resolve
 */
module.exports = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

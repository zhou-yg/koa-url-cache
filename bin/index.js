/**
 * Created by zyg on 16/7/15.
 */
var cache = new Map();

function isExpired(t1,now,expires){
  return now - t1 > expires;
}

function getExpireKey(key){
  return `expire://${key}`;
}
/**
 * @param config
 *    test:匹配的正则,
 *    expires:缓存过期时间
 * @returns {Function}
 */
module.exports = function (config){

  const testReg = config.test;
  const expires = Number(config.expires || 0);
  const debug = config.debug

  return function *(next){
    if(testReg) {


      var dataKey = this.url;
      var expireKey = getExpireKey(dataKey);

      var cacheData = cache.get(dataKey);
      var cacheExpiredTime = cache.get(expireKey);

      var now = Date.now();

      //console.log(cacheData);
      //console.log(cacheExpiredTime)
      //console.log(now);
      //console.log(expires);
      //console.log('------');

      if (cacheData && !isExpired(cacheExpiredTime, now, expires)) {

        console.log(`${dataKey} cache`);

        this.body = cacheData;
      } else {
        //
        yield next;

        if (testReg.test(this.url)) {

          cache.set(dataKey, this.body);
          cache.set(expireKey, now);
        }
      }
    }else{
      yield next;
    }
  }
};
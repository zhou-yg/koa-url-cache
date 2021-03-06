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
function urlCache(config){

  const testReg = config.test;
  const expires = Number(config.expires || 0);
  const debug = config.debug;
  const myCache = config.cache;

  //按先后排序的stack;
  var dataKeyStack = [];
  
  var useCache = myCache || cache;

  return function *(next){
    if(!this.urlCache){
      this.urlCache = useCache;
    }

    if(testReg) {


      var dataKey = this.url;
      var expireKey = getExpireKey(dataKey);

      var cacheData = useCache.get(dataKey);
      var cacheExpiredTime = useCache.get(expireKey);

      var now = Date.now();

      var expired = isExpired(cacheExpiredTime, now, expires);


      //console.log('useCache.length',useCache.size,dataKeyStack.length);
      //console.log(cacheData);
      //console.log(cacheExpiredTime)
      //console.log(now);
      //console.log(expires);
      //console.log('------');

      //清理过期数据
      if(expired){
        var i = dataKeyStack.indexOf(dataKey);

        if(i>=0){
          dataKeyStack.slice(0,i+1).map(expiredDataKey=>{

            var expiredExpireKey = getExpireKey(expiredDataKey);

            useCache.delete(expiredDataKey);
            useCache.delete(expiredExpireKey);
          });
          dataKeyStack = dataKeyStack.slice(i+1);
        }
      }

      if (cacheData && !expired) {

        console.log(`${dataKey} cache`);

        this.body = cacheData;
      } else {

        yield next;

        if (testReg.test(this.url)) {

          useCache.set(dataKey, this.body);
          useCache.set(expireKey, now);
          dataKeyStack.push(dataKey);
        }
      }
    }else{
      yield next;
    }
  }
}

module.exports = urlCache;
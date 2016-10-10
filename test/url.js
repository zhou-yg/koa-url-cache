/**
 * Created by zyg on 16/10/2.
 */
var koa = require('koa')

var myMiddleWare = require('../index');

var app = new koa();
var i=0;
app.use(myMiddleWare({
  test:/\/api\//,
  expires:10*1000
}));

app.use(function *() {


  this.body = '成功'+(i++)
});


app.listen(3000);

console.log('on 3000')
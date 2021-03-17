//======================
//路由
//======================

//导入路由控制器
let routesController = require(__basename + '/routes_controller/routes_controller.js');

//导出路由函数
module.exports = app => {

  //请求域拦截(白名单)
  app.use(routesController.verfiyHost);

  //验证码拦截(白名单)
  app.use(routesController.verifyCode);

  //验证登录(白名单)
  app.use(routesController.verifyToken);

  //注册接口
  app.post('/register', routesController.register);

  //发邮件
  app.post('/email', routesController.email);

  //登录
  app.post('/login', routesController.login);

  //获取用户信息
  app.get('/getUserInfo', routesController.getUserInfo);

  //获取商品类型
  app.get('/type', routesController.getTypeData);

  //发布商品
  app.post('/postProduct', routesController.postProduct);

  //搜索商品
  app.get('/search', routesController.search);

  //查询商品数目
  app.get('/count', routesController.count);

}
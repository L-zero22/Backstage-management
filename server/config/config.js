//======================
//基础配置
//======================

//一个文件只有module.exports导出, 可以有多个exports导出
//exports导出，相当于给module.exports添加属性

//服务器配置
exports.serverOptions = {
  host: 'http://127.0.0.1',
  port: 10001,
  baseUrl: '/static/file/'
}


//随机昵称
exports.nickNameOptions = [
  '彩虹',
  '白云',
  '森林',
  '蓝天',
  '大海',
  '领悟',
  '实诚',
  '飞鸟',
  '老鹰',
  '白兔',
  '绿竹'
];

//加盐配置, 用于加强加密
exports.saltOptions = {
  //密码加盐
  pwd: '?pwd_'
}

//数据库配置
exports.mysqlOptions = {
  //数据库名称
  database: 'me_db',

  //用户名
  username: 'root',

  //登录密码
  password: 'asdqwe123',

  //数据库地址
  host: 'localhost',

  //数据库类型
  dialect: 'mysql',

  //时区
  timezone: '+08:00',

  //字段以_命名
  underscored: true
}

//邮件配置, 验证码
exports.emailOptions = {
  //邮件服务器地址
  host: 'smtp.qq.com',

  //端口, 25端口在阿里云服务器被禁止的, 建议使用465
  port: 465,

  //如果端口为465, 此项需要设置true, 其他端口需要修改为false
  secure: true,

  //用户名，发件地址（邮箱地址）
  user: '',

  //邮箱授权码
  pass: '',

  //验证码有效时间, 单位：毫秒
  expires: 5 * 60 * 1000
}

//允许请求(白名单)
exports.hostOptions = [
  'http://127.0.0.1:8080',
  'http://192.168.101.188:8080'
]

//验证验证码请求路径
exports.codeUrlOptions = [
  '/register'
]

//token配置
exports.tokenOptions = {
  //token加盐
  salt: '_t_k',
  //有效时间
  expires: '1d',

  //需要验证token的请求路径
  tokenUrls: [
    '/getUserInfo',
    '/type',
    '/postProduct',
    '/search',
    '/count'
  ]
}
//======================
//路由控制器
//======================

//导入API, 操作mysql数据库
let api = require(__basename + '/api/api.js');

//导入utils, 调用公共方法
let utils = require(__basename + '/utils/utils.js');

class RoutesController {

  //请求域拦截
  verfiyHost(req, res, next) {

    if (config.hostOptions.indexOf(req.headers.origin) === -1) {
      return res.send({msg: '请求域不合法', status: 1020});
    }

    //允许通过
    next();
  }

  //验证码拦截
  verifyCode(req, res, next) {
    let url = req.url.split('?')[0];
    if (config.codeUrlOptions.indexOf(url) > -1) {
      //验证验证码
      // console.log('req.body ==> ', req.body);

      //根据codeId查询验证码信息
      api.findData({
        modelName: 'Code',
        condition: {
          codeId: req.body.codeId
        }
      }).then(result => {
        // console.log('result ==> ', result);
        //获取当前时间 和 验证码有效时间 差
        let time = new Date().getTime() - config.emailOptions.expires;

        //获取验证码保存时间
        let codeTime = new Date(result[0].dataValues.createdAt).getTime()

        //如果验证码保存时间 >= time
        let isPass = req.body.validcode == result[0].dataValues.text && req.body.email == result[0].dataValues.email && codeTime >= time;
        if (isPass) {
          //如果验证通过，则将请求传递给下一个中间件或者路由
          next();

        } else {
          res.send({msg: '验证码错误', status: 1031});
        }

      }).catch(err => {
        console.log('err ==> ', err);
        res.send({msg: '验证码错误', status: 1031});
      })

    } else {
      //无需验证验证码, 直接将请求传递给下一个中间或者路由
      next();
    }
  }

  //验证Token(验证登录)
  verifyToken(req, res, next) {

    let url = req.url.split('?')[0];
    if (config.tokenOptions.tokenUrls.indexOf(url) > -1) {
      //需要验证token
      if (!req.headers.token) {
        return res.send({msg: '请先登录', status: 1034});
      }

      let cookie = utils.transformCookie(req.headers.token);
      
      let token = [cookie.mama12, cookie.nana20, cookie.mama20].join('.');
      // console.log('token ==> ', token);

      //验证token
      utils.verifyToken(token).then(result => {
        // console.log('result ==> ', result);
        //将userId传递
        req.userId = result.data;

        //验证通过，传递给下一个中间或者路由
        next();

      }).catch(err => {
        res.send({msg: '请先登录', status: 1034});
      })
    } else {
      next();
    }
    
  }

  //注册接口
  register(req, res) {
    //插入数据 ==> 模型.create(创建数据对象)

    //查询邮箱是否已经被注册
    api.findData({
      modelName: 'User',
      condition: {
        email: req.body.email
      },
      attributes: ['email']
    }).then(result => {

      //如果邮箱已经被注册，则提示用户该邮箱已经被注册
      if (result.length > 0) {
        res.send({ msg: '该邮箱已经被注册', status: 1002 });
      } else {
        //注册
        //创建用户id
        let userId = '_uid' + new Date().getTime();

        //随机昵称
        let index = Math.floor(Math.random() * config.nickNameOptions.length);
        let nickName = config.nickNameOptions[index] + userId;

        //加密密码
        let password = utils.encodeString(req.body.password);
        // console.log('password ==> ', password);

        //添加用户数据，注册用户
        api.createData('User', {
          email: req.body.email,
          password,
          nickName,
          userId
        }).then(result => {
          res.send({ msg: '注册成功', status: 1000, result });
        }).catch(err => {
          console.log('err ==> ', err);
          res.send({ msg: '注册失败', status: 1001 });
        })

      }

    }).catch(err => {
      console.log('err ==> ', err);
      res.send({ msg: '注册失败', status: 1001 });
    })

  }

  //发邮件
  email(req, res) {

    // console.log('req.body ==> ', req.body);

    //随机生成验证码
    let code = utils.randomCode();
    // console.log('code ==> ', code);

    //生成验证码唯一id
    let codeId = 'cid' + new Date().getTime();

    //先把验证码存储，再发邮件给用户
    api.createData('Code', {
      email: req.body.email,
      codeId,
      text: code
    }).then(result => {
      // console.log('result.dataValues ==> ', result.dataValues);
      //如果创建成功
      if (result.dataValues) {

        //开发时，屏蔽发邮件
        res.send({msg: `验证码已发至${req.body.email}`, status: 1010, cid: codeId});
        // return;

        //发邮件
        // utils.sendEmail({
        //   to: req.body.email,
        //   subject: '验证码',
        //   text: `验证码为：${code},${config.emailOptions.expires / 1000 / 60}分钟内有效。`
        // }).then(result => {
        //   res.send({msg: `验证码已发至${result.accepted[0]}`, status: 1010, cid: codeId});
        // }).catch(err => {
        //   console.log('err ==> ', err);
        //   res.send({msg: '发送验证码失败', status: 1011});
        // })

      } else {
        res.send({msg: '发送验证码失败', status: 1011});
      }
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({msg: '发送验证码失败', status: 1011});
    })

  }

  //登录
  login(req, res) {
    console.log('req.body ==> ', req.body);
    //根据邮箱查询用户信息
    api.findData({
      modelName: 'User',
      condition: {
        email: req.body.email
      },
      attributes: ['userId', 'password']
    }).then(result => {
      console.log('result ==> ', result);
      //如果存在用户
      if (result.length > 0) {
        //验证密码是否正确
        let password = utils.encodeString(req.body.password);
        if (password == result[0].dataValues.password) {
          //生成token：加密的字符串，一般用于身份验证，登录验证
          let token = utils.signToken(result[0].dataValues.userId);
          console.log('token ==> ', token);

          //将token切片
          let ts = token.split('.');

          let tsObj = {
            mama12: ts[0],
            nana20: ts[1],
            //干扰项
            nana19: 'uyTrgabciOGHgsadrtjhaCI6Ik98EwahbvD',
            mama20: ts[2],
            
          }

          res.send({msg: '登录成功', status: 1030, data: tsObj});
        } else {
          //密码错误
          res.send({msg: '用户名或者密码不正确', status: 1033});
        }
      } else {
        //用户不存在
        res.send({msg: '用户不存在', status: 1032});
      }
      
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({msg: '登录失败', status: 1031});
    })

  }

  //获取用户信息
  getUserInfo(req, res) {
    console.log('req.userId ==> ', req.userId);
    api.findData({
      modelName: 'User',
      condition: {
        userId: req.userId
      }
    }).then(result => {

      let url = config.serverOptions.host;
      if (config.serverOptions.port) {
        url += `:${config.serverOptions.port}`
      }

      url += config.serverOptions.baseUrl

      res.send({msg: '查询用户信息成功', status: 1040, data: {
        result,
        url
      }})
    }).catch(err => {
      res.send({msg: '查询用户信息失败', status: 1041});
    })
  }

  //获取商品类型
  getTypeData(req, res) {
    api.findData({
      modelName: 'Type'
    }).then(result => {
      res.send({msg: '查询类型成功', status: 1050, result});
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({msg: '查询类型失败', status: 1051});
    })
  }

  //发布商品
  postProduct(req, res) {

    //先上传图片
    let promise = [
      utils.uploadImg(req.body.img, req.body.imgType),
      utils.uploadImg(req.body.detailImg, req.body.detailImgType)
    ];

    //等待所有图片都上传完成后，再将商品数据写入mysql数据库
    Promise.all(promise).then(result => {

      //商品数据
      let productData = Object.assign(req.body);
      productData.img = result[0];
      productData.detailImg = result[1];

      //商品类型id
      let typeId = productData.type;

      //删除商品类型,图片类型
      delete productData.type;
      delete productData.imgType;
      delete productData.detailImgType;

      //生成商品id
      productData.pid = 'pid' + new Date().getTime();

      // console.log('productData ==> ', productData);

      //启动事务处理
      api.transaction(t => {

        //t: 事务处理对象

        return Promise.all([
          //01-将商品数据写入Product模型
          api.createData('Product', productData, t),

          //02-将商品和用户关系写入UserProduct模型
          api.createData('UserProduct', {
            pid: productData.pid,
            userId: req.userId
          }, t),

          //03-将商品和商品类型关系写入ProductType模型
          api.createData('ProductType', {
            pid: productData.pid,
            typeId
          }, t)

        ])

      }).then(result => {
        res.send({msg: '发布商品成功', status: 1060, result});
      }).catch(err => {
        console.log('err ==> ', err);
        res.send({msg: '发布商品失败', status: 1061});
      })

    }).catch(err => {
      console.log('err ==> ', err);
      res.send({msg: '发布商品失败', status: 1061});
    })

  }

  //根据条件搜索商品
  search(req, res) {
    // console.log('req.query ==> ', req.query);
    
    //SQL预处理，防止SQL注入
    let sql = "SELECT `p`.`pid`, `p`.`name`, `p`.`price`, `p`.`status`, `p`.`img`, `p`.`updated_at`, `pt`.`type_id`, `t`.`title`, `up`.`user_id` FROM `product` AS `p` INNER JOIN `product_type` AS `pt` ON `p`.`pid` = `pt`.`pid` INNER JOIN `type` AS `t` ON `pt`.`type_id` = `t`.`type_id` INNER JOIN `user_product` AS `up` ON `up`.`pid` = `p`.`pid` AND `up`.`user_id` = :userId";

    /*
      AND `p`.`name` LIKE '%鱼%'
      AND `pt`.`type_id` = 'shuichan'
      AND `p`.`status` = '上架'
      AND `p`.`updated_at` >= '2020-12-22 00:00:00' AND `p`.`updated_at` <= '2020-12-22 23:59:59'
    */

    //条件
    let params = {
      userId: req.userId,
      offset: Number(req.query.offset),
      count: Number(req.query.count)
    };

    //判断是否根据名称搜索
    if (req.query.name) {
      sql += " AND `p`.`name` LIKE '%" + req.query.name + "%'";
    }

    //判断是否根据类型搜索
    if (req.query.type_id) {
      params.type_id = req.query.type_id;

      sql += " AND `pt`.`type_id` = :type_id";
    }

    //判断是否根据状态搜索
    if (req.query.status) {
      params.status = req.query.status;
      sql += " AND `p`.`status` = :status";
    }

    //是否根据日期搜索
    if (req.query.updated_at) {
      params.start = `${req.query.updated_at} 00:00:00`;
      params.end = `${req.query.updated_at} 23:59:59`;
      sql += " AND `p`.`updated_at` >= :start AND `p`.`updated_at` <= :end"
    }

    //排序并且分页
    sql += ' ORDER BY `p`.`updated_at` LIMIT :offset, :count';

    api.query(sql, params).then(result => {
      // console.log('result ==> ', result);
      res.send({msg: '查询商品成功', status: 1070, result});
    }).catch(err => {
      res.send({msg: '查询商品失败', status: 1071});
    })

  }

  //根据条件查询商品总数目
  count(req, res) {
    //SQL预处理，防止SQL注入
    let sql = "SELECT COUNT(`p`.`pid`) AS `count` FROM `product` AS `p` INNER JOIN `product_type` AS `pt` ON `p`.`pid` = `pt`.`pid` INNER JOIN `type` AS `t` ON `pt`.`type_id` = `t`.`type_id` INNER JOIN `user_product` AS `up` ON `up`.`pid` = `p`.`pid` AND `up`.`user_id` = :userId";

    /*
      AND `p`.`name` LIKE '%鱼%'
      AND `pt`.`type_id` = 'shuichan'
      AND `p`.`status` = '上架'
      AND `p`.`updated_at` >= '2020-12-22 00:00:00' AND `p`.`updated_at` <= '2020-12-22 23:59:59'
    */

    //条件
    let params = {
      userId: req.userId
    };

    //判断是否根据名称搜索
    if (req.query.name) {
      sql += " AND `p`.`name` LIKE '%" + req.query.name + "%'";
    }

    //判断是否根据类型搜索
    if (req.query.type_id) {
      params.type_id = req.query.type_id;

      sql += " AND `pt`.`type_id` = :type_id";
    }

    //判断是否根据状态搜索
    if (req.query.status) {
      params.status = req.query.status;
      sql += " AND `p`.`status` = :status";
    }

    //是否根据日期搜索
    if (req.query.updated_at) {
      params.start = `${req.query.updated_at} 00:00:00`;
      params.end = `${req.query.updated_at} 23:59:59`;
      sql += " AND `p`.`updated_at` >= :start AND `p`.`updated_at` <= :end"
    }

    api.query(sql, params).then(result => {
      // console.log('result ==> ', result);
      res.send({msg: '查询商品数目成功', status: 1080, result});
    }).catch(err => {
      res.send({msg: '查询商品数目失败', status: 1081});
    })
  }

}

//导出实例
module.exports = new RoutesController();
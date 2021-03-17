//======================
//收集所有模型
//======================

//导入User模型
let User = require(__basename + '/db/model/user.js');

//导入Code模型
let Code = require(__basename + '/db/model/code.js');

//导入Type模型
let Type = require(__basename + '/db/model/type.js');

//导入Product模型
let Product = require(__basename + '/db/model/product.js');

//导入UserProduct模型
let UserProduct = require(__basename + '/db/model/user_product.js');

//导入ProductType模型
let ProductType = require(__basename + '/db/model/product_type.js');

//导出所有模型
module.exports = {
  User,
  Code,
  Type,
  Product,
  UserProduct,
  ProductType
}
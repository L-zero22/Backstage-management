//======================
//模型：Type模型, type表
//======================

//导入type.js初始化商品类型数据
let typeData = require(__basename + '/db/data/type.js');

let {DataTypes, Model} = require('sequelize');

class Type extends Model {}

//定义模型结构, 数据表结构
Type.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    comment: '表id'
  },

  typeId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    //默认值
    defaultValue: '',
    comment: '商品类型id'
  },

  title: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '',
    comment: '商品类型'
  }
  
}, {

  //指定连接实例，这样才知道在指定数据库创建type表
  sequelize,

  //模型名称, 当没有指定表名时，sequelize推断名称为模型名称的复数 ==> types作为表名
  modelName: 'type',

  //不推断，直接使用模型作为表名 ==> type作为表名
  freezeTableName: true,

  //指定表名
  tableName: 'type'
})

//同步数据库表
//force: true ==> 删除原有type表，新建type表
//force: false ==> 如果type存在，则不创建，反之，不创建type表
Type.sync({force: false})
// .then(result => {

//   typeData.map(v => {
//     Type.create(v);
//   })

// }).catch(err => {
//   console.log('初始化商品类型出错');
// })

module.exports = Type;

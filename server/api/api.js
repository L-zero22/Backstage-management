//======================
//操作mysql数据库的API
//======================

const { QueryTypes } = require('sequelize');

class API {

  //创建数据
  createData(modelName, o, t) {
    //modelName: 模型名称, string
    //o: 创建的数据, object
    //t: 事务处理对象

    //返回promise
    
    return t ? model[modelName].create(o, {transaction: t}) : model[modelName].create(o);
  }

  //删除

  //更新

  //查询
  findData(o) {
    //o.modelName: 模型名称, string 
    //o.condition: 查询条件, object
    //o.attributes: 查询字段, array ==> ['a', 'b'] 或者 具有别名 ['a', ['b', 'b别名']]
    return model[o.modelName].findAll({
      where: o.condition,
      attributes: o.attributes
    })
  }

  //事务处理
  transaction(fn) {
    return sequelize.transaction(fn);
  }

  //原始查询
  query(sql, replacements) {
    //sql: SQL语句, string
    //replacements: 替换SQL语句的内容, object
    return sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT
    })
  }

}

module.exports = new API();
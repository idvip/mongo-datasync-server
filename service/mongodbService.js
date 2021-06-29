let config = require('../common/config.js');
var MongoClient = require('mongodb').MongoClient;
var mongo = config.mongo;
var url = (mongo.username && mongo.password) ? `mongodb://${mongo.username}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.database}${mongo.option}` :
    `mongodb://${mongo.host}:${mongo.port}/${mongo.database}${mongo.option}`;
console.log(url);
var db = null;

async function initConn() {
    try {
        let conn = await MongoClient.connect(url);
        console.log('数据库连接成功');
        db = conn.db();
    } catch (err) {
        console.error(err);
    }
}

initConn();

module.exports = {
    count: function (collection, condition) {
        return db.collection(collection).find(condition).count();
    }
}

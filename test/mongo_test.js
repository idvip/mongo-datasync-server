let config = require('../common/config.js');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var Binary = require('mongodb').Binary;
async function main(){
    try {
        let conn = await MongoClient.connect(url);
        console.log('数据库连接成功');
        let rs = await conn.db('runoob').collection('site').find({}).toArray();
        console.log(rs);

         // let rs1 = await conn.db('runoob').collection('site').insertOne({name:'ccc',time:new Date()});
        // console.log(rs1);D
        // let rs2 =await conn.db('runoob').collection('test').insertOne({aa:{$date:'2021-06-24T06:44:17.448Z'}});
        // console.log(rs2);
    }
    catch (err){
        console.error(err);
    }
}
main();

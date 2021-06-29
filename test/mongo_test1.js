let config = require('../common/config.js');
var MongoClient = require('mongodb').MongoClient;
var shell = require('../common/shellHelper.js');
var mongo = config.mongo;
var url = `mongodb://${mongo.username}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.database}${mongo.option}`;
// var url = `mongodb://root:123XiaoYa@172.0.102.215:27017/?replicaSet=apprs`;
console.log(url);

async function main() {
    try {
        let conn = await MongoClient.connect(url);
        console.log('数据库连接成功');
        let rs = await conn.db().collection('client').find({}).count();
        console.log(rs);

        //导出
        let tmpFields = {};
        let query = JSON.stringify({stored:{$gt:new Date('2021-06-16 06:41:32.033Z'),$lte:new Date()}},function (key,value){
            //时间字段转换为mongo时间类型（这个方法里的value是已经toString过的值）
            let dateFields=['$gt','$lte'];
            if(key && dateFields.indexOf(key)>-1){
                // return JSON.stringify({$date:value});
                return {$date:value};
                // let tmpKey = `#C#${key}#C#`;
                // tmpFields[tmpKey] =`new Date("${value}")`;
                // return tmpKey;
            }
            return  value;
        });
        // for(let p in tmpFields){
        //     query = query.replace(`"${p}"`,tmpFields[p]);
        // }
        let args = [
            '-h', mongo.host,
            '--port', mongo.port,
            '-u', mongo.username,
            '-p', mongo.password,
            '-d', mongo.database,
            '-c', 'statements',
            '-o', 'a.json',
            '-q',query
        ];
        await shell.run('mongoexport', args)
    } catch (err) {
        console.error(err);
    }
}

main();

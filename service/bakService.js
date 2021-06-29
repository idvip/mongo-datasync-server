var config = require('../common/config.js');
var tmpConfigService = require('../service/tmpConfigService.js');
var db = require('../service/mongodbService.js');
var fs = require('fs');
var compressing = require('compressing');
var uuid = require('uuid');
var shell = require('../common/shellHelper.js');
var mongo = config.mongo;
var tmpPath = config.path + "/tmp";

//查询数据量（是否有可传输的数据），返回 [{name,count,type}]
async function findDataCountByConfig(startTime, endTime) {
    let all = config.tables.map(a => {
        let cond = {};
        cond[a.timeField] = {$lte: endTime};
        if (startTime)
            cond[a.timeField]['$gt'] = startTime;
        return db.count(a.name, cond);
    });
    let list = await Promise.all(all);
    list = list.map((a, i) => {
        return {name: config.tables[i].name, count: a, type: config.tables[i].type}
    });
    return list.filter(a => a.count > 0);
}

//处理临时文件夹
function handlerTmp() {
    runHandlerTmp().then(function (rs) {
        console.log(rs);
    }).catch(function (er) {
        console.error(er);
    });
}

//开始处理临时文件夹
async function runHandlerTmp() {
    let tmpConfig = tmpConfigService.getConfig();
    if (!tmpConfig) return "无可处理的请求";
    //开始处理
    if (tmpConfig.state === 'running') {
        return runExport(tmpConfig);
    } else if (tmpConfig.state === 'package') {
        return runPackage(tmpConfig);
    } else return "无未处理请求";

}

//处理导出
async function runExport(tmpConfig) {
    let cond = {stored: {$lte: new Date(tmpConfig.endTime)}};
    if (tmpConfig.startTime) cond.stored['$gt'] = new Date(tmpConfig.startTime);
    let query = JSON.stringify(cond, function (key, value) {
        //时间字段转换为mongo时间类型（这个方法里的value是已经toString过的值）
        let dateFields = ['$gt', '$lte'];
        if (key && dateFields.indexOf(key) > -1) {
            return {$date: value};
        }
        return value;
    });
    for (let i = 0, ci; ci = tmpConfig.data[i]; i++) {
        console.log('正在导出：', ci.table, '，数量', ci.count);
        let args = [
            '-h', mongo.host,
            '--port', mongo.port,
            '-d', mongo.database,
            '-c', ci.table,
            '-o', tmpPath + "/data/" + ci.files[0],
            '-q', query
        ];
        if (mongo.username) {
            args.push('-u')
            args.push(mongo.username)
        }
        if (mongo.password) {
            args.push('-p')
            args.push(mongo.password)
        }
        await shell.run('mongoexport', args)
    }
    //更改状态
    console.log('导出处理完成');
    tmpConfig.state='package';
    tmpConfigService.saveConfig();
    return runPackage(tmpConfig);
}

//处理打包（并更新状态）
async function runPackage(tmpConfig){
    await compressing.zip.compressDir(tmpPath, config.path+"/"+tmpConfig.uuid+".zip");
    //更改状态
    console.log("打包完成");
    tmpConfig.state='done';
    tmpConfigService.saveConfig();
    return "处理成功。"+tmpConfig.uuid
}

//系统启动时处理未完成的请求
handlerTmp();
module.exports = {
    //[请求导出]
    submit: async function (startTime, endTime) {
        if (!endTime) return {code: 103, message: 'endTime不能为空'};
        if (fs.existsSync(tmpPath))
            return {code: 102, message: '存在未完成的数据传输'};
        //查询数据量（是否有可传输的数据）
        let dataCountList = await findDataCountByConfig(startTime, endTime);
        if (dataCountList.length < 1) {
            return {code: 101, message: '当前时间段无数据可传输'};
        }
        let uid = uuid.v4().replace(/-/g, '');
        //创建临时文件夹（tmp和tmp/data）
        await fs.mkdirSync(tmpPath + "/data", {recursive: true});
        //生成配置文件
        let tmpConfig = tmpConfigService.genDefault(uid, startTime, endTime);
        tmpConfig.data = dataCountList.map(a => {
            return {
                table: a.name,
                count: a.count,
                type: a.type || 1,
                files: [
                    `${a.name}.json`
                ]
            }
        });
        tmpConfigService.saveConfig(tmpConfig);
        //异步处理
        handlerTmp();
        return {code: 0, uuid: uid, message: '成功提交，正在处理……'};
    },
    //[检查是否可下载]
    check: function (uuid) {
        let tmpConfig = tmpConfigService.getConfig();
        if (!tmpConfig || tmpConfig.uuid !== uuid) {
            return {code: 103, message: '不存在的UUID或已处理完毕'}
        }
        if (tmpConfig.state !== 'done') {
            return {code: 0, message: '正在处理……'}
        }
        return {code: 0, path: "/"+uuid+".zip", message: '处理完毕'}
    },
    //[清除数据]
    clean: function (uuid) {
        let tmpConfig = tmpConfigService.getConfig();
        if (!tmpConfig || tmpConfig.uuid !== uuid) {
            return {code: 103, message: '不存在的UUID或已处理完毕'}
        }
        if (tmpConfig.state !== 'done') {
            return {code:104,message:'当前状态不可清除'}
        }
        //文件夹更名
        fs.renameSync(tmpPath,config.path+"/"+tmpConfig.uuid);
        tmpConfigService.remove();
        return {code: 0,  message: '清除完毕'}
    },
}

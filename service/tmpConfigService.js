var config = require('../common/config.js');
var fs = require('fs');
let fname = config.path + "/tmp/config.json";
let tmpConfig = null;
//初始化加载配置
var init = function () {
    //判断文件是否存在,不存在则创建
    if (fs.existsSync(fname)) {
        var cj = fs.readFileSync(fname, 'UTF-8');
        if (cj) {
            tmpConfig = JSON.parse(cj);
        }
    }
}
init();
//临时文件夹配置文件管理（不是系统配置）
module.exports = {
    getConfig: function () {
        return tmpConfig;
    },
    saveConfig: function (cfg) {
        tmpConfig = cfg || tmpConfig;
        fs.writeFileSync(fname, JSON.stringify(tmpConfig,null,2));
    },
    remove:function (){
        tmpConfig=null;
    },
    //生成默认的配置文件
    genDefault: function (uuid, startTime, endTime) {
        tmpConfig = {
            version: 1,
            startTime,
            endTime,
            uuid,
            state: 'running',
            data: []
        }
        return tmpConfig;
    }
}

var spawn = require('child_process').spawn;

//子程序注册事件。返回promise，有错误输出时抛异常、子程序退出时返回正确
function reg(proc) {
    return new Promise(function (resolve, reject) {
        let isOver = false;
        // 捕获标准输出并将其打印到控制台
        proc.stdout.on('data', function (data) {
            console.log('[standard output]:\n' + data);
        });

        // 捕获标准错误输出并将其打印到控制台
        proc.stderr.on('data', function (data) {
            console.log('[standard error output]:\n' + data);
            // if (!isOver) {
            //     isOver = true;
            //     reject(new Error(data));
            // }
        });

        // 注册子进程关闭事件
        proc.on('exit', function (code, signal) {
            console.log('[child process eixt ,exit]:' + code);
            if (!isOver) {
                isOver = true;
                resolve(code);
            }
        });
    })
}

module.exports = {
    run: function (cmd, args) {
        console.log(args)
        let p = spawn(cmd, args);
        return reg(p);
    }
}

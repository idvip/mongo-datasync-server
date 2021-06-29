let config = {
    mongo: {
        host: '127.0.0.1',
        port: 27017,
        username: '',
        password: '',
        database: 'db',
        option: ''
    },
    path: process.cwd() + '/public',//数据目录
    tables: [
        {name: 'tables', timeField: 'time'}
    ]
}

if(process.env.NODE_ENV==='prod'){
    config={
    
    }
}

module.exports = config;

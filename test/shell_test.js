let helper = require('../common/shellHelper.js');

async function main() {
    try {
        // let rs = await helper.run('node', ['-v']);
        let rs = await helper.run('mongoexport', ['--version']);
        console.log(rs, 'ccc')
    } catch (err) {
        console.log('cc')
        console.error(err);
    }
}
main();

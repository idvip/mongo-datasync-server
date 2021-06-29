let bakService = require('../service/bakService.js');
module.exports = {
    bakSubmit: async function (req, res, next) {
        try {
            let {startTime, endTime} = req.body;
            startTime = startTime ? new Date(Number(startTime)) : null;
            endTime = endTime ? new Date(Number(endTime)) : null;
            let rs = await bakService.submit(startTime, endTime);
            res.json(rs);
        } catch (err) {
            next(err)
        }
    },
    bakCheck: function (req, res, next) {
        try {
            let uuid = req.body.uuid;
            let rs = bakService.check(uuid);
            res.json(rs);
        } catch (err) {
            next(err)
        }
    }
    ,
    bakClean: function (req, res, next) {
        try {
            let uuid = req.body.uuid;
            let rs = bakService.clean(uuid);
            res.json(rs);
        } catch (err) {
            next(err)
        }
    }
}

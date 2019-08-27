var log4js = require("log4js");

//ALL,TRACE,DEBUG,INFO,WARN,ERROR,FATAL
var dateFileLog = log4js.getLogger('dateFileLog');
var consoleLog = log4js.getLogger('console');

module.exports.configure = function (config) {
    log4js.configure(config);
}

//env==development
//module.exports.logger=consoleLog;

//env==production
module.exports.logger = dateFileLog;

module.exports.use = function (app) {
    if (app.get('env') == 'production') {
        app.use(log4js.connectLogger(dateFileLog, {
            level: 'ALL',
            format: ':method :url :status :content-length - :response-time ms HTTP/:http-version - ":referrer" -> :remote-addr'
        }));
    } else {
        app.use(log4js.connectLogger(consoleLog, {
            level: 'ALL',
            format: ':method :url :status :content-length - :response-time ms HTTP/:http-version - ":referrer" -> :remote-addr'
        }));
    }
};
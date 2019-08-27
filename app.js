var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

var settings = require('./settings');

var MongoStore = require('connect-mongo')(session);
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || settings.start.port);
app.use(require('express-partials')());
app.set('env', process.env.NODE_ENV || settings.start.env)
app.use(require('serve-favicon')(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

var loginitor = require("./logger");
loginitor.configure(require("./log4js"))
loginitor.use(app);
var logger = loginitor.logger

var sess = settings.GM;
sess.store = new MongoStore(sess)
app.use(session(sess));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(require('csurf')({ cookie: true }));
app.use(function (req, res, next) {
    res.locals.req = req;
    res.locals.session = req.session;
    res.locals.user = req.session.user;
    next();
});


app.use('/', require('./routes/index'));
app.use('/user', require('./routes/users'));
app.use('/gamedata', require('./routes/gamedata'));
app.use('/gamelog', require('./routes/gamelog'));
app.use('/mail',require('./routes/mail'));

// error handlers
if (app.get('env') === 'development') {
    app.use(errorHandler());
}

if (app.get('env') == 'production') {
    // error handler
    app.use(function (err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN') return next(err);
        // handle CSRF token errors here
        res.status(403)
        res.send('form tampered with')
    })
    app.use(errorHandler());
}
//change bin/www start app
// module.exports = app;

initDBConfig();

if (app.get('env') == 'production' && settings.start.https) {
    var https = require('https');
    var fs = require("fs");
    var options = {
        key: fs.readFileSync('./cert/key.pem'),
        cert: fs.readFileSync('./cert/cert.pem')
    };
    https.createServer(options, app).listen(app.get('port'), settings.start.ip, function () {
        console.log('booting in %s mode', app.get('env'));
        console.log('server listening on https:// ' + settings.start.ip + ":" + app.get('port'));
    });
}
else {
    var http = require('http');
    http.createServer(app).listen(app.get('port'), settings.start.ip, function () {
        console.log('booting in %s mode', app.get('env'));
        console.log('server listening on http://' + settings.start.ip + ":" + app.get('port'));
    });

    // app.listen(app.get('port'),settings.start.ip,  function() {
    //     console.log('booting in %s mode', app.get('env'));
    //     console.log('server listening on '+settings.start.ip+":" + app.get('port'));
    // });
}

//初始化数据库相关信息
function initDBConfig() {
    var User = require('./modules/user.js');
    User.initUser();
}
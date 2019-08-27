var express = require('express');
var crypto = require('crypto');
var User = require('../modules/user.js');
var gamedata_link_urls = require('../game-menu').gamedata_link_urls;
var gamelog_link_urls = require('../game-menu').gamelog_link_urls;

var router = express.Router();

router.route('/reg')
    .get(function (req, res, next) {
        var user = req.session.user;
        if (user == null || user.admin == false) {
            res.render('message', { title: '请先以管理员身份登录', url: '/user/login', layout: 'layout', nav: 'login' });
            return;
        }
        res.locals.csrf = req.csrfToken();
        res.render('reg', { title: '管理员配置', layout: 'layout', nav: 'reg' });
    })
    .post(function (req, res, next) {
        var user = req.session.user;
        if (user == null || user.admin == false) {
            res.render('message', { title: '请先以管理员身份登录', url: '/user/login', layout: 'layout', nav: 'login' });
            return;
        }
        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var username = req.body.username;

        var gamelog_itm = [];
        if (Array.isArray(req.body.gamelog_itm)) {
            gamelog_itm = req.body.gamelog_itm
        } else if ('string' == typeof req.body.gamelog_itm) {
            gamelog_itm.push(req.body.gamelog_itm);
        }
        var gamedata_itm = [];
        if (Array.isArray(req.body.gamedata_itm)) {
            gamedata_itm = req.body.gamedata_itm
        } else if ('string' == typeof req.body.gamedata_itm) {
            gamedata_itm.push(req.body.gamedata_itm);
        }
        var newUser = new User({
            name: username,
            password: password,
            admin: false,
            gamedata_itm: gamedata_itm,
            gamelog_itm: gamelog_itm,
            creator: user.name
        });
        User.get(username, function (err, user) {
            if (user && user.admin) {
                return res.render('message', { title: '无法修改超级管理员信息', url: '/user/reg', layout: 'layout', nav: 'reg' });
            }
            if (user) {
                User.update(newUser.name, newUser, function (err) {
                    if (err) {
                        return res.render('message', { title: '系统错误，注册失败', url: '/user/reg', layout: 'layout', nav: 'reg' });
                    }
                    res.render('message', { title: '修改管理员信息成功', url: '/user/reg', layout: 'layout', nav: 'reg' });
                });
            } else {
                newUser.save(function (err) {
                    if (err) {
                        return res.render('message', { title: '系统错误，注册失败', url: '/user/reg', layout: 'layout', nav: 'reg' });
                    }
                    res.render('message', { title: '注册管理员信息成功', url: '/user/reg', layout: 'layout', nav: 'reg' });
                });
            }
        });
    })

//login
router.route('/login')
    .get(function (req, res, next) {
        res.locals.csrf = req.csrfToken();
        res.render('login', { title: '登陆', layout: 'layout', nav: 'login' });
    })
    .post(function (req, res, next) {
        if (!checkerrortimes(req, res)) {
            res.render('message', { title: '三个分钟以内只能输入三次错误用户名或者密码,请稍后再试', url: '/user/login', layout: 'layout', nav: 'login' });
            return;
        }
        User.get(req.body.username, function (err, user) {
            if (err) {
                res.render('message', { title: '登陆失败,系统错误,请联系网管', url: '/', layout: 'layout', nav: 'login' });
                return;
            }
            var cookies = {};
            req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
                var parts = cookie.split('=');
                cookies[parts[0].trim()] = (parts[1] || '').trim();
            });

            res.setHeader("Set-Cookie", ["lastusername=" + cookies['username'] + ""]);
            res.setHeader("Set-Cookie", ["username=" + req.body.username + ""]);

            if (!user) {
                //req.flash('error', '用戶不存在');
                loginerror(req, res);
                return;
            }
            //生成口令的散列值
            var md5 = crypto.createHash('md5');
            var password = md5.update(req.body.password).digest('base64');
            if (user.password != password) {
                //req.flash('error', '用戶口令錯誤');
                loginerror(req, res);
                return;
            }
            req.session.user = user;
            updateUrls(req);
            //req.flash('success', '登入成功');
            res.setHeader("Set-Cookie", ["lastlogin=" + new Date().getTime() + "", "logintimes=0"]);
            res.render('message', { title: '登陆成功', url: '/', layout: 'layout', nav: 'login' });
        });
    })

router.get('/logout', function (req, res, next) {
    req.session.user = null;
    req.session.gamelog_link_urls = [];
    req.session.gamedata_link_urls = [];
    res.render('message', { title: '退出成功', url: '/', layout: 'layout', nav: 'logout' });
})



var _LOGINTIMES_ = 3;//固定时间内只能登录3次
var _LOGINTIMESPAN_ = 180000;//固定多长时间：毫秒

//更新权限缓存
var updateUrls = function (req) {
    var user = req.session.user;
    var admin = user.admin;
    //游戏数据操作权限
    var data_urls = [];
    var gamedatakey = user.gamedata_itm;
    for (var i in gamedata_link_urls) {
        if (!admin) {
            var tg = gamedata_link_urls[i].tg;
            for (var k in gamedatakey) {
                if (gamedatakey[k] == tg) {
                    data_urls.push(gamedata_link_urls[i])
                    break;
                }
            }
        } else {
            data_urls.push(gamedata_link_urls[i])
        }
    }
    req.session.gamedata_link_urls = data_urls;

    //游戏日志操作权限添加
    var log_urls = [];
    var gamelogkey = user.gamelog_itm;
    for (var i in gamelog_link_urls) {
        if (!admin) {
            var tg = gamelog_link_urls[i].tg;
            for (var k in gamelogkey) {
                if (gamelogkey[k] == tg) {
                    log_urls.push(gamelog_link_urls[i])
                    break;
                }
            }
        } else {
            log_urls.push(gamelog_link_urls[i])
        }
    }
    req.session.gamelog_link_urls = log_urls;
}


var checkerrortimes = function (req, res) {
    var cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
    //登录次数增加
    var logintimes = 0;
    if (cookies['logintimes'] && (parseInt(cookies['logintimes'])) > 0) {
        logintimes = parseInt(cookies['logintimes']);
    }
    var timestamp = new Date().getTime();
    var lastlogin = 0;
    //时间超过一小时
    if (cookies['lastlogin']) {
        lastlogin = parseInt(cookies['lastlogin']);
        lastlogin = timestamp - lastlogin;
    }
    if (lastlogin < _LOGINTIMESPAN_ && logintimes > _LOGINTIMES_) {
        return false;
    } else {
        return true;
    }
}

var loginerror = function (req, res) {
    var cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
    //登录次数增加
    var logintimes = 1;
    if (cookies['logintimes'] && (parseInt(cookies['logintimes'])) > 0) {
        logintimes = parseInt(cookies['logintimes']) + 1;
    } else {
        logintimes = 1;
    }
    var timestamp = new Date().getTime();
    //时间超过一小时
    if (cookies['lastlogin']) {
        var lastlogin = parseInt(cookies['lastlogin']);
        lastlogin = timestamp - lastlogin;
        if (lastlogin > _LOGINTIMESPAN_) {
            logintimes = 1;
        }
    }
    //设置cookie
    res.setHeader("Set-Cookie", ["lastlogin=" + timestamp + "", "logintimes=" + logintimes + ""]);
    res.render('message', { title: '用户名或者密码错误', url: '/user/login', layout: 'layout', nav: 'login' });
}

module.exports = router;
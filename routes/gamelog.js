var express = require('express');
var agent = require('./dbagent');
var router = express.Router();

router.get('/', function (req, res, next) {
  var user = req.session.user;
  if (user == null) {
    res.render('message', { title: '请先登录', url: '/user/login', layout: 'layout', nav: 'login' });
  } else {
    res.render('ifreme', { title: '运维统计', layout: 'layout', nav: 'gamelog', navc: '', item: '', result: '' });
  }
})

router.get('/item/:tg', function (req, res, next) {
  var user = req.session.user;
  if (user == null) {
    res.render('message', { title: '请先登录', url: '/user/login', layout: 'layout', nav: 'login' });
  } else {
    var tg = req.params.tg;
    var link_url = null;
    var link_urls = req.session.gamelog_link_urls;
    for (var i in link_urls) {
      if (link_urls[i].tg == tg) {
        link_url = link_urls[i];
        break;
      }
    }

    if (link_url == null) {
      res.render('message', { title: '权限不足', url: '/gamelog', layout: 'layout', nav: 'gamelog' });
    } else {
      res.locals.csrf = req.csrfToken();
      res.render('ifreme', { title: '查询请求', layout: 'layout', nav: 'gamelog', navc: tg, item: 'gamelog-menu-item/' + tg, url: link_url.uri + '/' + tg, ctx: link_url.ctx, result: '' });
    }
  }
})

router.post('/result/:tg', function (req, res, next) {
  var user = req.session.user;
  if (user == null) {
    res.render('message', { title: '请先登录', url: '/user/login', layout: 'layout', nav: 'login' });
  } else {
    var tg = req.params.tg;
    var link_urls = req.session.gamelog_link_urls;
    var link_url = null;
    for (var i in link_urls) {
      if (link_urls[i].tg == tg) {
        link_url = link_urls[i]
        break;
      }
    }
    if (link_url == null) {
      res.render('message', { title: '权限不足', url: '/gamelog', layout: 'layout', nav: 'gamelog' });
    } else if (link_url.proxy_path == undefined || link_url.proxy_path == null || link_url.proxy_path == '') {
      res.render('message', { title: '该功能尚未实现', url: link_url.url + '/' + tg, layout: 'layout', nav: 'gamelog' });
    } else {
      agent.proxy(req,res, link_url.proxy_path, function (data) {
        res.render('ifreme', { data: data, title: '查询结果', layout: 'layout', nav: 'gamelog', navc: tg, result: 'gamelog-menu-item/' + link_url.result, item: '' });
      });
    }
  }
})

module.exports = router;
var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../settings').GAME;
var nodemailer = require('nodemailer');

router.get('/', function (req, res, next) {
	var id = parseInt(req.query['id']); //玩家id 账号id
	var udid = req.query['udid']; //玩家udid 机器码
	var dburl = dbcfg.accounturl;
	mongoClient.connect(dburl, function(err,db){ //连接数据库
		db.collection('accounts', {strict:true}, function(err,coll){ //accounts表
			var queryMap = {"id":id,'udid':udid};
			var resultMap = {'password':1,'account':1,'account_type':1,'id':1,_id:0};
			coll.find(queryMap,resultMap)
			.toArray(function(err, results){
				//开启谷歌邮件服务
				/*
				var transporter = nodemailer.createTransport({
					service: 'Gmail',
					secureConnection :true, //SSL
					port: 465, //port
					auth: {
						user: 'jc13547829667@gmail.com',
						pass: 'you can try it , hahah'
					}
				});
				*/
				//开启QQ邮件服务,需要获取授权码
				var transporter = nodemailer.createTransport({
					service:'QQ',
					auth: {
						user: '1015650506@qq.com', //发件者邮箱账号
						pass: 'you can try it, hahah' //发件者邮箱密码
					}
				});
				//编辑邮件内容,准备发送
				function ssl(){
					if(results.length > 0 && parseInt(results[0].account_type) == 1){ //查询结果不为空,并且账号处于绑定状态
						var mailOptions = {
						from: '1015650506@qq.com ', // sender address
						to: '1015650506@qq.com', // list of receivers
						subject: '找回密码', // Subject line
						text: 'Hello world ?', // plaintext body
						html: '您的密码为:' + results[0].password// html body
					};
					}else{
						var mailOptions = {
						from: '1015650506@qq.com ', // sender address
						to: '1015650506@qq.com', // list of receivers
						subject: '找回密码', // Subject line
						text: 'Hello world ?', // plaintext body
						html: '账号未绑定'// html body
					};
					}
					return mailOptions;
				}
				//发送邮件
				transporter.sendMail(ssl(), function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});
			})
		})
	})
	res.render('mail', { title: '邮件', layout: 'layout', nav: 'mail' });
});

module.exports = router;
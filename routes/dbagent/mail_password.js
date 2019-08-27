var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var nodemailer = require('nodemailer');

//根据id和机器码查询玩家密码
//只有绑定账号才能修改密码
module.exports.regist = function (dbproxy_register) {
	function mail_password(req, res, callback) {
		var id = Number(req.body['id']);
		var udid = req.body['udid'];
		var dburl = dbcfg.accounturl;
		var update = 1;
		mongoClient.connect(dburl, function (err, db) {
			db.collection('accounts', { strict: true }, function (err, coll) {
				if (err == null) {
					var queryMap = { 'id': id,"udid":udid};
					var resultMap = { 'password': 1,"account":1,"account_type":1,"id":1,"register_time":1,_id: 0 };
						coll.find(queryMap, resultMap)
						.toArray(function (err, results) {
							//修改密码,需要判断是否未绑定账号
							/*
							if(results[0].account_type == 1 && update == 1 ){
								coll.update({"id":id},{$set:{"password":"77777"}});
							}
							*/
							
							//发送修改状态
							/*
								if(results[0].password == "77777"){
									console.log("修改成功");
								}
							*/
							/*
								//开启谷歌邮件服务
								var transporter = nodemailer.createTransport({
									service: 'Gmail',
									secureConnection :true, //SSL
									port: 465, //port
									auth: {
										user: 'jc13547829667@gmail.com',
										pass: 'jiangchuan521'
									}
								});
							*/
								//开启QQ邮箱服务 需要获取授权码
								var transporter = nodemailer.createTransport({
									service:'QQ',
									auth: {
										user: '1015650506@qq.com',
										pass: 'you can try， hahah'
									}
								});
								//编辑邮件内容,准备发送
								function ssl(){
									if(results.length > 0 && parseInt(results[0].account_type) == 1){
										var mailOptions = {
										from: '1015650506@qq.com ', // sender address
										to: '1015650506@qq.com', // list of receivers
										subject: '找回密码', // Subject line
										text: 'Hello world ✔', // plaintext body
										html: '您的密码为:' + results[0].password// html body
									};
									}else{
										var mailOptions = {
										from: '1015650506@qq.com ', // sender address
										to: '1015650506@qq.com', // list of receivers
										subject: '找回密码', // Subject line
										text: 'Hello world ✔', // plaintext body
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

							db.close();
							var obj = {
								ret: 0,
								result: results,
								url:req.originalUrl
							};
							res.locals.csrf = req.csrfToken();
							callback(obj);
						});
				} else {
					db.close();
					errorparser(callback, err)
				}
			});
		});
		
	}
	dbproxy_register["mail_password"] = mail_password;
}

function syserror(callback) {
	var obj = { ret: -1, result: '请联系管理员,更新数据库连接配置' };
	callback(obj);
}
function paramerror(callback) {
	var obj = { ret: -1, result: '表单参数错误' };
	callback(obj);
}
function errorparser(callback, err) {
	var obj = { ret: -2, result: err.message };
	callback(obj);
}
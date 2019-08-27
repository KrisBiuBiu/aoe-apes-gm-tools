var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../settings').GAME;

var AgentMethod = {};

module.exports.proxy = function (req, res, proxy_path, callback) {
	var proxyf = AgentMethod[proxy_path]
	if (proxyf) {
		proxyf(req, res, callback);
		
		//将访问日志库的操作存入数据库
		var rctime  = moment.utc().valueOf();
		var created_date  = moment().format('YYYY-MM-DD HH:mm:ss');
		//存入的数据,type为2
		var option = {
			account: req.session.user.name,
			type:"2",
			originalUrl:req.originalUrl,
			method: 'POST',
			body:req.body,
			rctime:rctime,
			created_date:created_date
		};
		//连接数据库 aoegmtool
		mongoClient.connect(dbcfg.aoegmtoolurl, function (err, db) {
			if (err) {
			return callback(err);
			}
			// 讀取 log_history 集合,若无则自动创建
		db.collection('log_history', function (err, collection) {
		if (err) {
			db.close();
			return callback(err);
		}
			// 寫入 log_history 文檔
			collection.insert(option, { safe: true }, function (err, user) {
				db.close();
			});
			});
		});
	} else {
		var obj = { ret: -1, result: '该功能尚未实现' };
		callback(obj);
	}
};

//注册数据库消息代理
var players_power=require('./dbagent/players_power');
players_power.regist(AgentMethod);
var user_register_logs=require('./dbagent/user_register_logs');
user_register_logs.regist(AgentMethod);
var user_gather=require('./dbagent/user_gather');
user_gather.regist(AgentMethod);
var user_login_logs=require('./dbagent/user_login_logs');
user_login_logs.regist(AgentMethod);
var user_retention=require('./dbagent/user_retention');
user_retention.regist(AgentMethod);
var user_retentions=require('./dbagent/user_retentions');
user_retentions.regist(AgentMethod);
var google_pay=require('./dbagent/google_pay');
google_pay.regist(AgentMethod);
var google_pay1=require('./dbagent/google_pay1');
google_pay1.regist(AgentMethod);
var google_pay2=require('./dbagent/google_pay2');
google_pay2.regist(AgentMethod);
var user_information=require('./dbagent/user_information');
user_information.regist(AgentMethod);
var chat_alliance=require('./dbagent/chat_alliance');
chat_alliance.regist(AgentMethod);
var mongolog_alliance=require('./dbagent/mongolog_alliance');
mongolog_alliance.regist(AgentMethod);
var aoegmtool_users=require('./dbagent/aoegmtool_users');
aoegmtool_users.regist(AgentMethod);
var gm_cmd=require('./dbagent/gm_cmd');
gm_cmd.regist(AgentMethod);
var delete_gmuser=require('./dbagent/delete_gmuser');
delete_gmuser.regist(AgentMethod);
var user_behavior=require('./dbagent/user_behavior');
user_behavior.regist(AgentMethod);
var count_behavior=require('./dbagent/count_behavior');
count_behavior.regist(AgentMethod);
var user_device=require('./dbagent/user_device');
user_device.regist(AgentMethod);
var user_all=require('./dbagent/user_all');
user_all.regist(AgentMethod);
var user_allUTC=require('./dbagent/user_allUTC');
user_allUTC.regist(AgentMethod);
var user_allPST=require('./dbagent/user_allPST');
user_allPST.regist(AgentMethod);
var mail_password=require('./dbagent/mail_password');
mail_password.regist(AgentMethod);
var user_str=require('./dbagent/user_str');
user_str.regist(AgentMethod);
var user_rebel=require('./dbagent/user_rebel');
user_rebel.regist(AgentMethod);
var count_rebel=require('./dbagent/count_rebel');
count_rebel.regist(AgentMethod);
var chargeRank=require('./dbagent/chargeRank');
chargeRank.regist(AgentMethod);
var user_shield=require('./dbagent/user_shield');
user_shield.regist(AgentMethod);
var regionall=require('./dbagent/regionall');
regionall.regist(AgentMethod);
var registertoorder=require('./dbagent/registertoorder');
registertoorder.regist(AgentMethod);
var user_equip=require('./dbagent/user_equip');
user_equip.regist(AgentMethod);
var jc=require('./dbagent/jc');
jc.regist(AgentMethod);
var bootfour=require('./dbagent/bootfour');
bootfour.regist(AgentMethod);
var test=require('./dbagent/test');
test.regist(AgentMethod);
var test1=require('./dbagent/test1');
test1.regist(AgentMethod);
var bootversionip=require('./dbagent/bootversionip');
bootversionip.regist(AgentMethod);
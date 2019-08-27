var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家防护盾剩余时间
module.exports.regist = function (dbproxy_register) {
	function user_shield(req, res, callback) {
		var dburl = dbcfg.logurl;
		var userid = parseInt(req.body['userid']);
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		//获取当前时间戳
		var nowtime  = moment.utc().valueOf();
		//计算防护盾剩余时间
		mongoClient.connect(dburl, function (err, db) {
			db.collection("user_shield", { strict: true }, function (err, coll) {
				if(err == null){
				var queryMap = {'user_id':userid };
				var resultMap = {'expire':1,'action':1,'type':1, 'rctime':1,"disappear":1,_id: 0 };
					coll.find(queryMap, resultMap)
					.sort({"rctime":-1}).limit(1)
					.toArray(function (err, results) {
						var continuetime = parseInt(nowtime) - parseInt(results[0]['rctime']);
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						var obj = {
							ret: 0,
							result: results,
							//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
							userid:userid,
							StartTime: req.body['StartTime'],
							EndTime: req.body['EndTime'],
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
	dbproxy_register["user_shield"] = user_shield;
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
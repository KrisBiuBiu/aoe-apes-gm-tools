var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家账号注册列表
module.exports.regist = function (dbproxy_register) {
	function user_register_logs(req, res, callback) {

		var dburl = dbcfg.logurl;
		if (dburl) {
			var region = Number(req.body['region']);
			var serverid = Number(req.body['serverid']);
			var version = req.body['version'];
			var versionlength = version.length;
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			if (!isNaN(region) && !isNaN(serverid) && starttime.isValid() && endtime.isValid() && starttime.valueOf() < endtime.valueOf()) {
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('user_register_logs', { strict: true }, function (err, coll) {
						if (err == null) {
							if(versionlength > 0){
								var queryMap = { 'app_id':version,'rctime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }, "region_id": region, "server_id": serverid};
								var resultMap = {'ip':1,'locale':1,'created_date':1,'open_udid':1,'user_name':1,'user_id':1, _id: 0 };
							}else{
								var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }, "region_id": region, "server_id": serverid};
								var resultMap = {'ip':1,'locale':1,'created_date':1,'open_udid':1,'user_name':1,'user_id':1, _id: 0 };
							}
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										errorparser(callback, err)
									} else {
										var obj = {
											ret: 0,
											result: results,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
											region: region,
											serverid: serverid,
											StartTime: req.body['StartTime'],
											EndTime: req.body['EndTime'],
											url:req.originalUrl
										};
										res.locals.csrf = req.csrfToken();
										callback(obj);
									}
								});
						} else {
							db.close();
							errorparser(callback, err)
						}
					});
				});
			} else {
				paramerror(callback);
			}
		} else {
			syserror(callback);
		}
	}
	dbproxy_register["user_register_logs"] = user_register_logs;
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
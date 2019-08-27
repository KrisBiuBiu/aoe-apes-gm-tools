var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家战力
module.exports.regist = function (dbproxy_register) {
	function players_power(req, res, callback) {

		var serverid = req.body['serverid'];
		var dburl = dbcfg.gameurl['gs_' + serverid];
		if (dburl) {
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var power = Number(req.body['power']);
			if (!isNaN(power) && starttime.isValid() && endtime.isValid() && starttime.valueOf() < endtime.valueOf()) {
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('users', { strict: true }, function (err, coll) {
						if (err == null) {
							var queryMap = { 'RegisterTime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }, 'Power': { '$gte': power } };
							var resultMap = { 'username': 1, 'Power': 1, "Building.BMap": 1, 'RegisterTime':1,"Diamond":1, Items: 1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										return errorparser(callback, err)
									}
										var obj = {
											ret: 0,
											result: results,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
											serverid: serverid,
											StartTime: req.body['StartTime'],
											EndTime: req.body['EndTime'],
											power: power,
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
			} else {
				paramerror(callback);
			}
		} else {
			syserror(callback);
		}
	}
	dbproxy_register["players_power"] = players_power;
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
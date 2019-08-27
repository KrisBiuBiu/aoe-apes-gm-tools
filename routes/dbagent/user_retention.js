var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家单日留存率
module.exports.regist = function (dbproxy_register) {
	function user_retention(req, res, callback) {

		var serverid = req.body['serverid'];
		var dburl = dbcfg.gameurl['gs_' + serverid];
		if (dburl) {
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = Number(starttime + 86400000);
			var page_id = Number(req.body['page_id']);
			var pageNum = Number(req.body['pageNum']);
			if (!isNaN(pageNum) && !isNaN(page_id) && starttime.isValid()&& starttime.valueOf() < endtime) {
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('users', { strict: true }, function (err, coll) {
						if (err == null) {
							if (page_id < 1) {
								page_id = 1
							}
							if (pageNum < 1) {
								pageNum = 10
							} else if (pageNum > 500) {
								pageNum = 10000
							}
							var queryMap = { 'RegisterTime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
							var resultMap = {'id':1,'ConLoginDays': 1,'LoginTime':1,'username':1,'Ip':1, 'RegisterTime': 1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										errorparser(callback, err)
									} else {
										var next_id = page_id + 1;
										if (results.length < pageNum) {
											next_id = 0
										}
										var obj = {
											ret: 0,
											result: results,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
											prev_id: page_id - 1,
											next_id: next_id,
											serverid: serverid,
											StartTime: req.body['StartTime'],
											EndTime: req.body['EndTime'],
											pageNum: pageNum,
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
	dbproxy_register["user_retention"] = user_retention;
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
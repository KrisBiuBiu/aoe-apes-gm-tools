var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var behavior = require('../../public/translate/behaviors');
var behavior1 = require('../../public/translate/behaviors1');

//查询玩家登录信息
module.exports.regist = function (dbproxy_register) {
	function user_behavior(req, res, callback) {
		var behaviors = behavior.Str;
		var behaviors1 = behavior1.Col;
		var dburl = dbcfg.log2url;
		if (dburl) {
			var userid = req.body['userid'];
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var page_id = Number(req.body['page_id']);
			var pageNum = Number(req.body['pageNum']);
			if (!isNaN(pageNum) && !isNaN(page_id) && starttime.isValid() && endtime.isValid() && starttime.valueOf() < endtime.valueOf()) {
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection("users_spec", { strict: true }, function (err, coll) {
						if (err == null) {
							if (page_id < 1) {
								page_id = 1
							}
							if (pageNum < 1) {
								pageNum = 10
							} else if (pageNum > 5000) {
								pageNum = 5000
							}
							var sss = starttime.valueOf();
							var queryMap = { 'server_stamp': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf()},'userid':userid };
							var resultMap = {'str':1,'client_stamp':1,'col':1,_id: 0 };
							coll.find(queryMap, resultMap)
								.sort([['server_stamp', 1]]).skip((page_id - 1) * pageNum).limit(pageNum)
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
											behaviors:behaviors,
											behaviors1:behaviors1,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
											prev_id: page_id - 1,
											page_id:page_id,
											next_id: next_id,
											userid:userid,
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
	dbproxy_register["user_behavior"] = user_behavior;
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
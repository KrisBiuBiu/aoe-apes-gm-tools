var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询推送操作详情
module.exports.regist = function (dbproxy_register) {
	function test1(req, res, callback) {
		var dburl = dbcfg.aoegmtoolurl;
		if (dburl) {
			var timeid = req.body['time'];
				if(timeid == "UTC"){
					var starttime = moment.parseZone(req.body['StartTime']);
					var endtime = moment.parseZone(req.body['EndTime']);
				}else if(timeid == "BJ"){
					var starttime = moment.parseZone(req.body['StartTime'])-28800000;
					var endtime = moment.parseZone(req.body['EndTime'])-28800000;
				}
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('postcount', { strict: true }, function (err, coll) {
						if (err == null) {
							var queryMap = { 'posttime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
							var resultMap = { 'starttime': 1, 'endtime': 1, "posttime": 1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										return errorparser(callback, err)
									}
										var obj = {
											ret: 0,
											result: results,
											timeid:timeid,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
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
		} else {
			syserror(callback);
		}
	}
	dbproxy_register["test1"] = test1;
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
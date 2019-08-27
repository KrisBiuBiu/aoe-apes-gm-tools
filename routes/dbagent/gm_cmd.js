var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//礼包内购查询
module.exports.regist = function (dbproxy_register) {
	function gm_cmd(req, res, callback) {

		var dburl = dbcfg.logurl;
		if (dburl) {
			var transactionId = req.body['transactionId'];
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var page_id = Number(req.body['page_id']);
			var pageNum = Number(req.body['pageNum']);
			if (starttime.isValid() && endtime.isValid() && starttime.valueOf() < endtime.valueOf()) {
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('user_orders', { strict: true }, function (err, coll) {
						if (err == null) {
							if (page_id < 1) {
								page_id = 1
							}
							if (pageNum < 1) {
								pageNum = 10
							} else if (pageNum > 500) {
								pageNum = 500
							}
							var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }, "transactionId": transactionId };
							var resultMap = {'user_id': 1,'produceId':1, 'success': 1,'created_date':1,'price':1,'package_id':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.sort([['rctime', -1]]).skip((page_id - 1) * pageNum).limit(pageNum)
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
	dbproxy_register["gm_cmd"] = gm_cmd;
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
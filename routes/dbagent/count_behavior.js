var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//玩家操作次数统计
module.exports.regist = function (dbproxy_register) {
	function count_behavior(req, res, callback) {
		var dburl = dbcfg.log2url;
		var userid = req.body['userid'];
		var str = req.body['str'];
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		mongoClient.connect(dburl, function (err, db) {
			db.collection("users_spec", { strict: true }, function (err, coll) {
				if(err == null){
				if(userid == ""){
					var queryMap = { 'server_stamp': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf()},'str':str };
					var resultMap = {'str':1,'userid':1,_id: 0 };
				}else{
					var queryMap = { 'server_stamp': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf()},'userid':userid,'str':str };
					var resultMap = {'str':1,'userid':1,_id: 0 };
				}
				coll.find(queryMap, resultMap)
				.toArray(function (err, results) {
					if (err) {
						return errorparser(callback, err)
					}
					db.close();
					var strcount = results.length;
					//对每一组数据进行去重处理
					var h = {};
					var totalHuman = new Array();
					var useridcount;
					for(var i=0; i < results.length ; i++){
						if(!h[results[i].userid]){
							h[results[i].userid] = true;
							totalHuman.push(results[i]);
						}
					}
					useridcount = parseInt(totalHuman.length);
					var obj = {
						ret: 0,
						result: results,
						strcount:strcount,
						useridcount:useridcount,
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
	dbproxy_register["count_behavior"] = count_behavior;
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
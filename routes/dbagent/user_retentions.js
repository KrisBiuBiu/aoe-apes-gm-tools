var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家多日留存率
module.exports.regist = function (dbproxy_register) {
	function user_retentions(req, res, callback) {

		var serverid = req.body['serverid'];
		var dburl = dbcfg.gameurl['gs_' + serverid];
		if (dburl) {
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var page_id = Number(req.body['page_id']);
			var pageNum = Number(req.body['pageNum']);
			if (!isNaN(pageNum) && !isNaN(page_id) && starttime.isValid() && starttime.isValid() && starttime.valueOf() < endtime) {
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
							var resultMap = {'LoginTime':1,'RegisterTime': 1, _id: 0 };
							//coll.ensureIndex('RegisterTime');
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

										var date1=starttime.valueOf();
										var date2=endtime.valueOf();
										var count = parseInt(parseInt(date2)-parseInt(date1))/86400000;
										var resultArray = new Array();
										var ResultFirst = new Array();
										for(var i=0;i < count;i++){
										var playerArray = new Array();
											results.forEach(function(v){
												if(parseInt(v.RegisterTime) > parseInt(date1+86400000*i) && parseInt(v.RegisterTime) < parseInt(date1+86400000*(i+1))){
													playerArray.push(v);
												}
											})
											resultArray[i] = playerArray.length;
											ResultFirst[i] = playerArray;
										}
										
										var result1Array = new Array();
										for(var i=0;i < count;i++){
										var TheSecondDateUsers = 0;
											ResultFirst[i].forEach(function(v){
												if(parseInt(v.LoginTime) > parseInt(date1+86400000*(i+1)) && parseInt(v.LoginTime) < parseInt(date1+86400000*(i+2))){
													TheSecondDateUsers++;
												}
											})
											result1Array[i] = TheSecondDateUsers;
										}

										var result2Array = new Array();
										for(var i=0;i < count;i++){
										var TheSeventhDateUsers = 0;
											ResultFirst[i].forEach(function(v){
												if(parseInt(v.LoginTime) >= parseInt(date1+86400000*(i+7)) && parseInt(v.LoginTime) <= parseInt(date1+86400000*(i+8))){
													TheSeventhDateUsers++;
												}
											})
											result2Array[i] = TheSeventhDateUsers;
										}

										var result3Array = new Array();
										for(var i=0;i < count;i++){
										var TheThirtiethDateUsers = 0;
											ResultFirst[i].forEach(function(v){
												if(parseInt(v.LoginTime) >= parseInt(date1+86400000*(i+30)) && parseInt(v.LoginTime) <= parseInt(date1+86400000*(i+31))){
													TheThirtiethDateUsers++;
												}
											})
											result3Array[i] = TheThirtiethDateUsers;
										}
										var obj = {
											ret: 0,
											result1: result1Array,
											result2: result2Array,
											result3: result3Array,
											result: resultArray,
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
	dbproxy_register["user_retentions"] = user_retentions;
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
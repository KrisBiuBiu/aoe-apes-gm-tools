var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家打怪行为
module.exports.regist = function (dbproxy_register) {
	function user_rebel(req, res, callback) {
		var test;
		if(req.body['test']){
			test = req.body['test'];
		}else{
			test = "no";
		}

		if(test == "yes"){
			var logurl = dbcfg.logurl;
			var serverid = Number(req.body['serverid']);
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var etime = starttime.valueOf()+86400000;

				mongoClient.connect(logurl, function (err, db) {
					db.collection('user_rebel_point', { strict: true }, function (err, coll) {
						if(err == null){
							var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': etime },"action": {"$in":[3,4,6]}};
							var resultMap = {'user_id':1,'created_date': 1,'level':1, 'x': 1,'y':1,'rebel_level':1,'left_hp':1,'left_points':1,'points':1,'hurt':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										return errorparser(callback, err)
									}
									var rebelcount = results.length;
										var obj = {
											ret: 0,
											result: results,
											rebelcount:rebelcount,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
											serverid: serverid,
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
		}else{
			var logurl = dbcfg.logurl;
		var accounturl = dbcfg.accounturl;
			var serverid = Number(req.body['serverid']);
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var etime = starttime.valueOf()+86400000;
			var registerArray = new Array();
			//取出玩家注册数
			mongoClient.connect(accounturl,function(err,db){
			db.collection('accounts', {strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"register_time":{'$gte': starttime.valueOf(), '$lte': etime}};
				var resultMap = {'id':1,_id:0};
				coll.find(queryMap,resultMap)
				.toArray(function(err,results){
					db.close();
					if (err) {
						return errorparser(callback, err)
					}
					//对每一组数据进行去重处理
					var h = {};
					var totalHuman = new Array();
					for(var i=0; i < results.length ; i++){
						if(!h[results[i].id]){
							h[results[i].id] = true;
							totalHuman.push(results[i].id);
						}
					}
					registerArray = totalHuman;//注册玩家userid
				})
				} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})
				//取出所有打怪数据
				var newRebelArray = new Array();
				mongoClient.connect(logurl, function (err, db) {
					db.collection('user_rebel_point', { strict: true }, function (err, coll) {
						if(err == null){
							var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': etime },"action": {"$in":[3,4,6]}};
							var resultMap = {'user_id':1,'created_date': 1,'level':1, 'x': 1,'y':1,'rebel_level':1,'left_hp':1,'left_points':1,'points':1,'hurt':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										return errorparser(callback, err)
									}
									var rebelcount = results.length;
									//对每一组数据进行去重处理
									var h = {};
									var totalHuman = new Array();
									for(var i=0; i < results.length ; i++){
										if(!h[results[i].user_id]){
											h[results[i].user_id] = true;
											totalHuman.push(results[i].user_id);
										}
									}
									useridarray = totalHuman;//打怪玩家userid
									//去掉当日注册玩家
									for (var i = 0; i < registerArray.length; i++) {
										for (var j = 0; j < useridarray.length; j++) {
											if (useridarray[j] == registerArray[i]) {
												useridarray.splice(j,1);
											}
										}
									}
									//把已经去掉注册的数据收集起来
									for(var a=0;a < results.length;a++){
										for(var i=0;i < useridarray.length;i++){
											if(parseInt(results[a].user_id) == parseInt(useridarray[i])){
												newRebelArray.push(results[a]);
											}
										}
									}
										var obj = {
											ret: 0,
											result: newRebelArray,
											useridarray:useridarray,
											registerArray:registerArray,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
											serverid: serverid,
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
			
	}
	dbproxy_register["user_rebel"] = user_rebel;
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
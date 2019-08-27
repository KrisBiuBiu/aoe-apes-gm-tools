var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家打怪行为
module.exports.regist = function (dbproxy_register) {
	function count_rebel(req, res, callback) {
		var test;
		if(req.body['test']){
			test = req.body['test'];
		}else{
			test = "no";
		}

		if(test == "no"){
		var logurl = dbcfg.logurl;
		var accounturl = dbcfg.accounturl;
		var serverid = Number(req.body['serverid']);
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var etime = starttime.valueOf()+86400000;
		var registerArray = new Array();
		var useridarray = new Array();
		var newRegisterArray = new Array();
		//取出玩家当日注册信息
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
		//取出当日打怪的数据
		var rebelarray = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection('user_rebel_point', { strict: true }, function (err, coll) {
				if(err == null){
				var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': etime },"action": {"$in":[3,4,6]}};
				var resultMap = {'user_id':1,'created_date': 1,_id: 0 };
				coll.find(queryMap, resultMap)
				.toArray(function (err, results) {
					db.close();
					if (err) {
						return errorparser(callback, err)
					}
					rebelarray = results;
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
					//计算当日每个玩家的打怪次数
					var everyRebel = new Array();
					var everyRebel1 = new Array();
					for(var i=0;i < useridarray.length;i++){
						var rebelnum = 0;
						rebelarray.forEach(function(v){
							if(parseInt(useridarray[i]) == parseInt(v.user_id)){
								rebelnum++;
							}
						})
						everyRebel[i] = useridarray[i];
						everyRebel1[i] = rebelnum;
					}
					var obj = {
						ret: 0,
						result: results,
						useridarray:useridarray,
						registerArray:registerArray,
						everyRebel:everyRebel,
						everyRebel1:everyRebel1,
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
		var serverid = Number(req.body['serverid']);
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var etime = starttime.valueOf()+86400000;
		var useridarray = new Array();
		//取出当日打怪的数据
		var rebelarray = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection('user_rebel_point', { strict: true }, function (err, coll) {
				if(err == null){
				var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': etime },"action": {"$in":[3,4,6]}};
				var resultMap = {'user_id':1,'created_date': 1,_id: 0 };
				coll.find(queryMap, resultMap)
				.toArray(function (err, results) {
					db.close();
					if (err) {
						return errorparser(callback, err)
					}
					rebelarray = results;
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
					//计算当日每个玩家的打怪次数
					var everyRebel = new Array();
					var everyRebel1 = new Array();
					for(var i=0;i < useridarray.length;i++){
						var rebelnum = 0;
						rebelarray.forEach(function(v){
							if(parseInt(useridarray[i]) == parseInt(v.user_id)){
								rebelnum++;
							}
						})
						everyRebel[i] = useridarray[i];
						everyRebel1[i] = rebelnum;
					}
					var obj = {
						ret: 0,
						result: results,
						useridarray:useridarray,
						everyRebel:everyRebel,
						everyRebel1:everyRebel1,
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
	dbproxy_register["count_rebel"] = count_rebel;
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
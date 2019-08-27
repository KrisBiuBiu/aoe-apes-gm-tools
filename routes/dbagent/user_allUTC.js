var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家多日留存率
module.exports.regist = function (dbproxy_register) {
	function user_allUTC(req, res, callback) {

		var timeid = req.body['time'];
		var serverid = req.body['serverid'];
		var accounturl = dbcfg.accounturl;
		var log2url = dbcfg.log2url;
		var payurl = dbcfg.payurl;
		var gsdburl = dbcfg.gameurl['gs_' + serverid];
		var logurl = dbcfg.logurl;
		var timeid = req.body['time'];
		if(timeid == "UTC"){
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
		}else if(timeid == "PST"){
			var starttime = moment.parseZone(req.body['StartTime'])+28800000;
			var endtime = moment.parseZone(req.body['EndTime'])+28800000;
		}else if(timeid == "BJ"){
			var starttime = moment.parseZone(req.body['StartTime'])-28800000;
			var endtime = moment.parseZone(req.body['EndTime'])-28800000;
		}
		var page_id = Number(req.body['page_id']);
		var pageNum = Number(req.body['pageNum']);
		var date1 = starttime.valueOf();
		var date2 = endtime.valueOf();
		var count = (date2 - date1)/86400000;

		//取出"user_register_logs",注册日志
		var registerresults = new Array();
		var allregisterresults = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection("user_register_logs",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"rctime": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'rctime':1,'user_name':1,'user_id':1, 'open_udid':1,_id: 0 };
				coll.find(queryMap,resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//将注册日志按日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
									resultsArray.push(v);
								}
							})
							registerresults[i] = resultsArray;
							//去重处理
							var h = {};
							var totalHuman = new Array();
							for(var a=0; a < resultsArray.length ; a++){
								if(!h[resultsArray[a].open_udid]){
									h[resultsArray[a].open_udid] = true;
									totalHuman.push(resultsArray[a]);
								}
							}
							allregisterresults[i] = totalHuman;
						}
					})
					} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})

		//取出"device",注册设备数
		var deviceresults = new Array();
		mongoClient.connect(log2url, function (err, db) {
			db.collection("device",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'server_stamp':1,'udid':1, _id: 0 };
				coll.find(queryMap,resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//将注册设备数按日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(parseInt(v.server_stamp) > parseInt(date1+86400000*i) && parseInt(v.server_stamp) < parseInt(date1+86400000*(i+1))){
									resultsArray.push(v);
								}
							})
							deviceresults[i] = resultsArray;
						}
					})
					} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})

		//取出"google_pay",订单
		var orderidresults = new Array();
		var orderskuresults = new Array();
		var alloederresults = new Array();
		mongoClient.connect(payurl, function (err, db) {
			db.collection("google_pay",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"rctime": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'rctime':1,'orderId':1,'sku':1,'user_id':1, _id: 0 };
				coll.find(queryMap,resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//将首次获取的数据去重处理
						var h = {};
							var totalHuman = new Array();
							for(var a=0; a < results.length ; a++){
								if(!h[results[a].user_id]){
									h[results[a].user_id] = true;
									totalHuman.push(results[a]);
								}
							}
							alloederresults = totalHuman;
						//将订单按日期分组,并且去掉无效的测试订单
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(typeof(v.orderId) != "undefined" && parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
									resultsArray.push(v);
								}
							})
							orderskuresults[i] = resultsArray;
							//去重处理
							var h = {};
							var totalHuman = new Array();
							for(var a=0; a < resultsArray.length ; a++){
								if(!h[resultsArray[a].user_id]){
									h[resultsArray[a].user_id] = true;
									totalHuman.push(resultsArray[a]);
								}
							}
							orderidresults[i] = totalHuman;
						}
					})
					} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})

		//取出'user_session',玩家在线详细日志
		var sessionarray = new Array();
		mongoClient.connect(logurl,function(err,db){
			db.collection("user_session",{strict:true},function(err,coll){
				if(err == null){
				var queryMap = {"rctime":{"$gte":starttime.valueOf(),"$lte":endtime.valueOf()}};
				var resultMap = {"rctime":1,"user_id":1,"loginTimeMs":1,"logoutTimeMs":1,_id:0};
				coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//将session按照日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
									resultsArray.push(v);
								}
							})
							sessionarray[i] = resultsArray;
						}
					})
					} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})
		//取出"user_login_logs",登录日志
		var loginresults = new Array();
		var deviceloginresults = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection("user_login_logs",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"rctime": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'rctime':1,'user_name':1,'user_id':1,'open_udid':1,_id: 0 };
				coll.find(queryMap, resultMap)
					.toArray(function (err, results) {
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//将登陆日志按日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
									resultsArray.push(v);
								}
							})
							//账号去重处理
							var h = {};
							var totalHuman = new Array();
							for(var a=0; a < resultsArray.length ; a++){
								if(!h[resultsArray[a].user_id]){
									h[resultsArray[a].user_id] = true;
									totalHuman.push(resultsArray[a]);
								}
							}
							loginresults[i] = totalHuman;

							//设备去重处理
							var hd = {};
							var totalHumand = new Array();
							for(var a=0; a < resultsArray.length ; a++){
								if(!hd[resultsArray[a].open_udid]){
									hd[resultsArray[a].open_udid] = true;
									totalHumand.push(resultsArray[a]);
								}
							}
							deviceloginresults[i] = totalHumand;
						}
						//计算新增注册付费人数
						var neworderidresults = new Array();
						for(var i=0;i < count;i++){
							var neworderArray = new Array();
							orderidresults[i].forEach(function(a){
								registerresults[i].forEach(function(v){
									if(parseInt(a.user_id) == parseInt(v.user_id)){
										neworderArray.push(a);
									}
								})
							})
							neworderidresults[i] = neworderArray
						}
						//计算新增付费用户
						var firstorder = new Array();
						for(var i=0;i < count;i++){
							var firstArray = new Array();
							alloederresults.forEach(function(v){
								if(typeof(v.orderId) != "undefined" && parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
									firstArray.push(v);
								}
							})
							firstorder[i] = firstArray;
						}
						//计算次留设备
						var afterdeviceresults = new Array();
						for(var i=0;i < count;i++){
							var afterArray = new Array();
							var b = parseInt(i+1);
							if(b < count){
							deviceresults[i].forEach(function(v){
								deviceloginresults[b].forEach(function(a){
									if(a.open_udid == v.udid){
										afterArray.push(a);
									}
								})
							})
							afterdeviceresults[i] = afterArray;
							}else{
								afterdeviceresults[i] = new Array();
							}
						}
						//计算次留人数
						var afterresults = new Array();
						for(var i=0;i < count;i++){
							var afterArray = new Array();
							var b = parseInt(i+1);
							if(b < count){
							registerresults[i].forEach(function(v){
								loginresults[b].forEach(function(a){
									if(parseInt(a.user_id) == parseInt(v.user_id)){
										afterArray.push(a);
									}
								})
							})
							afterresults[i] = afterArray;
							}else{
								afterresults[i] = new Array();
							}
						}
						//计算每日的在线人数,时间间隔为一个小时,每天一共48组数据
						var onlinearray = new Array();
						var maxsessions;
						for(var a = 0;a < sessionarray.length;a++){
							var everysessionarray = sessionarray[a];
							var sessioncount = new Array();
							for(var b=0;b < 24;b++){
								var newsession = new Array();
								var newtime = parseInt(date1+86400000*a);
								everysessionarray.forEach(function(v){
									if(parseInt(v.loginTimeMs) <= parseInt(newtime+3600000*b) && parseInt(v.logoutTimeMs) >= parseInt(newtime+3600000*b)){
										newsession.push(v.user_id);
									}
								})
								//对每一组数据进行去重处理
								var h = {};
								var totalHuman = new Array();
								for(var i=0; i < newsession.length ; i++){
									if(!h[newsession[i]]){
										h[newsession[i]] = true;
										totalHuman.push(newsession[i]);
									}
								}
								sessioncount[b] = parseInt(totalHuman.length);
							}
							//将每个时段的在线人数存入数组
							onlinearray[a] = sessioncount;
						}


						//计算每日在线的最大值
						var maxcounts = new Array();
						for(var i=0;i < onlinearray.length;i++){
							var maxcount = Math.max.apply(null,onlinearray[i]);
							var newonlinearray = onlinearray[i].sort();
							maxcounts[i] = maxcount;
						}

						//计算每日在线的平均值
						var avacounts = new Array();
						for(var i=0;i < onlinearray.length;i++){
							var avacount = 0;
							var newonlinearray = onlinearray[i];
							newonlinearray.forEach(function(v){
								avacount += parseInt(v);
							})
							avacounts[i] = parseInt(avacount/24);
						}

						//根据登陆玩家user_id,查询注册时间
						var registerbeforeuser = new Array();
						for(var i=0;i < count;i++){
							var e = parseInt(i-1);
							var beforeusers = new Array();
							loginresults[i].forEach(function(v){
								if(e > -1){
								registerresults[e].forEach(function(a){
									if(parseInt(v.user_id) == parseInt(a.user_id)){
										beforeusers.push(v)
									}
								})
								}
							})
							registerbeforeuser[i] = beforeusers;
						}
						var obj = {
							ret:0,
							loginresult:loginresults,
							registerresult:registerresults,
							allregisterresult:allregisterresults,
							deviceresult:deviceresults,
							orderidresult:orderidresults,
							orderskuresult:orderskuresults,
							neworderresult:neworderidresults,
							firstorder:firstorder,
							afterresult:afterresults,
							sessionarray:sessionarray,
							onlinearray:onlinearray,
							maxcounts:maxcounts,
							avacounts:avacounts,
							timeid:timeid,
							afterdeviceresult:afterdeviceresults,
							registerbeforeuser:registerbeforeuser,
							StartTime: req.body['StartTime'],
							EndTime: req.body['EndTime'],
							url:req.originalUrl
						}
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
dbproxy_register["user_allUTC"] = user_allUTC;
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
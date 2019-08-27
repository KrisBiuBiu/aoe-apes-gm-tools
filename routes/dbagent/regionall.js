var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var ipa = require("../../ipcheck.js");
var countrys = require('../../public/translate/country');

//测试功能
module.exports.regist = function (dbproxy_register) {
	function regionall(req, res, callback) {

		var serverid = req.body['serverid'];
		var country = req.body['country'];
		var gsdburl = dbcfg.gameurl['gs_' + serverid];
		var logurl = dbcfg.logurl;
		var log2url = dbcfg.log2url;
		var page_id = Number(req.body['page_id']);
		var pageNum = Number(req.body['pageNum']);
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
		var date1 = starttime.valueOf();
		var date2 = endtime.valueOf();
		var count = (date2 - date1)/86400000;
		var country1 = countrys.country;
	

		//取出user_register_logs
		var registerresults = new Array();
		var allregisterresults = new Array();
		var ipcarray = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection("user_register_logs",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"rctime": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'rctime':1,'user_name':1,'user_id':1, 'open_udid':1,'ip':1,_id: 0 };
				coll.find(queryMap,resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						for(var i=0;i < results.length;i++){
							var ip = ipa.getAddr(results[i]["ip"].replace(/\s/g, ""));
							results[i]['Ipc'] = ip;
						}
						//将注册日志按日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(v.Ipc == country && parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
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
						//获取所有的ipc
						var h = {};
							var totalHuman = new Array();
							for(var a=0; a < results.length ; a++){
								if(!h[results[a].Ipc]){
									h[results[a].Ipc] = true;
									totalHuman.push(results[a].Ipc);
								}
							}
							ipcarray = totalHuman;
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
				var resultMap = {'server_stamp':1,'udid':1,'ip':1, _id: 0 };
				coll.find(queryMap,resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//根据ip查询玩家账号所在地,看并且存入数据库
						for(var i=0;i < results.length;i++){
							var ip = ipa.getAddr(results[i]["ip"].replace(/\s/g, ""));
							results[i]['Ipc'] = ip;
						}
						//将注册设备数按日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(v.Ipc == country && parseInt(v.server_stamp) > parseInt(date1+86400000*i) && parseInt(v.server_stamp) < parseInt(date1+86400000*(i+1))){
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

		//取出"user_login_logs",登录日志
		var loginresults = new Array();
		var deviceloginresults = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection("user_login_logs",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"rctime": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'rctime':1,'user_name':1,'user_id':1,'open_udid':1,'ip':1,_id: 0 };
				coll.find(queryMap, resultMap)
					.toArray(function (err, results) {
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//根据ip查询玩家账号所在地,看并且存入数据库
						for(var i=0;i < results.length;i++){
							var ip = ipa.getAddr(results[i]["ip"].replace(/\s/g, ""));
							results[i]['Ipc'] = ip;
						}
						//将登陆日志按日期分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							results.forEach(function(v){
								if(v.Ipc == country && parseInt(v.rctime) > parseInt(date1+86400000*i) && parseInt(v.rctime) < parseInt(date1+86400000*(i+1))){
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

						var obj = {
							ret:0,
							loginresult:loginresults,
							registerresult:registerresults,
							allregisterresult:allregisterresults,
							deviceresult:deviceresults,
							afterresult:afterresults,
							afterdeviceresult:afterdeviceresults,
							country1:country1,
							ipcarray:ipcarray,
							timeid:timeid,
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
dbproxy_register["regionall"] = regionall;
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
var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询订单玩家注册时间统计
module.exports.regist = function (dbproxy_register) {
	function registertoorder(req, res, callback) {

		var serverid = req.body['serverid'];
		var accounturl = dbcfg.accounturl;
		var payurl = dbcfg.payurl;
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
		var date3 = moment.utc().valueOf();
		var count = (date2 - date1)/86400000;
		var count1 = parseInt((date3 - date1)/86400000);
	

		//根据条件取出订单
		var allorders = new Array();
		var useridarray = new Array();
		mongoClient.connect(payurl, function (err, db) {
			db.collection("google_pay",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"rctime": { '$gte': starttime.valueOf() }};
				var resultMap = {'rctime':1,'user_id':1,'sku':1, 'orderId':1,_id: 0 };
				coll.find(queryMap,resultMap)
					.toArray(function(err,results){
						db.close();
						results.forEach(function(v){
							if(typeof(v.orderId) != "undefined"){
								allorders.push(v);
								useridarray.push(parseInt(v.user_id));
							}
						})
		//取出"user_register_logs",注册日志
		var allregister = new Array();
		var newallorders = new Array();
		var everyorders = new Array();
		var neweveryorders = new Array();
		mongoClient.connect(accounturl, function (err, db) {
			db.collection("accounts",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"register_time": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() },'id':{"$in":useridarray}};
				var resultMap = {'register_time':1,'id':1,_id: 0 };
				coll.find(queryMap, resultMap)
					.toArray(function (err, results) {
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						allregister = results;
						//将玩家的注册时间放入订单信息中
						for(var i=0;i < allorders.length;i++){
							allregister.forEach(function(v){
								if(parseInt(allorders[i].user_id) == v.id){
									allorders[i].registerTime = v.register_time;
									newallorders.push(allorders[i]);
								}
							})
						}
						//将新的订单结果按照注册时间进行分组
						for(var i=0;i < count;i++){
							var resultsArray = new Array();
							newallorders.forEach(function(v){
								if(parseInt(v.registerTime) > parseInt(date1+86400000*i) && parseInt(v.registerTime) < parseInt(date1+86400000*(i+1))){
									resultsArray.push(v);
								}
							})
							everyorders[i] = resultsArray;
						}
						//将结果中的数据按照订单购买时间分组
						for(var i=0;i < count;i++){
							var newarray = new Array();
							for(var a = i;a < count1;a++){
							var resultsArray = new Array();
								everyorders[i].forEach(function(v){
										if(parseInt(v.rctime) > parseInt(date1+86400000*a) && parseInt(v.rctime) < parseInt(date1+86400000*(a+1))){
											resultsArray.push(v);
										}
								})
								var f = a - i
								newarray[f] = resultsArray;
							}
							neweveryorders[i] = newarray;
						}
						var obj = {
							ret:0,
							allregister:allregister,
							useridarray:useridarray,
							allorders:allorders,
							newallorders:newallorders,
							everyorders:everyorders,
							neweveryorders:neweveryorders,
							timeid:timeid,
							StartTime: req.body['StartTime'],
							EndTime: req.body['EndTime'],
							date3:date3,
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
					})
					} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})



}
dbproxy_register["registertoorder"] = registertoorder;
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
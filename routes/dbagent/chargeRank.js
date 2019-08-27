var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var speeds = require('../../public/translate/speed');
var woods = require('../../public/translate/wood');
var cashs = require('../../public/translate/cash');
var foods = require('../../public/translate/food');
var steels = require('../../public/translate/steel');
var stones = require('../../public/translate/stone');
var countrys = require('../../public/translate/country');
var ipa = require("../../ipcheck.js")

//查询玩家战力
module.exports.regist = function (dbproxy_register) {
	function chargeRank(req, res, callback) {

		var payurl = dbcfg.payurl;
		var nowtime = new Date().getTime();
		var logurl = dbcfg.logurl;
		var speed = speeds.items;
		var wood = woods.items;
		var cash = cashs.items;
		var food = foods.items;
		var steel = steels.items;
		var stone = stones.items;
		var country = countrys.country;
		//是否查看测试订单
		var test;
		if(req.body['test']){
			test = req.body['test'];
		}else{
			test = "no";
		}
		var serverid = req.body['serverid'];
		var gs1url = dbcfg.gameurl['gs_' + serverid];
		var serverid = Number(req.body['serverid']);
		var userid  = req.body['userid'];
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var orderArray = new Array();
		var useridarray = new Array();
		var itemsarray = new Array();
		var useridsarray = new Array();
		var alliancearray = new Array();
				mongoClient.connect(payurl, function (err, db) {
					db.collection('google_pay', { strict: true }, function (err, coll) {
						if(err == null){
							if(userid == 0){
								var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
							}else{
								var queryMap = {"user_id":userid};
							}
							var resultMap = { 'orderId': 1,'sku':1,'user_id':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									if (err) {
										return errorparser(callback, err)
									}
									orderArray = results;
									//根据user_id去重
									var h = {};
									var totalHuman = new Array();
									var totalHuman1 = new Array();
									for(var a=0; a < orderArray.length ; a++){
										if(!h[orderArray[a].user_id]){
											h[orderArray[a].user_id] = true;
											totalHuman.push(orderArray[a]);
											totalHuman1.push(parseInt(orderArray[a].user_id));
										}
									}
									useridarray = totalHuman;
									useridsarray = totalHuman1;
									db.close();

									//根据user_id查询玩家所在公会
									mongoClient.connect(logurl,function(err, db){
										db.collection('user_alliance',{strict:true},function(err,coll){
											if(err == null){
											var queryMap = {'user_id':{"$in":useridsarray}};
											var resultMap = {'user_id':1,'alliance_name':1,'alliance_id':1,_id:0};
											coll.find(queryMap, resultMap)
												.toArray(function(err, results){
													if (err) {
														return errorparser(callback, err)
													}
													var h = {};
													var totalHuman = new Array();
													for(var a=0; a < results.length ; a++){
														if(!h[results[a].alliance_id]){
															h[results[a].alliance_id] = true;
															totalHuman.push(results[a]);
														}
													}
													alliancearray = totalHuman;
													db.close();
									//根据去重后的user_id查询玩家角色信息
									mongoClient.connect(gs1url, function(err,db){
										db.collection('users',{strict:true},function(err,coll){
											if(err == null){
											var queryMap = {'id':{"$in":useridsarray}};
											var resultMap = {"id":1,"username":1,"Power":1,"Alliance":1,"LoginTime":1,"RegisterTime":1,"Ip":1,"Food":1,"Steel":1,"Oil":1,"Diamond":1,"Energy":1,"Cash":1,"LastSavingTime":1,StatInfo:1,Pos:1,Items:1,_id:0}
											coll.find(queryMap, resultMap)
												.toArray(function(err, results){
													db.close();
													if (err) {
														return errorparser(callback, err)
													}
													for(var i=0;i < results.length;i++){
														var ip = ipa.getAddr(results[i]["Ip"].replace(/\s/g, ""));
														results[i]['Ipc'] = ip;
													}
													itemsarray = results;
													var obj = {
														ret: 0,
														result: orderArray,
														speed:speed,
														wood:wood,
														cash:cash,
														food:food,
														steel:steel,
														stone:stone,
														country:country,
														test:test,
														nowtime:nowtime,
														alliancearray:alliancearray,
														useridarray:useridarray,
														itemsarray:itemsarray,
														//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
														url:req.originalUrl
													};
													res.locals.csrf = req.csrfToken();
													callback(obj);
												})
												} else {
							db.close();
							errorparser(callback, err)
						}
										})
									})
												})
												} else {
							db.close();
							errorparser(callback, err)
						}
										})
									})
										
									
								});
								} else {
							db.close();
							errorparser(callback, err)
						}
					});
				});
	}
	dbproxy_register["chargeRank"] = chargeRank;
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
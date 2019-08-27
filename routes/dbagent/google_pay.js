var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var packages = require('../../public/translate/packages');


module.exports.regist = function (dbproxy_register) {
	function google_pay(req, res, callback) {

		var Package = packages.Package;
		var serverid = req.body['serverid'];
		var test;
		if(req.body['test']){
			test = req.body['test'];
		}else{
			test = "no";
		}
		var gs1url = dbcfg.gameurl['gs_1'];
		var dburl = dbcfg.payurl;
		var accounturl = dbcfg.accounturl;
		var logurl = dbcfg.logurl;
		var googlepayarray = new Array();
		var userisarray = new Array();
		var accountarray = new Array();
		var alliancenamearray = new Array();
		var usernamearray = new Array();
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var page_id = Number(req.body['page_id']);
		var pageNum = Number(req.body['pageNum']);
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('google_pay', { strict: true }, function (err, coll) {
						if(err == null){
							var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() } };
							var resultMap = {'user_id': 1,'productId':1,'orderId':1,'purchaseTime':1, 'sku': 1,'package_id':1,'timestamp':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										return errorparser(callback, err)
									}
									googlepayarray = results;
									googlepayarray.forEach(function(v){
										userisarray.push(parseInt(v.user_id));
									})

									
									mongoClient.connect(logurl, function(err,db){
										db.collection('user_alliance', {strict : true }, function(err,coll){
											if(err == null){
											var queryMap = {"user_id":{"$in":userisarray}};
											var resultMap = {'alliance_name':1,'user_id':1,'alliance_id':1,_id:0};
											coll.find(queryMap, resultMap)
												.toArray(function(err,results){
													db.close();
													if (err) {
														return errorparser(callback, err)
													}
													var alliances = new Array();
													results.forEach(function(v){
														alliances.push(v);
													})
													//根据user_id去重
													var h = {};
													var totalHuman = new Array();
													for(var a=0; a < alliances.length ; a++){
														if(!h[alliances[a].user_id]){
															h[alliances[a].user_id] = true;
															totalHuman.push(alliances[a]);
														}
													}
													alliancenamearray = totalHuman;

									mongoClient.connect(gs1url, function(err,db){
										db.collection('users', {strict : true}, function(err,coll){
											if(err == null){
											var queryMap = {"id":{"$in":userisarray}};
											var resultMap = {'id':1,'username':1,_id:0};
											coll.find(queryMap, resultMap)
												.toArray(function(err,results){
													db.close();
													if (err) {
														return errorparser(callback, err)
													}
													var usernames = new Array();
													results.forEach(function(v){
														usernames.push(v);
													})
													//根据id去重
													var h = {};
													var totalHuman = new Array();
													for(var a=0; a < usernames.length ; a++){
														if(!h[usernames[a].id]){
															h[usernames[a].id] = true;
															totalHuman.push(usernames[a]);
														}
													}
													usernamearray = totalHuman;

									mongoClient.connect(accounturl, function(err,db){
										db.collection("accounts", {strict: true},function(err,coll){
											if(err == null){
											var queryMap = {"id":{"$in":userisarray}};
											var resultMap = {"account":1,'register_time':1,'id':1,_id:0 };
											coll.find(queryMap, resultMap)
												.toArray(function(err, results){
													db.close();
													if (err) {
														return errorparser(callback, err)
													}
													results.forEach(function(v){
														accountarray.push(v);
													})

														var obj = {
															ret: 0,
															result: googlepayarray,
															accountarray:accountarray,
															alliancenamearray:alliancenamearray,
															usernamearray:usernamearray,
															//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
															prev_id: page_id - 1,
															translate:Package,
															test:test,
															StartTime: req.body['StartTime'],
															EndTime: req.body['EndTime'],
															pageNum: pageNum,
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
												})
												} else {
							db.close();
							errorparser(callback, err)
						}
										})
									})
	}
	dbproxy_register["google_pay"] = google_pay;
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
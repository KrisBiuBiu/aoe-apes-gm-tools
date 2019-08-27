var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var gcm = require("android-gcm");

//测试功能
module.exports.regist = function (dbproxy_register) {
	function jc(req, res, callback) {
		var test = req.body['test'];
		var serverid = req.body['serverid'];
		var titles = req.body['title'];
		var tickers = req.body['ticker'];
		var txts = req.body['txt'];
		var gsdburl = dbcfg.gameurl['gs_' + serverid];
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var accounturl = dbcfg.accounturl;
		var logurl = dbcfg.logurl;
		var log2url = dbcfg.log2url;
		var useridarray = new Array();
		var useridarray1 = new Array();
		var gcmarray = new Array();
		var created_date  = moment().format('YYYY-MM-DD HH:mm:ss');
		var timeid = req.body['time'];
		if(timeid == "UTC"){
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var posttime  = parseInt(moment.utc().valueOf());
		}else if(timeid == "BJ"){
			var starttime = moment.parseZone(req.body['StartTime'])-28800000;
			var endtime = moment.parseZone(req.body['EndTime'])-28800000;
			var posttime  = parseInt(moment.utc().valueOf());
		}

		//获取注册玩家(加入筛选条件:推送当日登陆过的玩家不再推送)
		mongoClient.connect(gsdburl, function (err, db) {
			db.collection("users",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = { 'RegisterTime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'id':1,'login_time':1,_id: 0 };
				coll.find(queryMap, resultMap)
					.toArray(function (err, results) {
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//根据user_id去重,并将id存入数组
						var h = {};
						var totalHuman1 = new Array();
						var totalHuman = new Array();
						for(var a=0; a < results.length ; a++){
							if(!h[results[a].id]){
								h[results[a].id] = true;
								totalHuman.push(results[a].id + "");
								totalHuman1.push(results[a]);
							}
						}
						useridarray = totalHuman;
						useridarray1 = totalHuman1;


		//取出gcm中的有效值
		var postresult;
		var useridresult = new Array();
		var postArray = new Array();
		var regIdArray = new Array();
		mongoClient.connect(log2url, function (err, db) {
			db.collection('gcm_zone_1',{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {'uid':{"$in":useridarray}};
				var resultMap = {'uid':1,'zoneID':1,'regID':1,_id:0};
				coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						gcmarray = results;
						//将regID转为数组
						for(var a=0;a < gcmarray.length;a++){
							regIdArray.push(gcmarray[a].regID);
							useridresult.push(parseInt(gcmarray[a].uid));
						}
							var reglength = regIdArray.length/100;
							for(var i=0;i < reglength;i++){
								regIdArray1 = regIdArray.slice(i*100,(i+1)*100);
								var gcmObject = new gcm.AndroidGcm('AIzaSyDu-MaQJTkzOGavKGikCvZiJoluN_6oFR8');
								// create new message
								var message = new gcm.Message({
									registration_ids: regIdArray1,
									data: {
										'gcm.notification.body': { title:titles, ticker: tickers, 'txt': txts},
									}
								});
								//进行推送
								gcmObject.send(message, function (err, response) {
									if (err) {
										console.log("err:");
										console.log(err);
									}
									if (response) {
										postresult = response.results;
										console.log("response:");
										console.log(response);
										//判断推送是否成功
										var successresult = new Array();
										var responseresult = new Array();
										for(var b in postresult){
											var a = postresult[b];
											for(var y in a){
												if(a[y].length > 22){
													successresult.push("1");
													responseresult.push(a[y]);
												}else{
													successresult.push("0");
													responseresult.push(a[y]);
												}
											}
										}
										//将推送情况存入数组
										var option = {
											successresult:successresult,
											responseresult:responseresult,
											useridresult:useridresult,
											rctime:starttime.valueOf(),
											endtime:endtime.valueOf(),
											posttime:posttime,
											created_date:created_date,
										}
										//连接数据库 aoegmtool
										mongoClient.connect(dbcfg.aoegmtoolurl, function (err, db) {
											if (err) {
											return callback(err);
											}
											// 讀取 post 集合,若无则自动创建
											db.collection('post', function (err, collection) {
												if (err) {
													db.close();
													return callback(err);
												}
												// 寫入 post 文檔
												collection.insert(option, { safe: true }, function (err, user) {
													db.close();
												});
											});
										});
											}
										});
							}
						
						
						//取出无效玩家id列表
						for(var i=0;i < gcmarray.length;i++){
							for(var j=0;j < useridarray.length;j++){
								if(parseInt(gcmarray[i].uid) == parseInt(useridarray[j])){
									useridarray.splice(j,1);
								}
							}
						}
						//连接数据库 aoegmtool
						var options = {
							starttime:starttime.valueOf(),
							endtime:endtime.valueOf(),
							posttime:posttime
						}
						mongoClient.connect(dbcfg.aoegmtoolurl, function (err, db) {
							if (err) {
							return callback(err);
							}
							// 讀取 post 集合,若无则自动创建
							db.collection('postcount', function (err, collection) {
								if (err) {
									db.close();
									return callback(err);
								}
								// 寫入 post 文檔
								collection.insert(options, { safe: true }, function (err, user) {
									db.close();
								});
							});
						});
						var obj = {
							ret:0,
							serverid:serverid,
							useridarray:useridarray,
							useridarray1:useridarray1,
							regIdArray:regIdArray,
							postresult:postresult,
							postArray:postArray,
							gcmarray:gcmarray,
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
					})
					} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})

		

}
dbproxy_register["jc"] = jc;
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
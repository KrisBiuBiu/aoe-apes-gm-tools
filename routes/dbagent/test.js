var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询推送情况
module.exports.regist = function (dbproxy_register) {
	function test(req, res, callback) {

		var dburl = dbcfg.aoegmtoolurl;
		var gsurl = dbcfg.gameurl['gs_1'];
		var message = new Array();
		var ptime;
		var timeid = req.body['time'];
		if(timeid == "UTC"){
			var starttime = parseInt(req.body['StartTime']);
			var endtime = parseInt(req.body['EndTime']);
			var ptime = parseInt(req.body['PostTime']);
		}else if(timeid == "BJ"){
			var starttime = parseInt(req.body['StartTime']);
			var endtime = parseInt(req.body['EndTime']);
			var ptime = parseInt(req.body['PostTime']);
		}
		var nowtime  = moment.utc().valueOf();
		var aaaa = new Array();
		var bbbb = new Array();
		var successarray = new Array();
		var responsearray = new Array();
		var useridarray = new Array();
		var onlinearray = new Array();
		var logintimearray = new Array();
		var posttime;
				//取出推送数据
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('post', { strict: true }, function (err, coll) {
						if (err == null) {
						var queryMap = { 'rctime':starttime ,'endtime':endtime,'posttime':ptime};
						var resultMap = { 'responseresult': 1, "successresult":1,"useridresult":1,"rctime":1,'posttime':1,_id: 0 };
						coll.find(queryMap, resultMap)
						.toArray(function (err, results) {
							aaaa = results;
							db.close();
							if (err) {
								return errorparser(callback, err)
							}
							//将所有response放入一个数组
							for(var i=0;i < results.length;i++){
								var newres = results[i]["responseresult"];
								for(var y=0;y < newres.length;y++){
									responsearray.push(newres[y]);
								}
							}
							//将所有success放入一个数组
							for(var i=0;i < results.length;i++){
								var newsuc = results[i]["successresult"];
								for(var y=0;y < newsuc.length;y++){
									successarray.push(newsuc[y]);
								}
							}
							//将推送的玩家id放入一个新数组
							for(var i=0;i < results.length;i++){
								var useridarray = results[i]["useridresult"];
							}
							//获取推送时间
							for(var i=0;i < results.length;i++){
								var posttime = parseInt(results[i]["posttime"]);
							}
				//查看玩家登录情况
				mongoClient.connect(gsurl, function (err, db) {
					db.collection('users', { strict: true }, function (err, coll) {
						if(err == null){
						var queryMap = { 'id':{"$in":useridarray} };
						var resultMap = { 'LoginTime': 1,'id':1,_id: 0 };
						coll.find(queryMap, resultMap)
						.toArray(function (err, results) {
							db.close();
							if (err) {
								return errorparser(callback, err)
							}
							bbbb = results;
							//将玩家登录时间放入一个数组
							for(var i=0;i < results.length;i++){
								logintimearray.push(results[i].LoginTime);
							}
							//将玩家在线情况放入一个数组
							for(var i=0;i < results.length;i++){
								if(parseInt(posttime) < parseInt(results[i].LoginTime)){
									onlinearray.push("1");
								}else{
									onlinearray.push("0");
								}
							}
							
							var obj = {
								ret: 0,
								successarray:successarray,
								responsearray:responsearray,
								useridarray:useridarray,
								posttime:posttime,
								onlinearray:onlinearray,
								logintimearray:logintimearray,
								timeid:timeid,
								aaaa:aaaa,
								bbbb:bbbb,
								//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
								StartTime: req.body['StartTime'],
								EndTime: req.body['EndTime'],
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
	}
	dbproxy_register["test"] = test;
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
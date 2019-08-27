var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//查询玩家战力
module.exports.regist = function (dbproxy_register) {
	function mongolog_alliance(req, res, callback) {
		var logurl = dbcfg.logurl;
		var gs1url = dbcfg.gameurl['gs_1'];
		var page_id = Number(req.body['page_id']);
		var project_id = req.body['project_id'];
		var alliance_name = req.body['alliance_name'];
		var pageNum = Number(req.body['pageNum']);
		var leaderids = new Array();
		var alliancesinfo = new Array();
		var leadersname = new Array();

		//查询公会信息
		mongoClient.connect(logurl, function (err, db) {
			db.collection('alliance', { strict: true }, function (err, coll) {
				if(err == null){
				//如果不输入公会名字则查询全部
				if(alliance_name == ""){
					var queryMap = { 'project_id': project_id };
				}else{
					var queryMap = {'project_id':project_id,'alliance_name':alliance_name }
				}
				var resultMap = { 'alliance_id': 1,"created_date":1,"alliance_leader":1,"member_count":1,"alliance_name":1,_id: 0 };
				coll.find(queryMap, resultMap)
					.toArray(function (err, results) {
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						//将查询结果存入数组中
						alliancesinfo = results;
						//将所有会长id存入数组
						alliancesinfo.forEach(function(v){
							leaderids.push(v.alliance_leader);
						})

		//查询各个公会会长的名字
		mongoClient.connect(gs1url, function(err,db){
			db.collection('users', {strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"id":{"$in":leaderids}};
				var resultMap = {"username":1,"id":1,_id:0};
				coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						leadersname = results;
						var obj = {
							ret: 0,
							alliancesinfo: alliancesinfo,
							leadersname:leadersname,
							//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
							prev_id: page_id - 1,
							page_id:page_id,
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


	}
	dbproxy_register["mongolog_alliance"] = mongolog_alliance;
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




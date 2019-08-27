var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;


//玩家流失统计
module.exports.regist = function (dbproxy_register) {
	function bootfour(req, res, callback) {
		var log2url = dbcfg.log2url;
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var version = req.body['version'];
		var versionlength = version.length;
		var date1 = starttime.valueOf();
		var date2 = endtime.valueOf();
		var count = (date2-date1)/86400000;
		var getnames = new Array();
		var loadgames = new Array();
		var initgames = new Array();
		var initgame1s = new Array();


		//取出升国旗
		//取出NewBie中所有玩家的信息

						//取出查询时间段内所有的注册玩家
		var registerResult = new Array();
		mongoClient.connect(log2url, function (err, db) {
			db.collection("boot",{strict:true}, function(err,coll){
				if(err == null){
					if(versionlength > 0){
						var queryMap = {"version":version,"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
						var resultMap = {'server_stamp':1,'udid':1,'str':1,_id: 0 };
					}else{
						var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
						var resultMap = {'server_stamp':1,'udid':1,'str':1,_id: 0 };
					}
				coll.find(queryMap, resultMap)
				.toArray(function(err,results){
					db.close();
					if (err) {
						return errorparser(callback, err)
					}
					var bootsarray = new Array();
					for(var i=0;i < count;i++){
						var bootarray = new Array();
						results.forEach(function(v){
							if(parseInt(v.server_stamp) > parseInt(date1+86400000 * i) && parseInt(v.server_stamp) < parseInt(date2+86400000*(i+1))){
								bootarray.push(v);
							}
						})
						bootsarray[i] = bootarray;
					}
					for(var i=0;i < count;i++){
						var getname = new Array();
						var loadgame = new Array();
						var initgame = new Array();
						var initgame1 = new Array();
						bootsarray[i].forEach(function(v){
							if(v.str == "getgame_server_versionformgate"){
								getname.push(v);
							}
							if(v.str == "startloadgame"){
								loadgame.push(v);
							}
							if(v.str == "startinitgame"){
								initgame.push(v);
							}
							if(v.str == "connectgameserver"){
								initgame1.push(v);
							}
						})
						//对getnames根据udid去重
						var h = {};
						var totalHuman = new Array();
						for(var a=0; a < getname.length ; a++){
							if(!h[getname[a].udid]){
								h[getname[a].udid] = true;
								totalHuman.push(getname[a]);
							}
						}
						getnames[i] = totalHuman;
						//对getnames根据udid去重
						var h = {};
						var totalHuman = new Array();
						for(var a=0; a < loadgame.length ; a++){
							if(!h[loadgame[a].udid]){
								h[loadgame[a].udid] = true;
								totalHuman.push(loadgame[a]);
							}
						}
						loadgames[i] = totalHuman;
						//对getnames根据udid去重
						var h = {};
						var totalHuman = new Array();
						for(var a=0; a < initgame.length ; a++){
							if(!h[initgame[a].udid]){
								h[initgame[a].udid] = true;
								totalHuman.push(initgame[a]);
							}
						}
						initgames[i] = totalHuman;
						//对getnames根据udid去重
						var h = {};
						var totalHuman = new Array();
						for(var a=0; a < initgame1.length ; a++){
							if(!h[initgame1[a].udid]){
								h[initgame1[a].udid] = true;
								totalHuman.push(initgame1[a]);
							}
						}
						initgame1s[i] = totalHuman;
					}
					var obj = {
						ret:0,
						getnames:getnames,
						loadgames:loadgames,
						initgames:initgames,
						initgame1s:initgame1s,
						StartTime: req.body['StartTime'],
						EndTime: req.body['EndTime'],
						url:req.originalUrl
					}
					res.locals.csrf = req.csrfToken();
					callback(obj);

				})
				} else {
							db.close();
							errorparser(callback, err)
						}
			})
		})




	}
	dbproxy_register["bootfour"] = bootfour;
}
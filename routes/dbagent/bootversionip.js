var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var ipa = require("../../ipcheck.js");

module.exports.regist = function (dbproxy_register) {
	function bootversionip(req, res, callback) {

		var log2url = dbcfg.log2url;
		if (log2url) {
			var results1 = new Array();
			var version = req.body['version'];
			var versionlength = version.length;
			var starttime = moment.parseZone(req.body['StartTime']);
			var endtime = moment.parseZone(req.body['EndTime']);
			var otherArray = new Array();
			var BDArray = new Array();
			var BRArray = new Array();
			var CAArray = new Array();
			var CNArray = new Array();
			var INArray = new Array();
			var RUArray = new Array();
			var THArray = new Array();
			var UAArray = new Array();
			var USArray = new Array();
				mongoClient.connect(log2url, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('boot', { strict: true }, function (err, coll) {
						if (err == null) {
								var queryMap = { 'version':version,'server_stamp': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
								var resultMap = {'ip':1,'udid':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									//去重处理
									var h = {};
									var totalHuman = new Array();
									for(var a=0; a < results.length ; a++){
										if(!h[results[a].udid]){
											h[results[a].udid] = true;
											totalHuman.push(results[a]);
										}
									}
									results1 = totalHuman;
									for(var i=0;i < results1.length;i++){
										var ip = ipa.getAddr(results1[i]["ip"].replace(/\s/g, ""));
										results1[i]['Ipc'] = ip;
									}
									for(var i=0;i < results1.length;i++){
										if(results1[i].Ipc == "BR"){
											BRArray.push(results1[i]);
										}else if(results1[i].Ipc == "CA"){
											CAArray.push(results1[i]);
										}else if(results1[i].Ipc == "CN"){
											CNArray.push(results1[i]);
										}else if(results1[i].Ipc == "IN"){
											INArray.push(results1[i]);
										}else if(results1[i].Ipc == "RU"){
											RUArray.push(results1[i]);
										}else if(results1[i].Ipc == "TH"){
											THArray.push(results1[i]);
										}else if(results1[i].Ipc == "UA"){
											UAArray.push(results1[i]);
										}else if(results1[i].Ipc == "US"){
											USArray.push(results1[i]);
										}else{
											otherArray.push(results1[i]);
										}
									}


									db.close();
									if (err) {
										errorparser(callback, err)
									} else {
										var obj = {
											ret: 0,
											result: results1,
											BRArray:BRArray,
											CAArray:CAArray,
											CNArray:CNArray,
											INArray:INArray,
											RUArray:RUArray,
											THArray:THArray,
											UAArray:UAArray,
											USArray:USArray,
											otherArray:otherArray,
											version:version,
											StartTime: req.body['StartTime'],
											EndTime: req.body['EndTime'],
											url:req.originalUrl
										};
										res.locals.csrf = req.csrfToken();
										callback(obj);
									}
								});
						} else {
							db.close();
							errorparser(callback, err)
						}
					});
				});
		} else {
			syserror(callback);
		}
	}
	dbproxy_register["bootversionip"] = bootversionip;
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
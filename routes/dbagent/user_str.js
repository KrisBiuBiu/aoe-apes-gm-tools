var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var Newbies = require('../../public/translate/Newbie');

//玩家流失统计
module.exports.regist = function (dbproxy_register) {
	function user_str(req, res, callback) {
		var serverid = req.body['serverid'];
		var Newbie = Newbies.Newbie;
		var log2url = dbcfg.log2url;
		var logurl = dbcfg.logurl;
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var date1 = starttime.valueOf();
		var date2 = endtime.valueOf();
		var newbieResult = new Array();


		//取出升国旗
		//取出NewBie中所有玩家的信息
		mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:1",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[1] = results;
					})
				})
			})
		mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:2",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[2] = results;
					})
				})
			})
		mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:3",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[3] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:4",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[4] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:5",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[5] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:6",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[6] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:7",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[7] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:8",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[8] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:9",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[9] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:10",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[10] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:11",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[11] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:12",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[12] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:13",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[13] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:14",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[14] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:15",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[15] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:16",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[16] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:17",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[17] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:18",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[18] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:19",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[19] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:20",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[20] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:21",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[21] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:22",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[22] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:23",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[23] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:24",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[24] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:25",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[25] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:26",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[26] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:27",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[27] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:28",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[28] = results;
					})
				})
			})
			mongoClient.connect(log2url,function(err,db){
				db.collection("NewbieID:29",{strict:true},function(err,coll){
					var queryMap = {"server_stamp": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
					var resultMap = {'userid':1,'udid':1,_id: 0 };
					coll.find(queryMap, resultMap)
					.toArray(function(err,results){
						db.close;
						newbieResult[29] = results;
					})
				})
			})
			//取出查询时间段内所有的注册玩家
		var registerResult = new Array();
		mongoClient.connect(logurl, function (err, db) {
			db.collection("user_register_logs",{strict:true}, function(err,coll){
				var queryMap = {"rctime": { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() }};
				var resultMap = {'rctime':1,'user_name':1,'user_id':1, 'open_udid':1,_id: 0 };
				coll.find(queryMap, resultMap)
				.toArray(function(err,results){
					db.close();
					registerResult = results;


					//计算29组数据
					var countArray = new Array();
						for(var i=1;i < 30;i++){
							var count = 1;
							newbieResult[i].forEach(function(a){
								registerResult.forEach(function(v){
								if(parseInt(v.user_id) == parseInt(a.userid)){
									count++;
								}
								})
							})
							countArray[i] = count;
						}
					
					var obj = {
						ret:0,
						registerResult:registerResult,
						newbieResult:newbieResult,
						Newbie:Newbie,
						countArray:countArray,
						StartTime: req.body['StartTime'],
						EndTime: req.body['EndTime'],
						url:req.originalUrl
					}
					res.locals.csrf = req.csrfToken();
					callback(obj);

				})
			})
		})



	}
	dbproxy_register["user_str"] = user_str;
}
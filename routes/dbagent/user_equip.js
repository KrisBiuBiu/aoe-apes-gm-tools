var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var equip = require('../../public/translate/equip');

//测试功能
module.exports.regist = function (dbproxy_register) {
	function user_equip(req, res, callback) {
		var translate = equip.Equip;
		var serverid = req.body['serverid'];
		var id = parseInt(req.body['id']);
		var username = req.body['username'];
		var gsdburl = dbcfg.gameurl['gs_' + serverid];

		//取出玩家包裹内的装备
		var packEquips = new Array();
		var packEquip = new Array();
		var newpackEquip = new Array();
		var newpackEquip1 = new Array();
		var heroEquips = new Array();
		var heroEquip = new Array();
		var newheroEquip = new Array();
		mongoClient.connect(gsdburl, function(err, db){
			db.collection("users",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"id":id};
				var resultMap = {"Tavern.Heros.1.Equip":1,_id:0};
				coll.find(queryMap, resultMap)
					.toArray(function(err, results){
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						packEquips = results;
						if(results.length != 0){
							packEquip = packEquips['0'].Tavern.Heros['1'].Equip;
						}
						//json转数组
						for(var i in packEquip){
							newpackEquip.push(packEquip[i]);
						}
		//取出玩家装备信息
		mongoClient.connect(gsdburl, function (err, db) {
			db.collection("users",{strict:true}, function(err,coll){
				if(err == null){
				var queryMap = {"id":id};
				var resultMap = {'RecruitHall.Officer':1,_id: 0 };
				coll.find(queryMap, resultMap)
					.toArray(function (err, results) {
						db.close();
						if (err) {
							return errorparser(callback, err)
						}
						heroEquips = results;
						if(results.length != 0){
							heroEquip = heroEquips["0"].RecruitHall.Officer;
						}
						//json转数组
						for(var i in heroEquip){
							var aaa;
							aaa = {id:heroEquip[i].Id,uid:heroEquip[i].Uid}
							newheroEquip.push(aaa);
						}
						//将身上的装备转为装备Id
						for(var i=0;i < newpackEquip.length;i++){
							newheroEquip.forEach(function(v){
								if(v.uid == newpackEquip[i]){
									newpackEquip1.push(v.id);
								}
							})
								if(newpackEquip[i] == 0){
									newpackEquip1.push(0);
								}
						}
						var obj = {
							ret:0,
							serverid:serverid,
							id:id,
							username:username,
							translate:translate,
							newheroEquip:newheroEquip,
							newpackEquip:newpackEquip,
							newpackEquip1:newpackEquip1,
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
dbproxy_register["user_equip"] = user_equip;
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
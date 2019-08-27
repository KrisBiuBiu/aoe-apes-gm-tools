var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;
var packages = require('../../public/translate/packages');
var promotions = require('../../public/translate/promotion');


module.exports.regist = function (dbproxy_register) {
	function google_pay2(req, res, callback) {

		var Package = packages.Package;
		var promotion = promotions.promotion;
		var serverid = req.body['serverid'];
		var dburl = dbcfg.payurl;
		var googlepayarray = new Array();
		var packagenamearray = new Array();
		var packagecount = new Array();
		var pricearray = new Array();
		var playerarray = new Array();
		var packageidarray = new Array();
		var starttime = moment.parseZone(req.body['StartTime']);
		var endtime = moment.parseZone(req.body['EndTime']);
		var page_id = Number(req.body['page_id']);
		var pageNum = Number(req.body['pageNum']);
				mongoClient.connect(dburl, function (err, db) {
					db.collection('google_pay', { strict: true }, function (err, coll) {
						if(err == null){
							var queryMap = { 'rctime': { '$gte': starttime.valueOf(), '$lte': endtime.valueOf() } };
							var resultMap = {'user_id': 1,'productId':1,'orderId':1,'purchaseTime':1, 'sku': 1,'package_id':1,'timestamp':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.sort([['rctime', 1]]).skip((page_id - 1) * pageNum).limit(pageNum)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										return errorparser(callback, err)
									}
									googlepayarray = results;
									//将礼包对应的名称放入数组
									googlepayarray.forEach(function(v){
										for(var i in Package){
											if(typeof(v.orderId) != "undefined" && parseInt(v.package_id) == parseInt(i)){
												v.packagename = Package[i];
											}
										}
									})
									//将礼包是否为促销放入数组
									googlepayarray.forEach(function(v){
										for(var i in promotion){
											if(typeof(v.orderId) != "undefined" && parseInt(v.package_id) == parseInt(i)){
												v.promotion = promotion[i];
											}
										}
									})
									//根据礼包名称去重,并且取出所有的礼包名称
									var h = {};
									var totalHuman = new Array();
									for(var a=0; a < googlepayarray.length ; a++){
										if(!h[googlepayarray[a].packagename]){
											h[googlepayarray[a].packagename] = true;
											if(typeof(googlepayarray[a].orderId) != "undefined" ){
											totalHuman.push(googlepayarray[a].packagename);
											}
										}
									}
									packagenamearray = totalHuman;
									//取出每种礼包的价格
									for(var i in packagenamearray){
										var price
										googlepayarray.forEach(function(v){
											if(typeof(v.orderId) != "undefined" && packagenamearray[i] == v.packagename){
												price = v.sku;
											}
										})
										pricearray.push(price);
									}
									//计算每种礼包的购买数量
									for(var i in packagenamearray){
										var count = 0;
										googlepayarray.forEach(function(v){
											if(typeof(v.orderId) != "undefined" && packagenamearray[i] == v.packagename){
												count++;
											}
										})
										packagecount.push(count);
									}
									//计算每种礼包购买的详细
									for(var i in packagenamearray){
										var player = new Array();
										googlepayarray.forEach(function(v){
											if(typeof(v.orderId) != "undefined" && packagenamearray[i] == v.packagename && v.promotion == "1"){
												player.push(v.promotion);
											}
										})
										packageidarray.push(player)
									}
									//计算每种礼包的购买人数
									for(var i in packagenamearray){
										var player = new Array();
										googlepayarray.forEach(function(v){
											if(typeof(v.orderId) != "undefined" && packagenamearray[i] == v.packagename){
												player.push(v.user_id);
											}
										})
										var h = {};
										var totalHuman = new Array();
										for(var a=0; a < player.length ; a++){
											if(!h[player[a]]){
												h[player[a]] = true;
												totalHuman.push(player[a]);
											}
										}
										playerarray.push(totalHuman);
									}

									var obj = {
										ret: 0,
										result: googlepayarray,
										packagenamearray:packagenamearray,
										packagecount:packagecount,
										pricearray:pricearray,
										playerarray:playerarray,
										packageidarray:packageidarray,
										promotion:promotion,
										//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
										prev_id: page_id - 1,
										translate:Package,
										StartTime: req.body['StartTime'],
										EndTime: req.body['EndTime'],
										pageNum: pageNum,
										url:req.originalUrl
									};
									res.locals.csrf = req.csrfToken();
									callback(obj);
								});
								} else {
							db.close();
							errorparser(callback, err)
						}
							});
						});
	}
	dbproxy_register["google_pay2"] = google_pay2;
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
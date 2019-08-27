var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var dbcfg = require('../../settings').GAME;

//删除普通管理员
module.exports.regist = function (dbproxy_register) {
	function delete_gmuser(req, res, callback) {

		var dburl = dbcfg.aoegmtoolurl;
		if (dburl) {
			var username = req.body['username'];
			var creator = req.body['creator'];
				mongoClient.connect(dburl, function (err, db) {
					if (err) {
						return errorparser(callback, err)
					}
					db.collection('users', { strict: true }, function (err, coll) {
						if (err == null) {
							coll.remove({"name":username,"creator":creator},{safe:true},function(err,result){
								var result = '成功';
							})
								db.collection('users', { strict: true }, function (err, coll) {
						if (err == null) {
							var queryMap = { 'creator':creator };
							var resultMap = { 'name': 1,'gamelog_itm':1,'gamedata_itm':1, _id: 0 };
							coll.find(queryMap, resultMap)
								.toArray(function (err, results) {
									db.close();
									if (err) {
										errorparser(callback, err)
									} else {
										var obj = {
											ret: 0,
											result: results,
											//下面的参数是分页要用的数据,只支持post请求，收集刚才post请求的参数
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
						} 
					});
				});
		} else {
			syserror(callback);
		}
	}
	dbproxy_register["delete_gmuser"] = delete_gmuser;
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
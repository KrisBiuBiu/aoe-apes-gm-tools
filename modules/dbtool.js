var MongoClient = require('mongodb').MongoClient;

function DB(db) {
	this.db = db;
};
module.exports = DB;


//获取指定表
DB.prototype.collection = function (collectionName, callback) {
		this.db.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
		} else {
			callback && callback(null, coll);
		}
		});
};

//关闭开启的数据库连接方法
DB.prototype.close = function () {
		if (this.db) {
		this.db.close();
		}
};

DB.connect = function (options, callback) {
		options = options || {};
		if (options.url) {
		// New native connection using url + mongoOptions
		MongoClient.connect(options.url, options.mongoOptions || {}, function (err, db) {
			if (err) {
				callback && callback(err);
			} else {
				callback && callback(null, new DB(db));
			}
		});
		} else {
		callback && callback(new Error('Connection strategy not found'));
		}
};
//按照指定条件查询一个结果
DB.prototype.findOne = function (collectionName, selector, callback) {
		this.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
			return
		}
		coll.findOne(selector, function (err, result) {
			try {
				if (err) {
					callback && callback(err);
				} else {
					if (result) {
						callback && callback(null, result);
					} else {
						callback && callback(null, null);
					}
				}
			} catch (err) {
				callback && callback(err);
			}
		});
		});
};
//按照指定条件修改数据
DB.prototype.update = function (collectionName, cond,change, callback) {
		this.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
			return
		}
		coll.update(cond,change, function (err, result) {
			try {
				if (err) {
					callback && callback(err);
				} else {
					if (result) {
						callback && callback(null, result);
					} else {
						callback && callback(null, null);
					}
				}
			} catch (err) {
				callback && callback(err);
			}
		});
		});
};

//按照指定条件修改数据
DB.prototype.insert = function (collectionName, doc,options, callback) {
		this.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
			return
		}
		coll.insert(doc,options||{}, function (err, result) {
			try {
				if (err) {
					callback && callback(err);
				} else {
					if (result) {
						callback && callback(null, result);
					} else {
						callback && callback(null, null);
					}
				}
			} catch (err) {
				callback && callback(err);
			}
		});
		});
};

//按照指定条件查询所有
DB.prototype.findAll = function (collectionName, selector, callback) {
		this.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
			return
		}
		coll.find(selector).toArray(function (err, results) {
			try {
				if (err) {
					callback && callback(err);
				} else {
					if (results) {
						callback && callback(null, results);
					} else {
						callback && callback(null, null);
					}
				}
			} catch (err) {
				callback && callback(err);
			}
		});
		});
};

//按照指定条件分页查询
DB.prototype.find = function (collectionName, selector, callback, sorter, limits, skips) {
		this.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
			return
		}
		coll.find(selector).sort(sorter).limit(limits).skip(skips).toArray(function (err, results) {
			try {
				if (err) {
					callback && callback(err);
				} else {
					if (results) {
						callback && callback(null, results);
					} else {
						callback && callback(null, null);
					}
				}
			} catch (err) {
				callback && callback(err);
			}
		});
		});
};

//按照指定条件查询结果数量
DB.prototype.count = function (collectionName, selector, callback) {
		this.collection(collectionName, function (err, coll) {
		if (err) {
			callback && callback(err);
			return
		}
		coll.count(selector, function (err, count) {
			if (err) {
				callback && callback(err);
			} else {
				callback && callback(null, count);
			}
		});
		});
};
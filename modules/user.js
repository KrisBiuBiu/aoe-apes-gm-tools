var mongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var dbcfg = settings.GM;
var logger = require("../logger").logger;
var crypto = require('crypto');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.admin = user.admin;
  this.gamelog_itm = user.gamelog_itm;
  this.gamedata_itm = user.gamedata_itm;
  this.creator = user.creator;
};
module.exports = User;

User.initUser = function () {
  mongoClient.connect(dbcfg.url, function (err, db) {
    if (err) {
      logger.error("connect db error:", err)
      return
    }
    //http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#collection
    // db.createIndex('users', { name: 1 }, { unique: true });

    db.collection("users", function (err, collection) {
      if (err) {
        db.close();
        logger.error("connect collection 'users' error:", err)
        return
      }
      collection.ensureIndex('name', { unique: true });
      var username = settings.admin.name
      collection.findOne({ name: username }, function (err, doc) {
        if (doc == null) {
          var md5 = crypto.createHash('md5');
          var newuser = new User(settings.admin);
          newuser.password = md5.update(newuser.password).digest('base64');
          collection.insert(newuser, { safe: true }, function (err) {
            db.close();
            if (err) {
              logger.error("init admin user err:" + err);
            } else {
              logger.info("init admin user ok...");
            }
          });
        } else {
          db.close();
          logger.debug("admin user exits...");
        }
      });
    });
  });

}
User.prototype.save = function (callback) {
  // 存入 Mongodb 的文檔
  var user = {
    name: this.name,
    password: this.password,
    admin: this.admin,
    gamelog_itm: this.gamelog_itm,
    gamedata_itm: this.gamedata_itm,
    creator: this.creator
  };
  mongoClient.connect(dbcfg.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 爲 name 屬性添加索引
      // collection.ensureIndex('name', { unique: true });
      // 寫入 user 文檔
      collection.insert(user, { safe: true }, function (err, user) {
        db.close();
        callback(err, user);
      });
    });
  });
};

User.get = function (username, callback) {
  mongoClient.connect(dbcfg.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.findOne({ name: username }, function (err, doc) {
        db.close();
        if (doc) {
          // 封裝文檔爲 User 對象
          var user = new User(doc);
          callback(err, user);
        } else {
          callback(err, null);
        }
      });
    });
  });
};

User.update = function (username, arr, callback) {
  mongoClient.connect(dbcfg.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 查找 name 屬性爲 username 的文檔
      collection.update({ name: username }, { '$set': arr }, function (err, username) {
        db.close();
        callback(err, username);
      });
    });
  });
};
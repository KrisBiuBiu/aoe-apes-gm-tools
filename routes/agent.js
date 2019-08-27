var moment = require('moment');
var mongoClient = require('mongodb').MongoClient;
var settings = require('../settings');
var dbcfg = settings.GM;
var http = require('http');
var url = require('url');
var qs = require('querystring');
// var logger = require("./logger").logger;
var log4js = require("log4js");
var proxyurl = require('../settings').GAME.webaddr;

var fs = require("fs");

var ssl_key = fs.readFileSync('./cert/key.pem');
var ssl_cert = fs.readFileSync('./cert/cert.pem');

var logger = log4js.getLogger('agent');


module.exports.post = function (req, proxy_path, callback) {
  var pu = url.parse(proxyurl);
  var options = {
    protocol: 'http:',
    hostname: pu.hostname,
    port: pu.port,
    path: proxy_path,
    method: 'POST',
    headers: getHeader(req)
  };
//将请求存入数据库,type=0
var rctime  = moment.utc().valueOf();
var created_date  = moment().format('YYYY-MM-DD HH:mm:ss');
var option = {
    account: req.session.user.name,
    type:"0",
    proxy_path:proxy_path,
    body:req.body,
    rctime:rctime,
    created_date:created_date
  };
mongoClient.connect(dbcfg.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 gm_history 集合
db.collection('gm_history', function (err, collection) {
  if (err) {
    db.close();
    return callback(err);
  }
      // 爲 name 屬性添加索引
      // collection.ensureIndex('name', { unique: true });
      // 寫入 gm_history 文檔
      collection.insert(option, { safe: true }, function (err, user) {
        db.close();
      });
    });
  });

//TODO 
  //gm_agent_history
  //proxy_path:proxy_path
  //body:req.body
  //account: req.session.user.name
  //type:0 //请求操作类型
  //crtime:毫秒
  //time:

  var content = qs.stringify(req.body);
  // console.log("account:",req.session.user.name,"\noptions:",JSON.stringify(options),"\nbody:",content);
  logger.info("account:", req.session.user.name, "\noptions:", JSON.stringify(options), "\nbody:", content);

  var proxy_req = http.request(options, function (res) {
    logger.debug('proxy res status: ', res.statusCode);
    logger.debug('proxy res headers: ', JSON.stringify(res.headers));
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      logger.info('proxy res body: ', body);

//TODO 
  //gm_agent_history
  //proxy_path:proxy_path
  //body:body
  //account: req.session.user.name
  //type:1 //请求操作类型
  //crtime:毫秒
  //time:
  // callback(JSON.parse(body));
//将成功的回复存入数据库 type=1
var rctime  = moment.utc().valueOf();
var created_date  = moment().format('YYYY-MM-DD HH:mm:ss');
    var option1 = {
    rctime:rctime,
    created_date:created_date,
    account: req.session.user.name,
    type:"1",
    proxy_path:proxy_path,
    body:body
  };
  mongoClient.connect(dbcfg.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    // 讀取 gm_history 集合
    db.collection('gm_history', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      // 爲 name 屬性添加索引
      // collection.ensureIndex('name', { unique: true });
      // 寫入 gm_history 文檔
      collection.insert(option1, { safe: true }, function (err, user) {
        db.close();
      });
    });
  });
      callback(body);
    });
  });
  proxy_req.on('error', function (err) {
    logger.error('problem with req: ', '\nError ' + new Date().toISOString() + '\n' + (err.stack || err.message || 'unknow error') + '\n');

//TODO 
  //gm_agent_history
  //proxy_path:proxy_path
  //body:err.message
  //account: req.session.user.name
  //type:2 //请求操作类型
  //crtime:毫秒
  //time:

    // callback({ret:200001,result:err.message});
    //将失败的回复存入数据库,type=2
    if(err.message){
      var rctime  = moment.utc().valueOf();
      var created_date  = moment().format('YYYY-MM-DD HH:mm:ss');
      var option2 = {
        rctime:rctime,
        created_date:created_date,
        account: req.session.user.name,
        type:"2",
        proxy_path:proxy_path,
        body:err.message
      };
      mongoClient.connect(dbcfg.url, function (err, db) {
        if (err) {
          return callback(err);
        }
        // 讀取 gm_history 集合
        db.collection('gm_history', function (err, collection) {
          if (err) {
            db.close();
            return callback(err);
          }
          // 爲 name 屬性添加索引
          // collection.ensureIndex('name', { unique: true });
          // 寫入 gm_history 文檔
          collection.insert(option2, { safe: true }, function (err, user) {
            db.close();
          });
        });
      });
    }
    callback(JSON.stringify({ ret: 200001, result: err.message }));
  });
  proxy_req.write(content);
  proxy_req.end();
};

// 获取请求的headers，去掉host和connection
var getHeader = function (req) {
  var ret = {};
  for (var i in req.headers) {
    if (!/host|connection|cookie|content-length/i.test(i)) {
      ret[i] = req.headers[i];
    }
  }
  return ret;
};

module.exports = {
  GM: {
    saveUninitialized: false,// don't create session until something stored
    resave: false,//don't save session if unmodified
    collection: 'sessions',
    secret: 'aoe some secret string used for signing cookies!',
    cookie: {
      maxAge: 1000 * 60 * 60,//cookie 30分钟没操作过期
      secure: 'auto'
    },
    rolling: true,
    touchAfter: 1 * 60,//1分钟存档一次
    url:'mongodb://root:collectionName@127.0.0.1:27017/aoegmtool' // 游戏普通数据表
  },
  GAME: {
    logurl: 'mongodb://monname:collectionName@127.0.0.1:27017/mongolog', // 游戏操作表
    logurl1: 'mongodb://payname:collectionName@127.0.0.1:27017/pay', // 付款记录表
    gameurl:{
        gs_1: 'mongodb://gsname:collectionName@127.0.0.1:27017/gs1', // 游戏常规操作数据表
    },
    chaturl:'mongodb://chatname:collectionName@127.0.0.1:27017/chat', // 聊天数据表
	aoegmtoolurl:'mongodb://gmname:collectionName@127.0.0.1:27017/aoegmtool', // gmTool 数据表
  webaddr: 'http://ip:port' // 游戏服务器接口！！！！
  },
  admin: {
    name: 'you can guess',
    password: 'you can guess',
    admin: true,
    gamedata_itm: [],
    gamelog_itm: [],
    creator: "sys"
  },
  start: {
    ip: 'xx.xx.xx.xx',
    port: 3000,
    https: true,
    env: 'production'
  }
}
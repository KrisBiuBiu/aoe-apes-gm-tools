# Deployment instructions
1.npm install
2.Mongodb 请自行配置
3.执行
	Linux： start.sh
	Window: StartApp.bat

# Important Files

## About setting.js
这个配置里面很显然配置了游戏服务器接口，运维工具数据接口，具体的作用请看setting.js中的注释

## About game-menu.js --- API
这个文件是游戏服务器的部分接口，我只给一些不太重要的接口。
gamedata_link_urls 中的接口可以直接操作或修改一些玩家数据，方便测试人员使用
gamelog_link_urls 中的接口用来查询玩家的一些操作数据，比如上线时长、注册时间、充值记录、聊天记录等

参数说明：
	tg: '英文标题',
	ctx: 'API说明',
	result: '使用的View，可以到对应的view中查看',
	url: '运维工具请求路由',
	uri: '返回路由',
	proxy_path: '游戏数据接口',
	supercmd: '是否为超级命令，如果是超级命令，那么权限较低的用户也可以使用'
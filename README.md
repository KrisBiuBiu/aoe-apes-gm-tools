# 项目说明
**aoeGmTool**是我在游戏公司时，做的一个web工具。这个工具gamedata部分主要提供给测试人员使用，gamelog部分主要提供给策划人员使用。    
在**gamedata**使用了游戏开发人员提供的大量接口，这些接口与游戏接口并不完全相同，权限较高并且更加灵活，gamedata API可以绕过二级缓存，直接修改游戏中的资源和数据，不需要重启服务器，重要的是，这些接口只能由特定id的用户使用，在游戏服务器中会有权限验证，因此可以提供出来参考。  
在**gameLog**中，使用的API都是在当前服务器中新构建的，使用的数据库与游戏数据库基本一致，在这个模块中，可以看到很多游戏的统计数据，比如：日活、收入、玩家的一些行为轨迹等。  

# 架构说明
项目整体架构使用了Node的EXpress框架，Express是比较稳定的一个框架，而渲染模板使用了ejs，数据库使用的是mongodb。

为什么使用mongodb?  
因为在服务器与前端的通信中，我采用了JSON数据格式，这对mongodb很友好，使用不复杂的命令就可以得到想要的东西。

#文件说明#
+ cert - 有两个密钥，用于游戏服务器的通信和工具程序的启动，没有这两个东西，所有的请求都会被服务器拒绝。  
+ logs - 服务器的运行日志  
+ modules - 用来初始化工具用户数据，以及数据操作的函数原型(prototype);  
+ node_modules - 模块库  
+ public - 存放前端静态资源  
+ routes - 路由，用来处理请求。特别说明：mail.js是用来给用户发邮件的，这个邮件不是游戏内邮件。  
+ views - 渲染模板  

数据库
mongodb，为了安全性，为每一个数据库都配置了单独的账户密码和操作权限。

# Deployment instructions
1. npm install
2. Mongodb 请自行配置
3. 执行
	+ Linux： start.sh
	+ Window: StartApp.bat

# Important Files

## About setting.js
这个配置里面很显然配置了游戏服务器接口，运维工具数据接口，具体的作用请看setting.js中的注释

## About game-menu.js --- API
这个文件是游戏服务器的部分接口，我只给一些不太重要的接口。
gamedata_link_urls 中的接口可以直接操作或修改一些玩家数据，方便测试人员使用
gamelog_link_urls 中的接口用来查询玩家的一些操作数据，比如上线时长、注册时间、充值记录、聊天记录等

参数说明:
        tg:'英文标题'
	ctx: 'API说明',
	result: '使用的View，可以到对应的view中查看',
	url: '运维工具请求路由',
	uri: '返回路由',
	proxy_path: '游戏数据接口',
	supercmd: '是否为超级命令，如果是超级命令，那么权限较低的用户也可以使用'
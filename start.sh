#!/bin/bash
node app.js > logs/app.log 2>> logs/app.log &pid=$!
echo "$pid" > pid.app
echo "app Sever Process Id:$pid"

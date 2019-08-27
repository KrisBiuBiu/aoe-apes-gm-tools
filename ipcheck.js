"use strict";
var ips = require('ip');
exports.getAddr = function (ip) {
    //  var n =ips.toLong(ip)
    var buf = new Buffer(4);
    ips.toBuffer(ip, buf, 0);
    var a = buf[0];
    var b = buf[1];
    var c = buf[2];
    var d = buf[3];
    var ab = a * 0x100 + b;
    if (iptable.b[ab]) {
        return iptable.b[ab];
    }
    if (iptable.c[ab]) {
        for (var i = 0; i < iptable.c[ab].length; i++) {
            var p = iptable.c[ab][i];
            if (c >= p.a && c < p.b) {
                return p.c;
            }
        }
    }
    return '';
};
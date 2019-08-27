var ip2loc = require('ip2location-nodejs');
var path =require('path');
ip2loc.IP2Location_init(path.join(__dirname , "IP-COUNTRY-SAMPLE.BIN"));

// testip = ['8.8.8.8', '2404:6800:4001:c01::67', '2001:0200:0102:0000:0000:0000:0000:0000', '2001:0200:0135:0000:0000:0000:0000:0000', '2001:0200:017A:0000:0000:0000:0000:0000', '2404:6800:4001:c01::93', '::FFFF:8.8.8.8', '0000:0000:0000:0000:0000:FFFF:8.8.8.8', '::8.8.8.8.8'];
testip = ['8.8.8.8','36.68.111.228'];

for (var x = 0; x < testip.length; x++) {
	result = ip2loc.IP2Location_get_all(testip[x]);
	for (var key in result) {
		console.log(key + ": " + result[key]);
	}
	// console.log(result);
	console.log("--------------------------------------------------------------");
}

var geoip2 = require('geoip2');
geoip2.init("./GeoIP2-City.mmdb");
geoip2.lookupSimple("xx.xx.xx.xx", function(error, result) {
  if (error) {
    console.log("Error: %s", error);
  }
  else if (result) {
    console.log(result);
  }
});

var Ping = require('ping-lite');

var ping = new Ping('8.8.8.8');

ping.send(function(err, ms) {
  console.log(ping._host+' responded in '+ms+'ms.');
});

/*
var evilscan = require('evilscan')

var oOptions = {
  target: '22.176.4.0/24',
  port: '3032',
  status: 'TROU', // Timeout, Refused, Open, Unreachable
  banner: false
}

var oScanner = new evilscan(oOptions)

oScanner.on('start', function() {
  console.log('fnStartLocalNetworkMonitoring - start')
})

oScanner.on('result', function(data) {
// fired when item is matching options
  console.log('fnStartLocalNetworkMonitoring - result', data)

  if (data.status=="open") {
    //data.ip
  }
})

oScanner.on('error',function(err) {
  console.log('fnStartLocalNetworkMonitoring - error', err)
})

oScanner.on('done',function() {
  console.log('fnStartLocalNetworkMonitoring - done')
  /*
  setTimeout(function() {
      oScanner.run()
      //oThis.fnStartLocalNetworkMonitoring()
  }, iRetryTimeout)
  * /
})

oScanner.run()
*/
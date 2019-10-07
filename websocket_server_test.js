
const path = require('path')
const fs = require('fs')
const WebSocket = require('ws')

const oWSS = new WebSocket.Server({ port: 3032 })

var oBuffer = fs.readFileSync('app-icon.png')
var sBuffer = JSON.stringify(oBuffer)

var oNewBuffer = JSON.parse(sBuffer, (key, value) => {
  return value && value.type === 'Buffer' ?
    Buffer.from(value.data) :
    value;
});

console.log(oNewBuffer.length)

function fnSendObject(oWS, oObject)
{
  oWS.send(JSON.stringify(oObject))
}
 
function fnSendFile(oWS, sFilePath)
{
  var oBuffer = fs.readFileSync(sFilePath)
  var oData = {
    sType: "file",
    sFileName: path.basename(sFilePath),
    sPackedBuffer: JSON.stringify(oBuffer)
  }
  fnSendObject(oWS, oData)
}

function fnRecieveFile(oWS, oData)
{
  return JSON.parse(
    oData.sPackedBuffer, 
    (key, value) => {
      return value && value.type === 'Buffer' ?
        Buffer.from(value.data) :
        value;
    }
  )
}

oWSS.on('connection', (oWS) => {
  oWS.on('message', (sData) => {
    console.log('received: %s', sData)

    var oData = JSON.parse(sData)

    if (oData.sType === "file") {
      var oBuffer = fnRecieveFile(oWS, oData)
      console.log('recieved file', oData.sFileName, oBuffer.length)
    }
  })
})

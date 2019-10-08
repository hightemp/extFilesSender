const moment = require('moment')
const path = require('path')
const fs = require('fs')
const WebSocket = require('ws')
const md5 = require('md5')

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

function fnTimestampToDateTime(iTimestamp)
{
  return moment.unix(iTimestamp).format('YYYY-MM-DD HH:mm:ss')
}

function fnIntToSize(bytes, decimals = 2) 
{
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/*
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
*/
function fnSendFile(oWS, sFilePath)
{
  try {
    var oBuffer = fs.readFileSync(sFilePath)
    const oStats = fs.statSync(sFilePath);

    /**
      sFileName: 'test.txt',
      iSize: 100000,
      sSize: '',
      sStatus: 'wait',
      iSendAt: 1318781876,
      sSendAt: '',
      sMD5: '78e731027d8fd50ed642340b7c9a63b3'
      */

    var iCurrentTimestamp = moment().unix()
    var oFile = {
      sFileName: path.basename(sFilePath),
      iSize: oStats.size,
      sSize: fnIntToSize(oStats.size),
      sStatus: 'wait',
      iSendAt: iCurrentTimestamp,
      sSendAt: fnTimestampToDateTime(iCurrentTimestamp),
      sMD5: md5(oBuffer)
    }

    //this.fnAddFileToList(oFile, 'send', sAddress)

    var oData = {
      sType: "file",
      oFile,
      sPackedBuffer: JSON.stringify(oBuffer)
    }

    fnSendObject(oWS, oData)
  } catch(oError) {
    console.error(oError)
  }
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

var aStatuses = ['online', 'blocked', 'offline']

var oInfo = {
  sName: 'user',
  sStatus: 'online'
}

process.on('SIGINT', () => {
  console.log("Caught interrupt signal")
  process.exit()
})

oWSS.on('connection', (oWS) => {
  setInterval(() => {
    oInfo.sStatus = aStatuses.find((v, i, a) => i === Math.round(Math.random() * a.length))
    oInfo.sName = 'user' + Math.round(Math.random() * 100)

    fnSendObject(oWS, { 
      sType: "info",
      oInfo
    })
  }, 5000)

  setInterval(() => {
    fnSendFile(oWS, 'app-icon.png')
  }, 10000)

  oWS.on('message', (sData) => {
    console.log('received: %s', sData)

    var oData = JSON.parse(sData)

    if (oData.sType === "info") {
      console.log('recieved info', oData.oInfo)
      
      console.log('sending info', oInfo)
      fnSendObject(oWS, { 
        sType: "info",
        oInfo
      })
    }

    if (oData.sType === "file") {
      var oBuffer = fnRecieveFile(oWS, oData)
      console.log('recieved file', oData.sFileName, oBuffer.length)
    }
  })
})

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>

import fs from 'fs'
import os from 'os' 
import path from 'path'
import moment from 'moment'
import { Notify } from 'quasar'
const { ipcRenderer } = require('electron')
import Vue from 'Vue'
var evilscan = require('evilscan')

export default {
  name: 'App',

  data() 
  {
    return {
      sConfigurationFileName: 'config.json',
      sConfigurationDirPath: path.join(os.homedir(), '.appFilesSender'),
      sConfigurationFilePath: path.join(os.homedir(), '.appFilesSender', 'config.json'),

      oConfiguration: {
        sCurrentTab: '',
        bScanLocalNetworks: false,
        iUpdateConnectionsIntervalInSeconds: 2,

        sFilesDirPath: path.join(os.homedir(), '.appFilesSender', 'files'),

        oInfo: {
          sName: '',
          sStatus: 'online'
        },

        oCurrentComputer: {
          sSelectedInterface: '',
          iSelectedIPIndex: -1,
          sSelectedIP: '',
          oNetworkInterfaces: {

          }
        },

        oStatusStyles: {
          'offline': {
            sStyle: 'grey',
            sTabStyle: 'bg-grey-3',
            sName: 'Не в сети'
          },
          'blocked': {
            sStyle: 'red',
            sTabStyle: 'bg-red-3',
            sName: 'Заблокирован'
          },
          'online': {
            sStyle: 'green',
            sTabStyle: 'bg-green-3',
            sName: 'Доступен'
          }
        },

        oFilesStatusStyles: {
          'wait': {
            sStyle: 'blue',
            sName: 'Ожидает получения',
            sIcon: 'access_time'
          },
          'sending': {
            sStyle: 'orange',
            sName: 'Получается',
            sIcon: 'timelapse'
          },
          'error': {
            sStyle: 'red',
            sName: 'Ошибка',
            sIcon: 'error'
          },
          'saved': {
            sStyle: 'grey',
            sName: 'Получен',
            sIcon: 'cloud_download'
          },
          'sent': {
            sStyle: 'grey',
            sName: 'Отправлен',
            sIcon: 'send'
          }
        },

        oComputersList: {
          /*
          '192.168.1.1': {
            oInfo: {
              sName: 'test',
              sStatus: 'offline'
            },
            bAlert: true,
            aFiles: [
              {
                // sSendStatus: 'send', //'recieve'
                sFileName: 'test.txt',
                iSize: 100000,
                sSize: '',
                sStatus: 'wait',
                iSendAt: 1318781876,
                sSendAt: '',
                sMD5: '78e731027d8fd50ed642340b7c9a63b3'
              },
              {
                sFileName: 'test2.txt',
                iSize: 2000000,
                sSize: '',
                sStatus: 'error',
                iSendAt: 1318731876,
                sSendAt: '',
                sMD5: '78e731027d8fd50ed642340b7c9a63b3'
              },
              {
                sFileName: 'test4.txt',
                iSize: 40000000,
                sSize: '',
                sStatus: 'sending',
                iSendAt: 1318481876,
                sSendAt: '',
                sMD5: '78e731027d8fd50ed642340b7c9a63b3'
              },
              {
                sFileName: 'test3.txt',
                iSize: 30000000,
                sSize: '',
                sStatus: 'saved',
                iSendAt: 1318481876,
                sSendAt: '',
                sMD5: '78e731027d8fd50ed642340b7c9a63b3'
              }
            ]
          },
          '192.168.1.2': {
            sName: 'test2',
            sStatus: 'blocked',
            bAlert: false
          },
          '192.168.1.3': {
            sName: 'test3',
            sStatus: 'accessed',
            bAlert: false
          },
          */
        }
      }
    }
  },

  watch: {
    'oConfiguration.oComputersList'() {
      console.log('watch oConfiguration.oComputersList')

      this.fnSaveConfiguration()
    }
  },

  methods: {
    fnTimestampToDateTime(iTimestamp)
    {
      return moment.unix(iTimestamp).format('YYYY-MM-DD HH:mm:ss')
    },
    fnIntToSize(bytes, decimals = 2) 
    {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    fnNotify(oArguments)
    {
      console.log('fnNotify', oArguments)
      /*
      ipcRenderer.on('asynchronous-reply', (event, oArguments) => {
        console.log(arg) // prints "pong"
      })
      */
      ipcRenderer.send('notify-message', oArguments)
    },
    fnSaveConfiguration() 
    {
      console.log('fnSaveConfiguration', new Date())

      try {
        if (!fs.existsSync(this.sConfigurationDirPath)) {
          if (fs.mkdirSync(this.sConfigurationDirPath)) {
            console.log(this.sConfigurationDirPath + ' directory created')
          }
        }

        if (!fs.existsSync(this.oConfiguration.sFilesDirPath)) {
          if (fs.mkdirSync(this.oConfiguration.sFilesDirPath)) {
            console.log(this.oConfiguration.sFilesDirPath + ' directory created')
          }
        }

        fs.writeFileSync(this.sConfigurationFilePath, JSON.stringify(this.oConfiguration, null, 4))
      } catch (oException) {
        Notify.create({
          color: 'negative',
          message: `Не получается загрузить файл: ${oException.message}`,
          icon: 'report_problem'
        })
      }
    },
    fnLoadConfiguration() 
    {
      console.log('fnLoadConfiguration')

      try {
        var sConfigurationFileContents = fs.readFileSync(this.sConfigurationFilePath).toString()

        Vue.set(this, 'oConfiguration', Object.assign(this.oConfiguration, JSON.parse(sConfigurationFileContents)))
      } catch (oException) {
        console.error(oException.message, oException)

        Notify.create({
          color: 'warning',
          message: `Файл настроек ('${state.sConfigurationFilePath}') не был найден. Будет создан новый с настройками по умолчанию.`,
          icon: 'report_problem'
        })
      }
    },
    fnUpdateComputerListValues()
    {
      for (var sKey in this.oConfiguration.oComputersList) {
        for (var iIndex in this.oConfiguration.oComputersList[sKey].aFiles) {
          this.oConfiguration.oComputersList[sKey].aFiles[iIndex].sSize = this.fnIntToSize(this.oConfiguration.oComputersList[sKey].aFiles[iIndex].iSize)
          this.oConfiguration.oComputersList[sKey].aFiles[iIndex].sSendAt = this.fnTimestampToDateTime(this.oConfiguration.oComputersList[sKey].aFiles[iIndex].iSendAt)
        }
      }
    },
    fnUpdateNetworkInterfaces()
    {
      console.log('fnUpdateNetworkInterfaces')

      var oNetworkInterfaces = os.networkInterfaces()
      var oThis = this

      Object.keys(oNetworkInterfaces)
        .forEach(function (sInterfaceName) 
        {
          var alias = 0;

          oNetworkInterfaces[sInterfaceName]
            .forEach(function (oInterface) 
            {
              console.log('oInterface', sInterfaceName, oInterface)

              if ('IPv4' !== oInterface.family || oInterface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return
              }

              if (alias >= 1) {
                oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName].push(oInterface)
                // this single interface has multiple ipv4 addresses
                //console.log(sInterfaceName + ':' + alias, oInterface.address)
              } else {
                Vue.set(oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces, sInterfaceName, [])
                //oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName] = []
                oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName].push(oInterface)
                // this interface has only one ipv4 adress
                //console.log(sInterfaceName, oInterface.address)
              }
              ++alias
            })
        })
    },

    fnGetFirstInterface()
    {
      var aKeys = Object.keys(this.oConfiguration.oCurrentComputer.oNetworkInterfaces)

      if (!aKeys.length) {
        return '' // 'Нет сетевых интерфейсов'
      }

      return aKeys[0]
    },
    fnIfInterfaceHasIP(sInterfaceName, sIP)
    {
      if (!sInterfaceName) {
        return false
      }
      
      if (!sIP) {
        return false
      }

      var aInterface = this.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName]

      for (var oIP of aInterface) {
        if (oIP.address==sIP) {
          return true
        }
      }

      return false
    },
    fnGetFirstInterfaceIP(sInterfaceName='')
    {
      if (!sInterfaceName) {
        sInterfaceName = this.fnGetFirstInterface()
      }
      
      if (!sInterfaceName) {
        return '' // 'Нет сетевых интерфейсов'
      }

      var oIP = this.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName][0]

      return (oIP && oIP.address) || '' //'Нет IP'
    },
    fnGetCurrentInterface()
    {
      var oCurrentComputer = this.oConfiguration.oCurrentComputer

      console.log('fnGetCurrentInterface', oCurrentComputer.oNetworkInterfaces, oCurrentComputer.sSelectedInterface, oCurrentComputer.iSelectedIPIndex)

      var oInterface = oCurrentComputer.oNetworkInterfaces[oCurrentComputer.sSelectedInterface][oCurrentComputer.iSelectedIPIndex]

      if (!oInterface) {
        throw new Error("oInterface is undefined")
      }

      return oInterface
    },
    fnStartLocalNetworkMonitoring()
    {
      console.log('fnStartLocalNetworkMonitoring')

      if (!this.bScanLocalNetworks) {
        console.log('fnStartLocalNetworkMonitoring - !this.bScanLocalNetworks')
        return
      }

      var oThis = this
      var oInterface
      var iRetryTimeout = 5000

      try {
        oInterface = this.fnGetCurrentInterface()
      } catch(oError) {
        setTimeout(function() {
          oThis.fnStartLocalNetworkMonitoring()
        }, iRetryTimeout)

        return
      }

      console.log('fnStartLocalNetworkMonitoring - oInterface', oInterface)

      var oOptions = {
        target: oInterface.cidr,
        port: '3030',
        status: 'TROU', // Timeout, Refused, Open, Unreachable
        banner: true
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
        setTimeout(function() {
          oScanner.run()
          //oThis.fnStartLocalNetworkMonitoring()
        }, iRetryTimeout)
      })

      oScanner.run()     
    }
  },

  created()
  {
    console.log('App::created')

    window.oApplication = this

    var aComputersListKeys = Object.keys(this.oConfiguration.oComputersList)

    if (!this.oConfiguration.sCurrentTab && aComputersListKeys.length) {      
      Vue.set(this.oConfiguration, 'sCurrentTab', aComputersListKeys[0])
      //this.oConfiguration.sCurrentTab = aComputersListKeys[0]
    }
    if (!this.oConfiguration.sCurrentTab && !aComputersListKeys.length) {
      Vue.set(this.oConfiguration, 'sCurrentTab', 'current_user')
    }

    this.fnUpdateComputerListValues()
    this.fnUpdateNetworkInterfaces()

    var oInfo = this.oConfiguration.oInfo
    var oCurrentComputer = this.oConfiguration.oCurrentComputer

    if (!oInfo.sName) {
      Vue.set(oInfo, 'sName', os.userInfo().username)
      //oInfo.sName = os.userInfo().username
      console.log('!oInfo.sName', 'os.userInfo().username', oInfo.sName)
    }

    if (!oCurrentComputer.sSelectedInterface) {
      Vue.set(oCurrentComputer, 'sSelectedInterface', this.fnGetFirstInterface())
      //oCurrentComputer.sSelectedInterface = this.fnGetFirstInterface()
      console.log('!oCurrentComputer.sSelectedInterface', 'this.fnGetFirstInterface()', oCurrentComputer.sSelectedInterface)
    }

    if (!this.fnIfInterfaceHasIP(oCurrentComputer.sSelectedInterface, oCurrentComputer.sSelectedIP)) {
      Vue.set(oCurrentComputer, 'iSelectedIPIndex', 0)
      Vue.set(oCurrentComputer, 'sSelectedIP', this.fnGetFirstInterfaceIP(oCurrentComputer.sSelectedInterface))
      //oCurrentComputer.iSelectedIPIndex = 0
      //oCurrentComputer.sSelectedIP = this.fnGetFirstInterfaceIP(oCurrentComputer.sSelectedInterface)
      console.log('!fnIfInterfaceHasIP(oCurrentComputer.sSelectedInterface, oCurrentComputer.sSelectedIP)', 'this.fnGetFirstInterfaceIP(oCurrentComputer.sSelectedInterface)', oCurrentComputer.sSelectedIP)
    }

    this.fnStartLocalNetworkMonitoring()

    console.log('this.oConfiguration.sCurrentTab', this.oConfiguration.sCurrentTab)
  }
}
</script>

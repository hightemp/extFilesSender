<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>

import os from 'os' 
import path from 'path'
import moment from 'moment'
import { Notify } from 'quasar'
const { ipcRenderer } = require('electron')

export default {
  name: 'App',

  data() 
  {
    return {
      sConfigurationFileName: 'config.json',
      sConfigurationDirPath: path.join(os.homedir(), '.appFilesSender'),
      sConfigurationFilePath: path.join(os.homedir(), '.appFilesSender', 'config.json'),
      sFilesDirPath: path.join(os.homedir(), '.appFilesSender', 'files'),

      oConfiguration: {
        sCurrentTab: '',

        oCurrentComputer: {
          oNetworkInterfaces: {

          },
          sName: 'COMP'
        },

        oStatusStyles: {
          'offline': {
            sStyle: 'grey',
            sName: 'Не в сети'
          },
          'blocked': {
            sStyle: 'red',
            sName: 'Заблокирован'
          },
          'accessed': {
            sStyle: 'green',
            sName: 'Доступен'
          }
        },

        oFilesStatusStyles: {
          'wait': {
            sStyle: 'yellow',
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
            sName: 'Скачен',
            sIcon: 'cloud_download'
          }
        },

        oComputersList: {
          '192.168.1.1': {
            sName: 'test',
            sStatus: 'offline',
            bAlert: true,
            aFiles: [
              {
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

        if (!fs.existsSync(this.sFilesDirPath)) {
          if (fs.mkdirSync(this.sFilesDirPath)) {
            console.log(this.sFilesDirPath + ' directory created')
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
      var oNetworkInterfaces = os.networkInterfaces()
      var oThis = this

      Object.keys(oNetworkInterfaces)
        .forEach(function (sInterfaceName) 
        {
          var alias = 0;

          oNetworkInterfaces[sInterfaceName]
            .forEach(function (oInterface) 
            {
              if ('IPv4' !== oInterface.family || oInterface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return
              }

              if (alias >= 1) {
                oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName].push(oInterface.address)
                // this single interface has multiple ipv4 addresses
                //console.log(sInterfaceName + ':' + alias, oInterface.address)
              } else {
                oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName] = []
                oThis.oConfiguration.oCurrentComputer.oNetworkInterfaces[sInterfaceName].push(oInterface.address)
                // this interface has only one ipv4 adress
                //console.log(sInterfaceName, oInterface.address)
              }
              ++alias
            })
        })
    }
  },

  created()
  {
    console.log('App::created')

    window.oApplication = this

    var aComputersListKeys = Object.keys(this.oConfiguration.oComputersList)

    if (!this.oConfiguration.sCurrentTab && aComputersListKeys.length) {      
      this.oConfiguration.sCurrentTab = aComputersListKeys[0]
    }

    this.fnUpdateComputerListValues()
    this.fnUpdateNetworkInterfaces()

    console.log('this.oConfiguration.sCurrentTab', this.oConfiguration.sCurrentTab)
  }
}
</script>

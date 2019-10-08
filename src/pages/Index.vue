<template>
  <q-page class="flex row">
    <q-tabs
      v-model="oConfiguration.sCurrentTab"
      vertical
      class="col-2"
    >
      <q-tab 
        name="current_user" 
        :label="oConfiguration.oInfo.sName"
        no-caps
        dense
        :ripple="{center:true}"
      >
        {{oConfiguration.oCurrentComputer.sSelectedInterface}}<br>
        {{oConfiguration.oCurrentComputer.sSelectedIP}}
        <q-badge 
          :color="oConfiguration.oStatusStyles[oConfiguration.oInfo.sStatus].sStyle" 
          text-color="white"
        >
          {{ oConfiguration.oStatusStyles[oConfiguration.oInfo.sStatus].sName }}
        </q-badge>
      </q-tab>

      <q-separator/>

      <q-tab 
        v-for="(oItem, sAddress) in oConfiguration.oComputersList"
        :name="sAddress" 
        :label="oItem.oInfo.sName+' ('+sAddress+')'"
        no-caps
        dense
        :alert="oItem.bAlert ? 'red' : false"
        :ripple="{center:true}"
        :class="oConfiguration.oStatusStyles[oItem.oInfo.sStatus].sTabStyle"
      >
        <q-badge 
          :color="oConfiguration.oStatusStyles[oItem.oInfo.sStatus].sStyle" 
          text-color="white"
        >
          {{ oConfiguration.oStatusStyles[oItem.oInfo.sStatus].sName }}
        </q-badge>
      </q-tab>

      <q-separator/>

      <q-btn 
        flat 
        no-caps
        label="Добавить адрес" 
        class="full-width"
        icon="add"
        @click="fnShowAddAddressWindow"
      />

    </q-tabs>
    <q-tab-panels
      v-model="oConfiguration.sCurrentTab"
      animated
      transition-prev="jump-up"
      transition-next="jump-up"
      class="col-10"
    >
      <q-tab-panel 
        name="current_user" 
        class="column"
      >
        <div class="col-auto q-mb-md">
          <div class="text-h4 q-mb-md">{{oConfiguration.oInfo.sName}} ({{oConfiguration.oCurrentComputer.sSelectedInterface}} - {{oConfiguration.oCurrentComputer.sSelectedIP}})</div>

          <!-- q-input outlined v-model="sFilterFileText" label="Фильтр" /-->
        </div>
        <div class="col">
          <q-select v-model="oStatus" :options="aStatuses" label="Статус" />
          <q-input v-model="oConfiguration.sFilesDirPath" label="Путь куда будут сохраняться файлы">
            <template v-slot:prepend>
              <!--q-icon name="place" /-->
            </template>
            <template v-slot:append>
              <q-icon v-if="oConfiguration.sFilesDirPath==''" name="close" @click="oConfiguration.sFilesDirPath = ''" class="cursor-pointer" />
              <q-icon name="folder" @click="fnSelectFilesDirPath" style="cursor:pointer"/>
            </template>
          </q-input>
        </div>
      </q-tab-panel>
      <q-tab-panel 
        v-for="(oItem, sAddress) in oConfiguration.oComputersList"
        :name="sAddress" 
        class="column"
      >
        <div class="col-auto q-mb-md">
          <div class="text-h4 q-mb-md">{{ oItem.oInfo.sName }} ({{ sAddress }})</div>

          <div class="row">
            <div class="col-11">
              <q-input outlined v-model="sFilterFileText" label="Фильтр" />
            </div>
            <div class="col-1">
              <q-btn 
                flat 
                no-caps
                title="Отправить файлы" 
                class="full-width full-height"
                icon="send"
                @click="fnSendFiles(sAddress)"
              />
            </div>
          </div>
        </div>

        <q-scroll-area
          :thumb-style="oScrollAreaThumbStyle"
          :content-style="oScrollAreaContentStyle"
          :content-active-style="oScrollAreaContentActiveStyle"
          style=""
          class="col-10"
        >
          <q-list bordered separator>
            <q-item
              v-for="(oFile, iIndex) in fnReverseArray(oItem.aFiles)"
              clickable
              v-ripple
              v-if="fnFilterItem(oFile)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="oFile.sSendStatus == 'send' ? 'arrow_upward' : 'arrow_downward'" 
                />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ oFile.sFileName }}</q-item-label>
                <q-item-label caption lines="2">
                  Размер: {{ oFile.sSize }}
                  MD5: {{ oFile.sMD5 }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-item-label caption>{{ oFile.sSendAt }}</q-item-label>
                <q-icon 
                  :color="oConfiguration.oFilesStatusStyles[oFile.sStatus].sStyle" 
                  :name="oConfiguration.oFilesStatusStyles[oFile.sStatus].sIcon" 
                />
              </q-item-section>
            </q-item>

            <!--q-expansion-item popup icon="drafts" label="Draft" caption="Draft a new email">
              <q-separator />
              <q-card>
                <q-card-section>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
                  commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
                  eveniet doloribus ullam aliquid.
                </q-card-section>
              </q-card>
            </q-expansion-item-->
          </q-list>
        </q-scroll-area>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="bShowErrorWindow">
      <q-card>
        <q-card-section>
          <div class="text-h6">Ошибка</div>
        </q-card-section>

        <q-card-section>
          <q-avatar icon="error" color="" text-color="negative" />
          {{ sErrorWindowMessage }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="bShowAddAddressWindow">
      <q-card>
        <q-card-section>
          <div class="text-h6">Добавить адрес</div>
        </q-card-section>

        <q-separator />

        <q-card-section style="max-height: 50vh" class="scroll">
          <q-input v-model="oShowAddAddressWindowForm.sIP" label="IP Адрес" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn flat label="Добавить" color="primary" v-close-popup @click="fnAddAddress"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>

import fs from 'fs'
import moment from 'moment'
import _ from 'lodash'
import Vue from 'Vue'
import path from 'path'
import md5 from 'md5'

const { dialog } = require('electron').remote

export default {
  name: 'PageIndex',

  data()
  {
    return {
      sStatus: '',
      sCurrentTab: '',
      sFilterFileText: '',

      bShowAddAddressWindow: false,
      oShowAddAddressWindowForm: {
        sIP: ''
      },

      bShowErrorWindow: false,

      sErrorWindowMessage: '',

      oConnections: {

      },

      oScrollAreaThumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75
      },
      oScrollAreaContentStyle: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555'
      },
      oScrollAreaContentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      }
    }
  },

  computed: {
    oConfiguration: {
      get()
      {
        return oApplication.oConfiguration
      },
      set(oValue)
      {
        Vue.set(oApplication, 'oConfiguration', oValue)
      },
      cache: false
    },
    oStatus: {
      get()
      {
        console.log('oStatus - get')
        return this.aStatuses.find((v) => v.value==this.oConfiguration.oInfo.sStatus)
      },
      set(oValue)
      {
        console.log('oStatus - set', oApplication.oConfiguration.oInfo, oValue)
        Vue.set(oApplication.oConfiguration.oInfo, 'sStatus', oValue.value)

        this.fnSendInfoToAll()
      },
      cache: false
    },
    aStatuses: {
      get()
      {
        var aResult = []

        for (var sKey in oApplication.oConfiguration.oStatusStyles) {
          aResult.push({
            label: oApplication.oConfiguration.oStatusStyles[sKey].sName,
            value: sKey
          })          
        }

        return aResult
      }
    }
  },

  methods: {
    fnSelectFilesDirPath()
    {
      var aSelectedPaths = dialog.showOpenDialog({ 
        title: "Выбрать папку для сохранения файлов",
        //defaultPath: '',
        properties: ['openDirectory', 'createDirectory '] 
      })

      if (!aSelectedPaths) {
        return
      }

      oApplication.oConfiguration.sFilesDirPath = aSelectedPaths[0]
    },
    fnSendFiles(sAddress)
    {
      var aSelectedPaths = dialog.showOpenDialog({ 
        title: "Отправить файлы",
        //defaultPath: '',
        properties: ['openFile', 'multiSelections'] 
      })

      if (!aSelectedPaths) {
        return
      }

      var oThis = this

      aSelectedPaths.forEach((sFilePath) => {
        oThis.fnSendFile(sFilePath, sAddress)
      })
    },
    fnShowErrorMessage(sErrorWindowMessage)
    {
      this.bShowErrorWindow = true
      this.sErrorWindowMessage = sErrorWindowMessage
    },
    fnAddAddress()
    {
      var sAddress = this.oShowAddAddressWindowForm.sIP
      
      if (this.oConfiguration.oComputersList[sAddress]) {
        return this.fnShowErrorMessage(`Адрес '${sAddress}' уже есть в списке`)
      }

      Vue.set(this.oConfiguration.oComputersList, sAddress, {
        oInfo: {
          sName: '',
          sStatus: 'offline',
        },
        bAlert: false,
        aFiles: []
      })

      this.fnUpdateConncetions()
    },
    fnShowAddAddressWindow()
    {
      this.oShowAddAddressWindowForm.sIP = ''
      this.bShowAddAddressWindow = true
    },
    fnFilterItem(oItem)
    {
      console.log('fnFilterItem')

      if (!this.sFilterFileText.trim().length) {
        return true
      }

      for (var sKey in oItem) {
        if (_.isArray(oItem[sKey]) || _.isObject(oItem[sKey])) {
          if (fnFilterItem(oItem[sKey])) {
            return true
          }
        } else {          
          if (sKey.indexOf("s") == 0 && (oItem[sKey]+"").toLowerCase().indexOf(this.sFilterFileText.toLowerCase()) != -1) {            
            return true
          }
        }
      }
      
      return false
    },
    fnReverseArray(aArray)
    {
      console.log('fnReverseArray', aArray)

      return (aArray || []).slice().reverse()
    },
    fnSendObject(sAddress, oObject)
    {
      var oWebSocket = this.fnConnect(sAddress)

      oWebSocket.send(JSON.stringify(oObject))
    },
    fnSendFile(sFilePath, sAddress)
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
          sSize: oApplication.fnIntToSize(oStats.size),
          sStatus: 'wait',
          iSendAt: iCurrentTimestamp,
          sSendAt: oApplication.fnTimestampToDateTime(iCurrentTimestamp),
          sMD5: md5(oBuffer)
        }

        this.fnAddFileToList(oFile, 'send', sAddress)

        var oData = {
          sType: "file",
          oFile,
          sPackedBuffer: JSON.stringify(oBuffer)
        }

        this.fnSendObject(sAddress, oData)
      } catch(oError) {
        console.error(oError)
      }
    },
    fnAddFileToList(oFile, sSendStatus, sAddress)
    {
      console.log('fnAddFileToList', oFile, sSendStatus, sAddress)

      var oFileCopy = Object.assign({ sSendStatus }, oFile)

      if (!this.oConfiguration.oComputersList[sAddress]) {
        console.error('!this.oConfiguration.oComputersList[sAddress]')
        return
      }

      this.oConfiguration.oComputersList[sAddress].aFiles.push(oFileCopy)
    },
    fnSendObject(oWS, oObject)
    {
      oWS.send(JSON.stringify(oObject))
    },
    fnSendObjectToAll(oObject)
    {
      for (var sAddress in this.oConnections) {
        this.fnSendObject(this.oConnections[sAddress], oObject)
      }
    },
    fnSendInfo(oWS)
    {
      var oInfo = this.oConfiguration.oInfo

      this.fnSendObject(oWS, {
        sType: "info",
        oInfo
      })
    },
    fnSendInfoToAll()
    {
      var oInfo = this.oConfiguration.oInfo

      this.fnSendObjectToAll({
        sType: "info",
        oInfo
      })
    },
    fnConnect(sAddress)
    {
      if (this.oConnections[sAddress]) {
        //delete this.oConnections[sAddress]
        return this.oConnections[sAddress]
      }

      var oThis = this
      var oWebSocket = new WebSocket(`ws://${sAddress}:3032`)

      var oInfo = this.oConfiguration.oInfo

      oWebSocket.onopen = function () {
        oThis.fnSendInfo(oWebSocket)
      }

      oWebSocket.onmessage = function (oEvent) {
        console.log('oWebSocket onmessage oEvent.data', oEvent.data)

        var oData = JSON.parse(oEvent.data)

        if (oData.sType === "info") {
          console.log('recieved info', oData.oInfo)

          var oClientInfo = {
            sName: '',
            sStatus: 'offline',
          }

          oClientInfo = Object.assign(oClientInfo, oData.oInfo)

          Vue.set(oApplication.oConfiguration.oComputersList[sAddress], 'oInfo', oClientInfo)
          oThis.$forceUpdate()

          console.log('recieved info -> ', sAddress, oThis.oConfiguration.oComputersList[sAddress])
        }

        if (oData.sType === "file") {
          console.log('recieved file', oData.oFile)

          var oClientFile = {
            sFileName: '',
            iSize: 0,
            sSize: '',
            sStatus: 'wait',
            iSendAt: 0,
            sSendAt: '',
            sMD5: ''
          }

          oClientFile = Object.assign(oClientFile, oData.oFile)

          oThis.fnAddFileToList(oClientFile, 'recieve', sAddress)

          oApplication.oConfiguration.oComputersList[sAddress].aFiles.push(oClientFile)
          oThis.$forceUpdate()

          console.log('recieved file -> ', sAddress, oThis.oConfiguration.oComputersList[sAddress])
        }
      }

      oWebSocket.onerror = function() {
        console.log('oWebSocket onerror')

        Vue.set(oApplication.oConfiguration.oComputersList[sAddress].oInfo, 'sStatus', 'offline')
        oThis.$forceUpdate()
      }

      oWebSocket.onclose = function(eventclose) {
        console.log('oWebSocket соеденение закрыто причина: ' + this.eventclose)

        Vue.delete(oThis.oConnections, sAddress)

        oThis.fnUpdateConncetions()
      }

      return oWebSocket
    },
    fnUpdateConncetions()
    {
      for (var sAddress in this.oConfiguration.oComputersList) {
        var oWebSocket = this.fnConnect(sAddress)

        Vue.set(this.oConnections, sAddress, oWebSocket)
      }
    }
  },

  created()
  {
    
  },

  mounted()
  {
    var oThis = this

    setInterval(
      () => {
        oThis.fnUpdateConncetions()
      }, 
      this.oConfiguration.iUpdateConnectionsIntervalInSeconds*1000
    )
  }
}
</script>

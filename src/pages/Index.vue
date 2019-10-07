<template>
  <q-page class="flex row">
    <q-tabs
      v-model="oConfiguration.sCurrentTab"
      vertical
      class="col-2"
    >
      <q-tab 
        name="current_user" 
        :label="oConfiguration.oCurrentComputer.sName"
        no-caps
        dense
        :ripple="{center:true}"
      >
        {{oConfiguration.oCurrentComputer.sSelectedInterface}}<br>
        {{oConfiguration.oCurrentComputer.sSelectedIP}}
      </q-tab>

      <q-separator/>

      <q-tab 
        v-for="(oItem, sKey) in oConfiguration.oComputersList"
        :name="sKey" 
        :label="oItem.sName+' ('+sKey+')'"
        no-caps
        dense
        :alert="oItem.bAlert ? 'red' : false"
        :ripple="{center:true}"
        :class="oConfiguration.oStatusStyles[oItem.sStatus].sTabStyle"
      >
        <q-badge 
          :color="oConfiguration.oStatusStyles[oItem.sStatus].sStyle" 
          text-color="white"
        >
          {{ oConfiguration.oStatusStyles[oItem.sStatus].sName }}
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
          <div class="text-h4 q-mb-md">{{oConfiguration.oCurrentComputer.sName}} ({{oConfiguration.oCurrentComputer.sSelectedInterface}} - {{oConfiguration.oCurrentComputer.sSelectedIP}})</div>

          <!-- q-input outlined v-model="sFilterFileText" label="Фильтр" /-->
        </div>
      </q-tab-panel>
      <q-tab-panel 
        v-for="(oItem, sKey) in oConfiguration.oComputersList"
        :name="sKey" 
        class="column"
      >
        <div class="col-auto q-mb-md">
          <div class="text-h4 q-mb-md">{{ oItem.sName }} ({{ sKey }})</div>

          <q-input outlined v-model="sFilterFileText" label="Фильтр" />
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

import moment from 'moment'
import _ from 'lodash'
import Vue from 'Vue'

export default {
  name: 'PageIndex',

  data()
  {
    return {
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
    }
  },

  methods: {
    fnShowErrorMessage(sErrorWindowMessage)
    {
      this.bShowErrorWindow = true
      this.sErrorWindowMessage = sErrorWindowMessage
    },
    fnAddAddress()
    {
      if (this.oComputersList[this.oShowAddAddressWindowForm.sIP]) {
        this.fnShowErrorMessage("Адрес уже добавлен")
      }
      this.oShowAddAddressWindowForm.sIP
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
    fnSendFile(sFilePath, sAddress)
    {
      var oWebSocket = this.fnConnect(sAddress)

      oWebSocket.send(sFilePath)
    },
    fnConnect(sAddress)
    {
      if (this.oConnections[sAddress]) {
        //delete this.oConnections[sAddress]
        return this.oConnections[sAddress]
      }

      //var oWebSocket = new WebSocket(`ws://${sAddress}:3030`)
      var oWebSocket = new WebSocket(`ws://127.0.0.1:3030`)

      oWebSocket.onopen = function () {
        oWebSocket.send('oWebSocket onopen')
      }

      oWebSocket.onmessage = function (oEvent) {
        console.log('oWebSocket onmessage oEvent.data', oEvent.data)
      }

      oWebSocket.onerror = function() {
        console.log('oWebSocket onerror')
      }

      oWebSocket.onclose = function(eventclose) {
        console.log('oWebSocket соеденение закрыто причина: ' + this.eventclose)

        Vue.delete(this.oConnections, sAddress)

        this.fnUpdateConncetions()
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
    this.fnUpdateConncetions()
  }
}
</script>

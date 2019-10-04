<template>
  <q-page class="flex row">
    <q-tabs
      v-model="oConfiguration.sCurrentTab"
      vertical
      class="col-2"
    >
      <q-tab 
        :name="oConfiguration.oCurrentComputer.sName" 
        :label="oConfiguration.oCurrentComputer.sName+' ('+fnFirstIP()+')'"
        no-caps
        dense
        :ripple="{center:true}"
      >
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
      >
        <q-badge 
          :color="oConfiguration.oStatusStyles[oItem.sStatus].sStyle" 
          text-color="white"
        >
          {{ oConfiguration.oStatusStyles[oItem.sStatus].sName }}
        </q-badge>
      </q-tab>
    </q-tabs>
    <q-tab-panels
      v-model="oConfiguration.sCurrentTab"
      animated
      transition-prev="jump-up"
      transition-next="jump-up"
      class="col-10"
    >
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
  </q-page>
</template>

<script>

import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'PageIndex',

  data()
  {
    return {
      sCurrentTab: '',
      sFilterFileText: '',

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
    fnAllIPs()
    {
      return (this.oConfiguration.oCurrentComputer.oNetworkInterfaces || [])
    },
    fnFirstIP()
    {
      return (this.fnAllIPs()[0] || '')
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
    fnSendFile(sFilePath)
    {
      const ws = new WebSocket('ws://127.0.0.1:3030')
 
      ws.on('open', function open() {
        ws.send('something')
      })
      
      ws.on('message', function incoming(data) {
        console.log(data)
      })
    },
    fnUpdateConncetions()
    {
      /*
      Vue.set(this.oConnections, , {})
      this.ws = new WebSocket('ws://localhost:8081/ws');
      this.ws.onopen = function() {
        console.log('WS подключенно')
      };
      this.ws.onclose = function(eventclose) {
        console.log('соеденение закрыто причина: ' + this.eventclose)
      }
      this.ws.onmessage = function(msg) {
        console.log('Сообщение ' + this.msg)
      } 
      */     
    }
  },

  created()
  {
    
  },

  mounted()
  {
    this.fnSendFile()
  }
}
</script>

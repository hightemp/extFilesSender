// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

var path = require('path')

module.exports = function (ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [
      'VueNativeSock.js',
      'filter_reverse.js'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.sass'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v4',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      // iconSet: 'ionicons-v4', // Quasar icon set
      // lang: 'de', // Quasar language pack

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      all: 'auto',

      components: [
        //'QBadge',
      ],

      directives: [
        'Ripple'
      ],

      // Quasar plugins
      plugins: [
        'Notify'
      ]
    },

    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ie
    supportIE: false,

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      scopeHoisting: true,
      // vueRouterMode: 'history',
      // showProgress: false,
      // gzip: true,
      // analyze: true,
      // preloadChunks: false,
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack (cfg) {
        //cfg.resolve.mainFields = ['main', 'browser']
        /*
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            formatter: require('eslint').CLIEngine.getFormatter('stylish')
          }
        })
        */
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          '~': path.resolve(__dirname, './src')
        }
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.txt$/i,
          loader: 'raw-loader'
        })
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            formatter: require('eslint').CLIEngine.getFormatter('stylish')
          }
        })
        const CopyWebpackPlugin = require('copy-webpack-plugin')
        cfg.plugins.push(
          new CopyWebpackPlugin([
            {
              from: 'extension/manifest.json',
              to: cfg.output.path
            },
            {
              from: 'extension/background.js',
              to: cfg.output.path + '/js'
            }
          ])
        )
        /*
        cfg.module.rules.push({
          test: /\.svg$/,
          loader: 'vue-svg-loader',
          exclude: /node_modules/
        })
        */       
      }
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {}, // only for NON InjectManifest
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar App',
        // description: 'A Quasar Framework app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-16x16.png',
            'sizes': '16x16',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-48x48.png',
            'sizes': '48x48',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },

    // https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // id: 'org.app_files_sender.app',
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // bundler: 'builder', // or 'packager'

      extendWebpack (cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        "productName": "appFilesSender",
        
        "appId": "com.hightemp.appFilesSender",
        "copyright": "",
        "directories": {
          "output": "releases"
        },
        "mac": {
          "target": [
            "dmg",
            "pkg",
            "zip"
          ],
          "category": "public.app-category.utilities",
          "type": "distribution"
        },
        "dmg": {
          "iconSize": 160,
          "iconTextSize": 12,
          "window": {
            "width": 660,
            "height": 400
          },
          "contents": [
            {
              "x": 180,
              "y": 170,
              "type": "file"
            },
            {
              "x": 480,
              "y": 170,
              "type": "link",
              "path": "/Applications"
            }
          ]
        },
        "pkg": {
        },
        "win": {
          "target": [
            "nsis",
            "portable",
            "zip"
          ],
        },
        "nsis": {
          "warningsAsErrors": false
        },
        "linux": {
          "target": [
            "AppImage",
            "deb",
            "rpm",
            "snap"
          ],
          "category": "Utility"
        },
        "snap": {
          "grade": "stable",
          "summary": ""
        },
        "publish": {
          "provider": "github",
          "owner": "appAvtoExpressDocumentsViewer",
          "releaseType": "release",
          "publishAutoUpdate": false
        }
      }
    }
  }
}

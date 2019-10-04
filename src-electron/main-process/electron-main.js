import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, Notification  } from 'electron'

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

ipcMain.on('notify-message', (oEvent, oArgs) => {
  //console.log('notify-message', oEvent, oArgs)
  //event.reply('asynchronous-reply', 'pong')
  (new Notification(oArgs)).show()
})

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 3030 });
 
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
 
  ws.send('something');
});

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  //var oImageBuffer = Buffer.from(require('!!raw-loader!../icons/linux-32x32.png').default, "binary")

  //var oNativeImage = nativeImage.createFromBuffer(oImageBuffer)
  var oNativeImage = nativeImage.createFromDataURL("data:image/png;base64,"+require('!!raw-loader!./icon-base64.txt').default)

  let tray = null
  tray = new Tray(oNativeImage)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Принимать файлы', type: 'radio', checked: true },
    { label: 'Не принимать файлы', type: 'radio' },
    {
      type: 'separator'
    },
    { label: 'Показать окно', role: 'show_window' },
    {
      type: 'separator'
    },
    { label: 'Выйти', role: 'quit' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

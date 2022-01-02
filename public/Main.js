const {app, BrowserWindow} = require('electron')
const path = require('path')
function createWindow () {
    require('@electron/remote/main').initialize()
    let mainWindow = new BrowserWindow
    ({
        width: 500,
        height: 718,
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // uncomment for exporting, comment out when developing
    mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

    // uncomment for developing, comment out when exporting
    // mainWindow.webContents.openDevTools()
    // mainWindow.loadURL('http://localhost:3000/')
}
    app.on('ready', createWindow)
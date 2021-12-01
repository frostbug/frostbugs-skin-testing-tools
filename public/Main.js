const {app, BrowserWindow} = require('electron')
const path = require('path')
function createWindow () {

    mainWindow = new BrowserWindow
    ({
        width: 500,
        height: 744,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    })

    // uncomment for exporting, comment out when developing
    // win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

    // uncomment for developing, comment out when exporting
    mainWindow.loadURL('http://localhost:3000/')
}
    app.on('ready', createWindow)
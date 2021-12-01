const {app, BrowserWindow} = require('electron')
function createWindow () {
    require('@electron/remote/main').initialize()
    mainWindow = new BrowserWindow
    ({
        width: 500,
        height: 744,
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // uncomment for exporting, comment out when developing
    // win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

    // uncomment for developing, comment out when exporting
    mainWindow.loadURL('http://localhost:3000/')
}
    app.on('ready', createWindow)
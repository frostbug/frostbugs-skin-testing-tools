const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
app.disableHardwareAcceleration()
function createWindow () {
    require('@electron/remote/main').initialize()
    let mainWindow = new BrowserWindow
    ({
        width: 600,
        height: 860,
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'frostbug.ico'),
    })

    // uncomment for exporting, comment out when developing
    // mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

    // uncomment for developing, comment out when exporting
    // mainWindow.webContents.openDevTools()
    mainWindow.loadURL('http://localhost:3000/')
    const options = {
        type: 'question',
        buttons: ['Cancel', 'Yes, please', 'No, thanks'],
        defaultId: 2,
        title: 'Question',
        message: 'Do you want to do this?',
        detail: 'It does not really matter',
        checkboxLabel: 'Remember my answer',
        checkboxChecked: true,
    };
}
    app.on('ready', createWindow)